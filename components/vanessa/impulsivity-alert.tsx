'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImpulsivityAlertProps {
  show: boolean
  onPause: () => void
  onDismiss: () => void
}

export function ImpulsivityAlert({ show, onPause, onDismiss }: ImpulsivityAlertProps) {
  const [countdown, setCountdown] = useState(10)
  const [pausing, setPausing] = useState(false)

  useEffect(() => {
    if (!pausing) return
    if (countdown <= 0) {
      setPausing(false)
      onPause()
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, pausing, onPause])

  const handlePause = () => {
    setPausing(true)
    setCountdown(10)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-x-0 top-0 z-50 p-4"
        >
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-vanessa-warning/30 bg-vanessa-deep-blue/95 shadow-2xl shadow-vanessa-warning/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-vanessa-warning/20 px-4 py-3">
              <ShieldAlert className="h-5 w-5 text-vanessa-warning" />
              <span className="text-sm font-semibold text-vanessa-warning">
                Detector de Impulsividade Ativado
              </span>
              <button onClick={onDismiss} className="ml-auto">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-4 py-4">
              <p className="mb-4 text-sm leading-relaxed text-secondary-foreground">
                Vanessa percebeu que voce pode estar vulneravel a gastos impulsivos agora. Que tal uma pausa tatica?
              </p>
              {pausing ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                      <motion.circle
                        cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3"
                        className="text-vanessa-lavender"
                        strokeDasharray={175.9}
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 175.9 }}
                        transition={{ duration: 10, ease: 'linear' }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-lg font-light text-foreground">{countdown}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Respire fundo...</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handlePause}
                    size="sm"
                    className="flex-1 gap-2 bg-vanessa-lavender/20 text-vanessa-lavender hover:bg-vanessa-lavender/30"
                  >
                    <Clock className="h-4 w-4" />
                    Pausa Tatica
                  </Button>
                  <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border text-muted-foreground"
                  >
                    Estou Bem
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
