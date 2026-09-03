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
    if (countdown <= 0) { setPausing(false); onPause(); return }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, pausing, onPause])

  const handlePause = () => { setPausing(true); setCountdown(10) }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed inset-x-0 top-0 z-50 px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)]"
        >
          <div className="glass-strong mx-auto max-w-sm overflow-hidden rounded-3xl border-vanessa-warning/20">
            {/* Inner amber glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-20"
              style={{ background: 'radial-gradient(ellipse 300px 100px at 50% 0%, oklch(0.65 0.13 85 / 0.15), transparent)' }}
            />

            <div className="relative flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
              <ShieldAlert className="h-5 w-5 shrink-0 text-vanessa-warning" />
              <span className="text-sm font-semibold text-vanessa-warning">Detector de Impulsividade</span>
              <button
                onClick={onDismiss}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative p-5">
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                mdmr percebeu que voce pode estar vulneravel a gastos impulsivos. Que tal uma pausa tatica?
              </p>

              {pausing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                      <motion.circle
                        cx="40" cy="40" r="34" fill="none"
                        stroke="oklch(0.62 0.13 85)" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={213.6}
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 213.6 }}
                        transition={{ duration: 10, ease: 'linear' }}
                      />
                    </svg>
                    <span className="absolute text-xl font-light text-foreground">{countdown}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Respire fundo...</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handlePause}
                    size="sm"
                    className="flex-1 gap-2 rounded-xl bg-vanessa-warning/15 text-vanessa-warning hover:bg-vanessa-warning/25 border-none"
                  >
                    <Clock className="h-4 w-4" />
                    Pausa Tatica
                  </Button>
                  <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="outline"
                    className="glass-card flex-1 rounded-xl text-muted-foreground"
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
