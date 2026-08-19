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

const moodGradients: Record<MoodType, string> = {
  ansiedade: 'from-vanessa-warning/20 to-vanessa-warning/5',
  tedio: 'from-muted/40 to-muted/10',
  euforia: 'from-vanessa-lavender/20 to-vanessa-lavender/5',
  tristeza: 'from-vanessa-calm/20 to-vanessa-calm/5',
  calmaria: 'from-vanessa-success/20 to-vanessa-success/5',
}

interface MoodCheckinProps {
  onSelectMood: (mood: MoodType) => void
}

export function MoodCheckin({ onSelectMood }: MoodCheckinProps) {
  const moods = Object.keys(MOOD_CONFIG) as MoodType[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-6"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
      >
        mdmr
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-10 text-center text-2xl font-light leading-relaxed text-foreground"
      >
        Como voce esta{'\n'}se sentindo?
      </motion.h1>

      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {moods.map((mood, i) => (
          <motion.button
            key={mood}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 200 }}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => onSelectMood(mood)}
            className={`flex flex-col items-center gap-2.5 rounded-2xl bg-gradient-to-b ${moodGradients[mood]} border border-border/50 px-4 py-5 transition-colors ${mood === 'calmaria' ? 'col-span-2' : ''}`}
          >
            <span className={MOOD_CONFIG[mood].color}>{iconMap[mood]}</span>
            <span className="text-sm font-medium text-foreground">{MOOD_CONFIG[mood].label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
