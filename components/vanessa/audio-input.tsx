'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Check, Loader2 } from 'lucide-react'
import type { TransactionCategory } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

interface AudioInputProps {
  onTransactionExtracted: (data: { value: number; category: TransactionCategory; description: string }) => void
}

const simulatedTranscriptions = [
  { text: 'Gastei 50 reais com sushi agora', value: 50, category: 'alimentacao' as TransactionCategory, description: 'Sushi delivery' },
  { text: 'Paguei 30 reais de Uber', value: 30, category: 'transporte' as TransactionCategory, description: 'Uber' },
  { text: 'Comprei um livro por 45 reais', value: 45, category: 'educacao' as TransactionCategory, description: 'Livro' },
  { text: 'Gastei 120 com cinema e pipoca', value: 120, category: 'lazer' as TransactionCategory, description: 'Cinema e pipoca' },
]

export function AudioInput({ onTransactionExtracted }: AudioInputProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing' | 'result'>('idle')
  const [transcription, setTranscription] = useState('')
  const [extractedData, setExtractedData] = useState<{ value: number; category: TransactionCategory; description: string } | null>(null)

  const handleRecord = () => {
    if (state === 'idle') {
      setState('recording')
      // Simulate recording for 2 seconds
      setTimeout(() => {
        setState('processing')
        const sim = simulatedTranscriptions[Math.floor(Math.random() * simulatedTranscriptions.length)]
        setTranscription(sim.text)
        // Simulate AI extraction
        setTimeout(() => {
          setExtractedData({ value: sim.value, category: sim.category, description: sim.description })
          setState('result')
        }, 1500)
      }, 2000)
    }
  }

  const handleConfirm = () => {
    if (extractedData) {
      onTransactionExtracted(extractedData)
      setState('idle')
      setTranscription('')
      setExtractedData(null)
    }
  }

  const handleCancel = () => {
    setState('idle')
    setTranscription('')
    setExtractedData(null)
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
        aria-label={state === 'recording' ? 'Gravando audio' : 'Gravar audio'}
      >
        {state === 'recording' ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <MicOff className="h-6 w-6 text-primary-foreground" />
          </motion.div>
        ) : state === 'processing' ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
        ) : (
          <Mic className="h-6 w-6 text-primary-foreground" />
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
        {(state === 'processing' || state === 'result') && (
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
