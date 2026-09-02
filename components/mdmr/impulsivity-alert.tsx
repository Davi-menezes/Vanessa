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
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed inset-x-0 top-0 z-50 px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)]"
        >
          <div
            className="relative mx-auto max-w-sm overflow-hidden rounded-[24px]"
            style={{
              background: 'oklch(0.10 0.012 150 / 0.88)',
              backdropFilter: 'blur(36px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(36px) saturate(1.8)',
              border: '1px solid oklch(1 0 0 / 0.12)',
              boxShadow: [
                'inset 0 1px 0 oklch(1 0 0 / 0.14)',
                'inset 0 -1px 0 oklch(0 0 0 / 0.30)',
                '0 8px 32px oklch(0 0 0 / 0.55)',
                '0 0 0 1px oklch(0.65 0.13 85 / 0.20)',
                '0 0 32px oklch(0.65 0.13 85 / 0.15)',
              ].join(', '),
            }}
          >
            {/* Inner shimmer */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 200px 80px at 30% 0%, oklch(0.65 0.13 85 / 0.10), transparent 65%)' }}
            />

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}>
              <ShieldAlert className="h-5 w-5 flex-shrink-0" style={{ color: 'oklch(0.68 0.12 85)' }} />
              <span className="text-sm font-semibold" style={{ color: 'oklch(0.72 0.11 85)' }}>
                Detector de Impulsividade
              </span>
              <button onClick={onDismiss} className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:text-foreground" style={{ color: 'oklch(0.42 0.02 200)' }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <p className="mb-5 text-sm leading-relaxed" style={{ color: 'oklch(0.78 0.04 150)' }}>
                mdmr percebeu que voce pode estar vulneravel a gastos impulsivos. Que tal uma pausa tatica?
              </p>

              {pausing ? (
                <div className="flex flex-col items-center gap-5 py-2">
                  {/* Countdown ring */}
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="4" />
                      <motion.circle
                        cx="40" cy="40" r="34" fill="none"
                        stroke="oklch(0.52 0.14 150)"
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={213.6}
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 213.6 }}
                        transition={{ duration: 10, ease: 'linear' }}
                      />
                    </svg>
                    <span className="absolute text-2xl font-light" style={{ color: 'oklch(0.75 0.04 150)' }}>
                      {countdown}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Respire fundo...</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handlePause}
                    size="sm"
                    className="flex-1 gap-2 rounded-2xl border-none text-sm font-semibold"
                    style={{
                      background: 'oklch(0.28 0.11 150 / 0.55)',
                      color: 'oklch(0.68 0.13 150)',
                      border: '1px solid oklch(0.38 0.12 150 / 0.30)',
                      boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.10), 0 0 16px oklch(0.35 0.12 150 / 0.20)',
                    }}
                  >
                    <Clock className="h-4 w-4" />
                    Pausa Tatica
                  </Button>
                  <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-2xl text-muted-foreground"
                    style={{ borderColor: 'oklch(1 0 0 / 0.10)' }}
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
