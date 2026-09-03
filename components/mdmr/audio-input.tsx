'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Check, Loader2 } from 'lucide-react'
import type { TransactionCategory } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

interface AudioInputProps {
  onTransactionExtracted: (data: { value: number; category: TransactionCategory; description: string }) => void
}

type AudioState = 'idle' | 'recording' | 'processing' | 'result' | 'error'

interface SpeechRecognitionResult {
  readonly isFinal: boolean; readonly length: number
  item(index: number): SpeechRecognitionAlternative; [index: number]: SpeechRecognitionAlternative
}
interface SpeechRecognitionAlternative { readonly transcript: string }
interface SpeechRecognitionResultList { readonly length: number; item(index: number): SpeechRecognitionResult; [index: number]: SpeechRecognitionResult }
interface SpeechRecognitionEvent extends Event { readonly resultIndex: number; readonly results: SpeechRecognitionResultList }
interface SpeechRecognitionErrorEvent extends Event { readonly error: string }
interface SpeechRecognition extends EventTarget {
  continuous: boolean; interimResults: boolean; lang: string
  onstart: (() => void) | null; onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null; onend: (() => void) | null
  start(): void; stop(): void
}
interface SpeechRecognitionConstructor { new(): SpeechRecognition }
declare global {
  interface Window { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
}

function parseTranscription(text: string): { value: number; category: TransactionCategory; description: string } | null {
  const normalized = text.toLowerCase().trim()
  const valueMatch = normalized.match(/(\d+[.,]?\d{0,2})/)
  if (!valueMatch) return null
  const value = Number(valueMatch[1].replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return null
  const categoryMap = [
    { keywords: ['gasolina','etanol','diesel','combustivel','posto'], category: 'combustivel' as TransactionCategory, description: 'Combustivel' },
    { keywords: ['uber','onibus','ônibus','metro','metrô','taxi'], category: 'transporte' as TransactionCategory, description: 'Transporte' },
    { keywords: ['mercado','comida','almoco','almoço','janta','sushi','lanche','restaurante'], category: 'alimentacao' as TransactionCategory, description: 'Alimentacao' },
    { keywords: ['netflix','cinema','show','bar','lazer','jogo'], category: 'lazer' as TransactionCategory, description: 'Lazer' },
    { keywords: ['curso','livro','faculdade','escola','educacao','educação'], category: 'educacao' as TransactionCategory, description: 'Educacao' },
    { keywords: ['farmacia','farmácia','medico','médico','saude','saúde'], category: 'saude' as TransactionCategory, description: 'Saude' },
    { keywords: ['aluguel','condominio','condomínio','agua','água','luz','internet'], category: 'moradia' as TransactionCategory, description: 'Moradia' },
  ]
  const detected = categoryMap.find(item => item.keywords.some(k => normalized.includes(k)))
  if (detected) return { value, category: detected.category, description: detected.description }
  return { value, category: 'outros', description: 'Despesa por voz' }
}

export function AudioInput({ onTransactionExtracted }: AudioInputProps) {
  const [state, setState] = useState<AudioState>('idle')
  const [transcription, setTranscription] = useState('')
  const [extractedData, setExtractedData] = useState<{ value: number; category: TransactionCategory; description: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isStoppingRef = useRef(false)
  const transcriptionRef = useRef('')

  useEffect(() => {
    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!RecognitionCtor) return
    const r = new RecognitionCtor()
    r.lang = 'pt-BR'; r.continuous = false; r.interimResults = true

    r.onstart = () => {
      isStoppingRef.current = false; setErrorMessage(''); setState('recording')
      setTranscription(''); transcriptionRef.current = ''; setExtractedData(null)
    }
    r.onresult = (event) => {
      let fullText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) fullText += event.results[i][0].transcript
      transcriptionRef.current = fullText.trim(); setTranscription(fullText.trim())
    }
    r.onerror = (event) => {
      if (event.error === 'aborted' && isStoppingRef.current) return
      setState('error'); setErrorMessage('Nao foi possivel capturar audio. Tente novamente.')
    }
    r.onend = () => {
      if (isStoppingRef.current) return
      setState('processing')
      const parsed = parseTranscription(transcriptionRef.current)
      if (!parsed) { setState('error'); setErrorMessage('Nao entendi o valor. Fale: "Gastei 25 reais de uber".'); return }
      setExtractedData(parsed); setState('result')
    }
    recognitionRef.current = r
    return () => {
      r.onstart = null; r.onresult = null; r.onerror = null; r.onend = null; try { r.stop() } catch {}
    }
  }, [])

  const handleRecord = () => {
    if (state === 'idle') {
      const r = recognitionRef.current
      if (!r) { setState('error'); setErrorMessage('Seu navegador nao suporta cadastro por voz.'); return }
      try { r.start() } catch { setState('error'); setErrorMessage('Nao foi possivel iniciar o microfone.') }
      return
    }
    if (state === 'recording') { isStoppingRef.current = false; recognitionRef.current?.stop() }
  }

  const handleConfirm = () => {
    if (!extractedData) return
    onTransactionExtracted(extractedData)
    setState('idle'); setTranscription(''); transcriptionRef.current = ''; setExtractedData(null)
  }

  const handleCancel = () => {
    isStoppingRef.current = true; recognitionRef.current?.stop()
    setState('idle'); setTranscription(''); transcriptionRef.current = ''; setExtractedData(null); setErrorMessage('')
  }

  const isRecording = state === 'recording'

  return (
    <>
      {/* Floating mic button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleRecord}
        className={`fixed bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] left-1/2 z-40 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full transition-all ${
          isRecording
            ? 'glass-strong text-vanessa-danger shadow-[0_0_24px_rgba(180,50,50,0.4)] ring-[1.5px] ring-vanessa-danger/50'
            : 'glass-strong shadow-[0_0_20px_oklch(0.42_0.12_150/0.25)] ring-1 ring-white/[0.12] hover:ring-vanessa-lavender/40 md:bottom-8'
        }`}
        aria-label={isRecording ? 'Parar gravacao' : 'Iniciar gravacao'}
      >
        {isRecording ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <Mic className="h-6 w-6" />
          </motion.div>
        ) : state === 'processing' ? (
          <Loader2 className="h-6 w-6 animate-spin text-vanessa-lavender" />
        ) : (
          <MicOff className="h-6 w-6 text-muted-foreground" />
        )}
      </motion.button>

      {/* Pulsing rings (recording) */}
      <AnimatePresence>
        {isRecording &&
          [0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.6], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.6, ease: 'easeOut' }}
              className="fixed left-1/2 z-30 h-16 w-16 -translate-x-1/2 rounded-full border border-vanessa-danger/40"
              style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)' }}
            />
          ))}
      </AnimatePresence>

      {/* Result overlay */}
      <AnimatePresence>
        {(state === 'processing' || state === 'result' || state === 'error') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="glass-strong w-full rounded-t-3xl p-6 pb-10"
            >
              {state === 'processing' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-vanessa-lavender" />
                  <p className="text-sm text-muted-foreground">Processando audio...</p>
                  {transcription && (
                    <p className="text-center text-sm italic text-muted-foreground">"{transcription}"</p>
                  )}
                </div>
              )}

              {state === 'error' && (
                <div className="flex flex-col gap-5">
                  <p className="text-center text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Erro no Audio
                  </p>
                  <p className="text-center text-sm text-muted-foreground">{errorMessage}</p>
                  <button
                    onClick={handleCancel}
                    className="btn-primary rounded-2xl py-3.5 text-sm font-semibold"
                  >
                    Entendi
                  </button>
                </div>
              )}

              {state === 'result' && extractedData && (
                <div className="flex flex-col gap-5">
                  <p className="text-center text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Transacao Extraida
                  </p>
                  {transcription && (
                    <p className="text-center text-sm italic text-muted-foreground/70">"{transcription}"</p>
                  )}
                  <div className="glass-card mx-auto w-full max-w-xs rounded-2xl p-5">
                    {[
                      { label: 'Valor', value: `R$ ${extractedData.value.toFixed(2)}` },
                      { label: 'Categoria', value: CATEGORY_LABELS[extractedData.category] },
                      { label: 'Tipo', value: 'Saida' },
                    ].map((row, i) => (
                      <div key={row.label}>
                        {i > 0 && <div className="my-3 h-px bg-white/[0.06]" />}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{row.label}</span>
                          <span className="text-sm font-semibold text-foreground">{row.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="glass-card flex-1 rounded-2xl py-3.5 text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold"
                    >
                      <Check className="h-4 w-4" />
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
