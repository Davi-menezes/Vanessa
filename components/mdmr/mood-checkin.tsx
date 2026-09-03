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

const moodTint: Record<MoodType, string> = {
  ansiedade: 'border-vanessa-warning/25 bg-vanessa-warning/[0.06] text-vanessa-warning',
  tedio: 'border-white/10 bg-white/[0.03] text-muted-foreground',
  euforia: 'border-vanessa-glow/25 bg-vanessa-glow/[0.06] text-vanessa-glow',
  tristeza: 'border-vanessa-calm/25 bg-vanessa-calm/[0.06] text-vanessa-calm',
  calmaria: 'border-vanessa-success/25 bg-vanessa-success/[0.06] text-vanessa-success',
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
      transition={{ duration: 0.4 }}
      className="relative flex min-h-screen flex-col items-center justify-center px-6"
    >
      <div className="jungle-scene" aria-hidden />

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70"
      >
        mdmr
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mb-12 whitespace-pre-line text-center text-[26px] font-light leading-relaxed text-foreground"
      >
        {'Como voce esta\nse sentindo?'}
      </motion.h1>

      <div className="relative grid w-full max-w-xs grid-cols-2 gap-3">
        {moods.map((mood, i) => (
          <motion.button
            key={mood}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 300, damping: 26 }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelectMood(mood)}
            className={`glass flex flex-col items-center gap-2.5 rounded-2xl px-4 py-6 transition-colors ${moodTint[mood]} ${mood === 'calmaria' ? 'col-span-2' : ''}`}
          >
            {iconMap[mood]}
            <span className="text-sm font-medium text-foreground">{MOOD_CONFIG[mood].label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
