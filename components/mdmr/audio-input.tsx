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
  onstart: (() => void) | null; onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null; onend: (() => void) | null
  start(): void; stop(): void
}
interface SpeechRecognitionConstructor { new (): SpeechRecognition }
declare global {
  interface Window { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
}

function parseTranscription(text: string): { value: number; category: TransactionCategory; description: string } | null {
  const normalized = text.toLowerCase().trim()
  const valueMatch = normalized.match(/(\d+[.,]?\d{0,2})/)
  if (!valueMatch) return null
  const value = Number(valueMatch[1].replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return null
  const categoryMap: Array<{ keywords: string[]; category: TransactionCategory; description: string }> = [
    { keywords: ['gasolina','etanol','diesel','combustivel','combustível','posto'], category: 'combustivel', description: 'Combustivel' },
    { keywords: ['uber','onibus','ônibus','metro','metrô','taxi'], category: 'transporte', description: 'Transporte' },
    { keywords: ['mercado','comida','almoco','almoço','janta','sushi','lanche','restaurante'], category: 'alimentacao', description: 'Alimentacao' },
    { keywords: ['netflix','cinema','show','bar','lazer','jogo'], category: 'lazer', description: 'Lazer' },
    { keywords: ['curso','livro','faculdade','escola','educacao','educação'], category: 'educacao', description: 'Educacao' },
    { keywords: ['farmacia','farmácia','medico','médico','saude','saúde'], category: 'saude', description: 'Saude' },
    { keywords: ['aluguel','condominio','condomínio','agua','água','luz','internet'], category: 'moradia', description: 'Moradia' },
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
    const Recognizer = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognizer) return
    const r = new Recognizer()
    r.lang = 'pt-BR'; r.continuous = false; r.interimResults = true

    r.onstart = () => { isStoppingRef.current = false; setErrorMessage(''); setState('recording'); setTranscription(''); transcriptionRef.current = ''; setExtractedData(null) }
    r.onresult = ev => {
      let fullText = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) fullText += ev.results[i][0].transcript
      transcriptionRef.current = fullText.trim(); setTranscription(fullText.trim())
    }
    r.onerror = ev => {
      if (ev.error === 'aborted' && isStoppingRef.current) return
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
    return () => { r.onstart = null; r.onresult = null; r.onerror = null; r.onend = null; try { r.stop() } catch {} }
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
      {/* Floating mic FAB */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.07 }}
        onClick={handleRecord}
        className="fixed z-40 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
          left: '50%', transform: 'translateX(-50%)',
          background: isRecording
            ? 'oklch(0.18 0.08 25 / 0.90)'
            : 'oklch(0.10 0.012 150 / 0.90)',
          backdropFilter: 'blur(24px) saturate(1.7)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.7)',
          border: isRecording
            ? '1px solid oklch(0.55 0.18 25 / 0.50)'
            : '1px solid oklch(0.38 0.13 150 / 0.45)',
          boxShadow: isRecording
            ? 'inset 0 1px 0 oklch(1 0 0 / 0.10), 0 0 0 1px oklch(0.55 0.18 25 / 0.25), 0 8px 24px oklch(0.55 0.18 25 / 0.35)'
            : 'inset 0 1px 0 oklch(1 0 0 / 0.12), 0 0 0 1px oklch(0.38 0.13 150 / 0.25), 0 8px 32px oklch(0.38 0.13 150 / 0.40)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
        }}
        aria-label={isRecording ? 'Parar gravacao' : 'Iniciar gravacao'}
      >
        {isRecording ? (
          <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}>
            <Mic className="h-6 w-6" style={{ color: 'oklch(0.65 0.18 25)' }} />
          </motion.div>
        ) : state === 'processing' ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" style={{ color: 'oklch(0.52 0.14 150)' }} />
        ) : (
          <MicOff className="h-6 w-6 text-muted-foreground" />
        )}
      </motion.button>

      {/* Pulsing rings */}
      <AnimatePresence>
        {isRecording && [0, 1, 2].map(i => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.6], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.6, ease: 'easeOut' }}
            className="fixed z-30 h-16 w-16 rounded-full"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
              left: '50%', marginLeft: '-32px',
              border: '1.5px solid oklch(0.55 0.18 25 / 0.40)',
            }}
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
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'oklch(0.05 0.005 150 / 0.70)', backdropFilter: 'blur(20px)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="glass-strong w-full rounded-t-[28px] border-t border-white/10 p-6 pb-10"
            >
              {state === 'processing' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    className="h-10 w-10 rounded-full"
                    style={{ border: '2px solid oklch(0.38 0.14 150 / 0.20)', borderTopColor: 'oklch(0.52 0.14 150)' }}
                  />
                  <p className="text-sm text-muted-foreground">Processando audio...</p>
                  {transcription && (
                    <p className="max-w-xs text-center text-sm italic text-muted-foreground/70">"{transcription}"</p>
                  )}
                </div>
              )}

              {state === 'error' && (
                <div className="flex flex-col gap-5">
                  <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Erro no Audio</p>
                  <p className="text-center text-sm text-muted-foreground">{errorMessage}</p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCancel}
                    className="rounded-2xl py-3.5 text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, oklch(0.38 0.14 150), oklch(0.30 0.12 152))', boxShadow: '0 4px 20px oklch(0.38 0.14 150 / 0.30)' }}
                  >
                    Entendi
                  </motion.button>
                </div>
              )}

              {state === 'result' && extractedData && (
                <div className="flex flex-col gap-5">
                  <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Transacao Extraida</p>
                  {transcription && (
                    <p className="text-center text-sm italic text-muted-foreground/70">"{transcription}"</p>
                  )}
                  <div className="card-glass w-full max-w-xs rounded-2xl p-5 mx-auto">
                    {[
                      { label: 'Valor', value: `R$ ${extractedData.value.toFixed(2)}` },
                      { label: 'Categoria', value: CATEGORY_LABELS[extractedData.category] },
                      { label: 'Tipo', value: 'Saida' },
                    ].map((row, i) => (
                      <div key={row.label}>
                        {i > 0 && <div className="my-3 h-px bg-white/5" />}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{row.label}</span>
                          <span className="text-sm font-semibold text-foreground">{row.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCancel}
                      className="glass-card flex-1 rounded-2xl py-3.5 text-sm text-muted-foreground"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleConfirm}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, oklch(0.38 0.14 150), oklch(0.30 0.12 152))', boxShadow: '0 4px 20px oklch(0.38 0.14 150 / 0.35)' }}
                    >
                      <Check className="h-4 w-4" />
                      Confirmar
                    </motion.button>
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
