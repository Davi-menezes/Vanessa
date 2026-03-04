'use client'

import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Wallet, Brain, Sparkles, CloudRain, Leaf, Meh } from 'lucide-react'
import type { MoodType } from '@/lib/types'
import { MOOD_CONFIG } from '@/lib/types'
import { getMonthlyBalance, getLatestMood, getTransactions } from '@/lib/store'

const moodIcons: Record<MoodType, React.ReactNode> = {
  ansiedade: <Brain className="h-5 w-5" />,
  tedio: <Meh className="h-5 w-5" />,
  euforia: <Sparkles className="h-5 w-5" />,
  tristeza: <CloudRain className="h-5 w-5" />,
  calmaria: <Leaf className="h-5 w-5" />,
}

interface HomeViewProps {
  onChangeMood: () => void
  userName?: string
}

export function HomeView({ onChangeMood, userName }: HomeViewProps) {
  const balance = getMonthlyBalance()
  const latestMood = getLatestMood()
  const recentTxs = getTransactions()
    .filter(t => !t.sleeping)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 px-5 pb-28 pt-6"
    >
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">{greeting}{userName ? `, ${userName.split(' ')[0]}` : ''}</p>
        <h1 className="text-2xl font-semibold text-foreground">Vanessa</h1>
      </div>

      {/* Current mood */}
      {latestMood && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onChangeMood}
          className="flex items-center gap-3 rounded-2xl border border-border/50 bg-secondary/30 px-4 py-3"
        >
          <span className={MOOD_CONFIG[latestMood.mood].color}>
            {moodIcons[latestMood.mood]}
          </span>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">
              Sentindo {MOOD_CONFIG[latestMood.mood].label}
            </p>
            <p className="text-xs text-muted-foreground">Toque para atualizar</p>
          </div>
          {MOOD_CONFIG[latestMood.mood].isImpulsive && (
            <span className="rounded-full bg-vanessa-warning/15 px-2.5 py-1 text-[10px] font-medium text-vanessa-warning">
              Alerta ativo
            </span>
          )}
        </motion.button>
      )}

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col gap-4 rounded-2xl border border-vanessa-lavender/15 bg-gradient-to-br from-vanessa-deep-blue to-card p-5"
      >
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-vanessa-lavender" />
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Saldo do Mes</span>
        </div>
        <p className={`text-3xl font-bold ${balance.balance >= 0 ? 'text-vanessa-success' : 'text-vanessa-danger'}`}>
          R$ {balance.balance.toFixed(2)}
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vanessa-success/15">
              <ArrowUp className="h-3 w-3 text-vanessa-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Entradas</p>
              <p className="text-xs font-semibold text-vanessa-success">R$ {balance.income.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vanessa-danger/15">
              <ArrowDown className="h-3 w-3 text-vanessa-danger" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Saidas</p>
              <p className="text-xs font-semibold text-vanessa-danger">R$ {balance.expenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent transactions */}
      {recentTxs.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Recentes</p>
          {recentTxs.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border/30 bg-secondary/20 px-3.5 py-2.5"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.type === 'entrada' ? 'bg-vanessa-success/15' : 'bg-vanessa-danger/15'}`}>
                {tx.type === 'entrada' ? (
                  <ArrowUp className="h-3.5 w-3.5 text-vanessa-success" />
                ) : (
                  <ArrowDown className="h-3.5 w-3.5 text-vanessa-danger" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{tx.description}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(tx.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <span className={`text-sm font-semibold ${tx.type === 'entrada' ? 'text-vanessa-success' : 'text-foreground'}`}>
                {tx.type === 'entrada' ? '+' : '-'}R$ {tx.value.toFixed(2)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
