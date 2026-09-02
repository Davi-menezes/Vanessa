'use client'

import { motion } from 'framer-motion'
import { Brain, Sparkles, CloudRain, Leaf, Meh } from 'lucide-react'
import type { MoodType } from '@/lib/types'
import { MOOD_CONFIG } from '@/lib/types'

const iconMap: Record<MoodType, React.ReactNode> = {
  ansiedade: <Brain className="h-7 w-7" />,
  tedio: <Meh className="h-7 w-7" />,
  euforia: <Sparkles className="h-7 w-7" />,
  tristeza: <CloudRain className="h-7 w-7" />,
  calmaria: <Leaf className="h-7 w-7" />,
}

const moodGlow: Record<MoodType, string> = {
  ansiedade: 'oklch(0.68 0.12 85 / 0.18)',
  tedio: 'oklch(0.50 0.02 200 / 0.18)',
  euforia: 'oklch(0.65 0.18 150 / 0.22)',
  tristeza: 'oklch(0.55 0.10 155 / 0.18)',
  calmaria: 'oklch(0.45 0.14 150 / 0.22)',
}

interface MoodCheckinProps {
  onSelectMood: (mood: MoodType) => void
}

export function MoodCheckin({ onSelectMood }: MoodCheckinProps) {
  const moods = Object.keys(MOOD_CONFIG) as MoodType[]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6"
    >
      {/* Canopy glow behind */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 600px 400px at 50% 40%, oklch(0.28 0.14 150 / 0.25), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/60"
      >
        mdmr
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 text-center text-[28px] font-light leading-relaxed text-foreground"
      >
        Como voce esta{'\n'}se sentindo?
      </motion.h1>

      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {moods.map((mood, i) => {
          const isCalmaria = mood === 'calmaria'
          return (
            <motion.button
              key={mood}
              initial={{ opacity: 0, scale: 0.7, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.4 + i * 0.09,
                type: 'spring',
                stiffness: 280,
                damping: 22,
              }}
              whileTap={{ scale: 0.90 }}
              whileHover={{ scale: 1.04, transition: { duration: 0.15 } }}
              onClick={() => onSelectMood(mood)}
              className={`flex flex-col items-center gap-3 rounded-[22px] px-4 py-6 ${isCalmaria ? 'col-span-2 flex-row justify-center' : ''}`}
              style={{
                background: 'oklch(0.11 0.015 150 / 0.55)',
                backdropFilter: 'blur(24px) saturate(1.7)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.7)',
                border: `1px solid ${moodGlow[mood].replace('0.18', '0.22')}`,
                boxShadow: [
                  'inset 0 1px 0 oklch(1 0 0 / 0.12)',
                  'inset 0 -1px 0 oklch(0 0 0 / 0.28)',
                  `0 0 24px ${moodGlow[mood]}`,
                  '0 6px 24px oklch(0 0 0 / 0.40)',
                ].join(', '),
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease',
              }}
            >
              <span className={MOOD_CONFIG[mood].color}>{iconMap[mood]}</span>
              <span className="text-sm font-medium" style={{ color: 'oklch(0.88 0.02 145)' }}>
                {MOOD_CONFIG[mood].label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
