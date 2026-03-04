'use client'

import { motion } from 'framer-motion'
import { Heart, Sparkles, GraduationCap, HeartPulse } from 'lucide-react'
import { getHappinessGoals } from '@/lib/store'
import type { TransactionCategory } from '@/lib/types'

const goalIcons: Partial<Record<TransactionCategory, React.ReactNode>> = {
  lazer: <Heart className="h-5 w-5" />,
  saude: <HeartPulse className="h-5 w-5" />,
  educacao: <GraduationCap className="h-5 w-5" />,
}

const goalColors: Partial<Record<TransactionCategory, string>> = {
  lazer: 'text-vanessa-lavender bg-vanessa-lavender/10 border-vanessa-lavender/20',
  saude: 'text-vanessa-success bg-vanessa-success/10 border-vanessa-success/20',
  educacao: 'text-vanessa-calm bg-vanessa-calm/10 border-vanessa-calm/20',
}

export function HappinessGoals() {
  const goals = getHappinessGoals()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 px-5 pb-28 pt-6"
    >
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Bem-estar</p>
        <h2 className="text-xl font-semibold text-foreground">Metas de Felicidade</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Vanessa sugere investimentos no seu bem-estar real.
        </p>
      </div>

      {goals.length > 0 ? (
        <div className="flex flex-col gap-3">
          {goals.map((goal, i) => (
            <motion.div
              key={goal.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${goalColors[goal.category] || 'border-border text-muted-foreground bg-secondary/20'}`}
            >
              <div className="mt-0.5">
                {goalIcons[goal.category] || <Sparkles className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed">{goal.message}</p>
                <p className="mt-1 text-xs opacity-60">Ha {goal.daysAgo} dias sem gastar nessa categoria</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-12"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vanessa-success/10">
            <Sparkles className="h-7 w-7 text-vanessa-success" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Voce esta equilibrado!</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Continue cuidando do seu bem-estar.
            </p>
          </div>
        </motion.div>
      )}

      {/* Wellness tips */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-secondary-foreground">Dicas da Vanessa</h3>
        {[
          { tip: 'Gastos com experiencias trazem mais felicidade do que com objetos.', icon: <Heart className="h-4 w-4 text-vanessa-lavender" /> },
          { tip: 'Investir em saude e educacao e o melhor retorno a longo prazo.', icon: <HeartPulse className="h-4 w-4 text-vanessa-success" /> },
          { tip: 'Reserve 10% do salario para lazer sem culpa.', icon: <Sparkles className="h-4 w-4 text-vanessa-warning" /> },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/20 px-4 py-3"
          >
            <div className="mt-0.5">{item.icon}</div>
            <p className="text-sm leading-relaxed text-secondary-foreground">{item.tip}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
