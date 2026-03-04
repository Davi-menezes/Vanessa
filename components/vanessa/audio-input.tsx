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
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

function parseTranscription(text: string): { value: number; category: TransactionCategory; description: string } | null {
  const normalized = text.toLowerCase().trim()
  const valueMatch = normalized.match(/(\d+[.,]?\d{0,2})/)
  if (!valueMatch) return null

  const value = Number(valueMatch[1].replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return null

  const categoryMap: Array<{ keywords: string[]; category: TransactionCategory; description: string }> = [
    { keywords: ['uber', 'onibus', 'ônibus', 'metro', 'metrô', 'taxi', 'gasolina'], category: 'transporte', description: 'Transporte' },
    { keywords: ['mercado', 'comida', 'almoco', 'almoço', 'janta', 'sushi', 'lanche', 'restaurante'], category: 'alimentacao', description: 'Alimentacao' },
    { keywords: ['netflix', 'cinema', 'show', 'bar', 'lazer', 'jogo'], category: 'lazer', description: 'Lazer' },
    { keywords: ['curso', 'livro', 'faculdade', 'escola', 'educacao', 'educação'], category: 'educacao', description: 'Educacao' },
    { keywords: ['farmacia', 'farmácia', 'medico', 'médico', 'saude', 'saúde'], category: 'saude', description: 'Saude' },
    { keywords: ['aluguel', 'condominio', 'condomínio', 'agua', 'água', 'luz', 'internet'], category: 'moradia', description: 'Moradia' },
  ]

  const detected = categoryMap.find(item => item.keywords.some(keyword => normalized.includes(keyword)))
  if (detected) {
    return { value, category: detected.category, description: detected.description }
  }

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

    const recognition = new RecognitionCtor()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      isStoppingRef.current = false
      setErrorMessage('')
      setState('recording')
      setTranscription('')
      transcriptionRef.current = ''
      setExtractedData(null)
    }

    recognition.onresult = event => {
      let fullText = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        fullText += event.results[i][0].transcript
      }
      const cleaned = fullText.trim()
      transcriptionRef.current = cleaned
      setTranscription(cleaned)
    }

    recognition.onerror = event => {
      if (event.error === 'aborted' && isStoppingRef.current) return
      setState('error')
      setErrorMessage('Nao foi possivel capturar audio. Tente novamente.')
    }

    recognition.onend = () => {
      if (isStoppingRef.current) return
      setState('processing')
      const parsed = parseTranscription(transcriptionRef.current)
      if (!parsed) {
        setState('error')
        setErrorMessage('Nao entendi o valor da transacao. Fale, por exemplo: "Gastei 25 reais de uber".')
        return
      }
      setExtractedData(parsed)
      setState('result')
    }

    recognitionRef.current = recognition

    return () => {
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      try {
        recognition.stop()
      } catch {
        // noop
      }
    }
  }, [])

  const handleRecord = () => {
    if (state === 'idle') {
      const recognition = recognitionRef.current
      if (!recognition) {
        setState('error')
        setErrorMessage('Seu navegador nao suporta cadastro por voz.')
        return
      }

      try {
        recognition.start()
      } catch {
        setState('error')
        setErrorMessage('Nao foi possivel iniciar o microfone.')
      }
      return
    }

    if (state === 'recording') {
      isStoppingRef.current = false
      recognitionRef.current?.stop()
    }
  }

  const handleConfirm = () => {
    if (extractedData) {
      onTransactionExtracted(extractedData)
      setState('idle')
      setTranscription('')
      transcriptionRef.current = ''
      setExtractedData(null)
    }
  }

  const handleCancel = () => {
    isStoppingRef.current = true
    recognitionRef.current?.stop()
    setState('idle')
    setTranscription('')
    transcriptionRef.current = ''
    setExtractedData(null)
    setErrorMessage('')
  }

  return (
    <>
      {/* Floating mic button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleRecord}
        className={`fixed bottom-24 left-1/2 z-40 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full shadow-lg shadow-vanessa-lavender/20 transition-colors ${
          state === 'recording'
            ? 'bg-vanessa-danger'
            : 'bg-vanessa-lavender'
        }`}
        aria-label={state === 'recording' ? 'Parar gravacao' : 'Iniciar gravacao'}
      >
        {state === 'recording' ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Mic className="h-6 w-6 text-primary-foreground" />
          </motion.div>
        ) : state === 'processing' ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
        ) : (
          <MicOff className="h-6 w-6 text-primary-foreground" />
        )}
      </motion.button>

      {/* Audio pulsing ring */}
      <AnimatePresence>
        {state === 'recording' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2"
          >
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-16 w-16 rounded-full bg-vanessa-danger/30"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extraction result overlay */}
      <AnimatePresence>
        {(state === 'processing' || state === 'result' || state === 'error') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full rounded-t-3xl border-t border-border bg-card p-6 pb-10"
            >
              {state === 'processing' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-vanessa-lavender" />
                  <p className="text-sm text-muted-foreground">Processando audio...</p>
                  {transcription && (
                    <p className="mt-2 text-center text-sm italic text-secondary-foreground">
                      {`"${transcription}"`}
                    </p>
                  )}
                </div>
              )}

              {state === 'error' && (
                <div className="flex flex-col gap-5">
                  <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    Erro no Audio
                  </p>
                  <p className="text-center text-sm text-secondary-foreground">{errorMessage}</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="rounded-xl bg-vanessa-lavender px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-vanessa-lavender/90"
                  >
                    Entendi
                  </motion.button>
                </div>
              )}

              {state === 'result' && extractedData && (
                <div className="flex flex-col gap-5">
                  <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    Transacao Extraida
                  </p>
                  <p className="text-center text-sm italic text-secondary-foreground">
                    {`"${transcription}"`}
                  </p>

                  <div className="mx-auto flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-border bg-secondary/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Valor</span>
                      <span className="text-lg font-semibold text-foreground">
                        R$ {extractedData.value.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Categoria</span>
                      <span className="text-sm font-medium text-vanessa-lavender">
                        {CATEGORY_LABELS[extractedData.category]}
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tipo</span>
                      <span className="text-sm font-medium text-vanessa-danger">Saida</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="flex-1 rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirm}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-vanessa-lavender px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-vanessa-lavender/90"
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
