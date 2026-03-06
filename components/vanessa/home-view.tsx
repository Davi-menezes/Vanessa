'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Wallet, Brain, Sparkles, CloudRain, Leaf, Meh, Trash2, LogOut } from 'lucide-react'
import type { MoodType, Transaction } from '@/lib/types'
import { MOOD_CONFIG } from '@/lib/types'
import {
  getMonthlyBalance,
  getLatestMood,
  getMonthlyFixedCostsTotal,
  getHiddenHomeTransactionIds,
  hideHomeTransactionNotification,
} from '@/lib/store'
import { Switch } from '@/components/ui/switch'

const moodIcons: Record<MoodType, React.ReactNode> = {
  ansiedade: <Brain className="h-5 w-5" />,
  tedio: <Meh className="h-5 w-5" />,
  euforia: <Sparkles className="h-5 w-5" />,
  tristeza: <CloudRain className="h-5 w-5" />,
  calmaria: <Leaf className="h-5 w-5" />,
}

interface HomeViewProps {
  onChangeMood: () => void
  onLogout: () => void
  transactions: Transaction[]
  onClearHistory: () => void
  userName?: string
}

export function HomeView({ onChangeMood, onLogout, transactions, onClearHistory, userName }: HomeViewProps) {
  const [showDiscountedBalance, setShowDiscountedBalance] = useState(true)
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState<string[]>(getHiddenHomeTransactionIds())
  const balance = getMonthlyBalance()
  const fixedCostsTotal = getMonthlyFixedCostsTotal()
  const displayedBalance = showDiscountedBalance ? balance.balance - fixedCostsTotal : balance.balance
  const latestMood = getLatestMood()
  const recentTxs = useMemo(
    () =>
      [...transactions]
        .filter(t => !t.sleeping && !hiddenNotificationIds.includes(t.id))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 4),
    [transactions, hiddenNotificationIds]
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 px-5 pb-28 pt-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}{userName ? `, ${userName.split(' ')[0]}` : ''}</p>
          <h1 className="text-2xl font-semibold text-foreground">Vanessa</h1>
        </div>
        <button
          onClick={onLogout}
          className="rounded-xl border border-border/50 bg-secondary/30 p-2.5 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          aria-label="Sair da conta"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
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
        <p className={`text-3xl font-bold ${displayedBalance >= 0 ? 'text-vanessa-success' : 'text-vanessa-danger'}`}>
          R$ {displayedBalance.toFixed(2)}
        </p>
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 px-3 py-2">
          <div>
            <p className="text-xs font-medium text-foreground">Descontar gastos fixos</p>
            <p className="text-[10px] text-muted-foreground">Total fixo mensal: R$ {fixedCostsTotal.toFixed(2)}</p>
          </div>
          <Switch
            checked={showDiscountedBalance}
            onCheckedChange={setShowDiscountedBalance}
            aria-label="Alternar saldo com gastos fixos descontados"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vanessa-success/15">
              <ArrowUp className="h-3 w-3 text-vanessa-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Receitas</p>
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

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Historico</p>
          {transactions.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 rounded-lg border border-border/50 px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-secondary/40"
              aria-label="Limpar historico"
            >
              <Trash2 className="h-3 w-3" />
              Limpar
            </button>
          )}
        </div>
        {recentTxs.length > 0 ? (
          recentTxs.map(tx => (
            <div
              key={tx.id}
              className="relative flex items-center gap-3 rounded-xl border border-border/30 bg-secondary/20 px-3.5 py-2.5"
            >
              <button
                onClick={() => {
                  hideHomeTransactionNotification(tx.id)
                  setHiddenNotificationIds(prev => Array.from(new Set([...prev, tx.id])))
                }}
                className="absolute right-2 top-2 rounded-md p-1 text-vanessa-danger transition-colors hover:bg-vanessa-danger/10"
                aria-label="Remover notificacao"
                title="Remover notificacao"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
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
              <span className={`pr-6 text-sm font-semibold ${tx.type === 'entrada' ? 'text-vanessa-success' : 'text-foreground'}`}>
                {tx.type === 'entrada' ? '+' : '-'}R$ {tx.value.toFixed(2)}
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-border/30 bg-secondary/15 px-3 py-4 text-center text-xs text-muted-foreground">
            Nenhuma transacao registrada.
          </div>
        )}
      </div>
    </motion.div>
  )
}
