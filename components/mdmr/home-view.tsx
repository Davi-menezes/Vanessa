'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Wallet, Brain, Sparkles, CloudRain, Leaf, Meh, Trash2, LogOut } from 'lucide-react'
import type { MoodType, Transaction } from '@/lib/types'
import { MOOD_CONFIG } from '@/lib/types'
import {
  getFixedCostReminders,
  getLatestMood,
  getHiddenHomeTransactionIds,
  getPiggyBanksSavedTotal,
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
  const [selectedWallet, setSelectedWallet] = useState<'conta_corrente' | 'credito'>('conta_corrente')
  const [showCofrinhoDiscount, setShowCofrinhoDiscount] = useState(false)
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState<string[]>(getHiddenHomeTransactionIds())
  const [showDueModal, setShowDueModal] = useState(false)
  const latestMood = getLatestMood()
  const piggySavedTotal = getPiggyBanksSavedTotal()
  const fixedCostReminders = getFixedCostReminders()

  const now = new Date()
  const monthTransactions = useMemo(
    () => transactions.filter(tx => {
      const d = new Date(tx.timestamp)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && !tx.sleeping
    }),
    [transactions, now]
  )

  const walletTransactions = useMemo(
    () => monthTransactions.filter(tx =>
      selectedWallet === 'conta_corrente'
        ? tx.paymentMethod === 'conta_corrente' || tx.type === 'entrada'
        : tx.paymentMethod === 'credito' && tx.type === 'saida'
    ),
    [monthTransactions, selectedWallet]
  )

  const income = walletTransactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.value, 0)
  const expenses = walletTransactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.value, 0)
  const rawBalance = selectedWallet === 'conta_corrente' ? income - expenses : -expenses
  const displayedBalance = showCofrinhoDiscount ? rawBalance - piggySavedTotal : rawBalance

  const recentTxs = useMemo(
    () => [...walletTransactions]
      .filter(t => !t.sleeping && !hiddenNotificationIds.includes(t.id))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4),
    [walletTransactions, hiddenNotificationIds]
  )

  useEffect(() => {
    if (fixedCostReminders.dueToday.length > 0 || fixedCostReminders.overdue.length > 0) setShowDueModal(true)
  }, [fixedCostReminders.dueToday.length, fixedCostReminders.overdue.length])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col gap-5 px-5 pb-32 pt-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-muted-foreground">
            {greeting}{userName ? `, ${userName.split(' ')[0]}` : ''}
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground">mdmr</h1>
        </div>
        <button
          onClick={onLogout}
          className="glass-card flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:text-foreground"
          aria-label="Sair da conta"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Mood bar */}
      {latestMood && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onChangeMood}
          className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
        >
          <span className={MOOD_CONFIG[latestMood.mood].color}>{moodIcons[latestMood.mood]}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Sentindo {MOOD_CONFIG[latestMood.mood].label}</p>
            <p className="text-xs text-muted-foreground">Toque para atualizar</p>
          </div>
          {MOOD_CONFIG[latestMood.mood].isImpulsive && (
            <span className="rounded-full border border-vanessa-warning/30 bg-vanessa-warning/10 px-2.5 py-1 text-[10px] font-medium text-vanessa-warning">
              Alerta ativo
            </span>
          )}
        </motion.button>
      )}

      {/* Balance card — the hero glass panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative overflow-hidden rounded-3xl p-6"
      >
        {/* Single soft green bloom — subtle, not neon */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full opacity-70"
          style={{ background: 'radial-gradient(closest-side, oklch(0.42 0.13 150 / 0.28), transparent)' }}
        />

        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-vanessa-success" />
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {selectedWallet === 'conta_corrente' ? 'Saldo da conta' : 'Fatura no crédito'}
            </span>
          </div>

          {/* Wallet toggle */}
          <div className="glass-card mb-5 flex gap-1 rounded-2xl p-1">
            {(['conta_corrente', 'credito'] as const).map(m => (
              <button
                key={m}
                onClick={() => setSelectedWallet(m)}
                className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                  selectedWallet === m
                    ? 'bg-vanessa-lavender/15 text-vanessa-lavender shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'conta_corrente' ? 'Conta corrente' : 'Crédito'}
              </button>
            ))}
          </div>

          <p className="mb-5 text-[34px] font-semibold leading-none tracking-tight text-foreground">
            R$ {displayedBalance.toFixed(2)}
          </p>

          {/* Cofrinho toggle */}
          <div className="glass-card mb-4 flex items-center justify-between rounded-2xl px-4 py-3">
            <div>
              <p className="text-xs font-medium text-foreground">Considerar valor guardado no cofrinho</p>
              <p className="text-[10px] text-muted-foreground">Total guardado: R$ {piggySavedTotal.toFixed(2)}</p>
            </div>
            <Switch
              checked={showCofrinhoDiscount}
              onCheckedChange={setShowCofrinhoDiscount}
              aria-label="Alternar saldo com cofrinho"
            />
          </div>

          {selectedWallet === 'credito' && (
            <p className="mb-4 text-[10px] text-muted-foreground">
              Gastos no credito entram como previsao para o proximo mes.
            </p>
          )}

          <div className="flex gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-vanessa-success/20 bg-vanessa-success/10">
                <ArrowUp className="h-3.5 w-3.5 text-vanessa-success" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Receitas</p>
                <p className="text-sm font-semibold text-vanessa-success">R$ {income.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-vanessa-danger/20 bg-vanessa-danger/10">
                <ArrowDown className="h-3.5 w-3.5 text-vanessa-danger" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Saídas</p>
                <p className="text-sm font-semibold text-vanessa-danger">R$ {expenses.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Due soon */}
      {fixedCostReminders.dueSoon.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border-vanessa-warning/20 px-4 py-3"
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-vanessa-warning">Lembrete de vencimento</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {fixedCostReminders.dueSoon.map(item => `${item.name} (${item.daysLeft}d)`).join(' • ')}
          </p>
        </motion.div>
      )}

      {/* History */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Histórico</p>
          {transactions.length > 0 && (
            <button
              onClick={onClearHistory}
              className="glass-card flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] text-muted-foreground transition hover:text-foreground"
            >
              <Trash2 className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>

        {recentTxs.length > 0 ? (
          recentTxs.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="glass-card relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
            >
              <button
                onClick={() => {
                  hideHomeTransactionNotification(tx.id)
                  setHiddenNotificationIds(prev => Array.from(new Set([...prev, tx.id])))
                }}
                className="absolute right-2.5 top-2 rounded-md p-1 text-vanessa-danger/60 transition hover:bg-vanessa-danger/10 hover:text-vanessa-danger"
                aria-label="Remover notificação"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                tx.type === 'entrada'
                  ? 'border-vanessa-success/20 bg-vanessa-success/10'
                  : 'border-vanessa-danger/20 bg-vanessa-danger/10'
              }`}>
                {tx.type === 'entrada'
                  ? <ArrowUp className="h-4 w-4 text-vanessa-success" />
                  : <ArrowDown className="h-4 w-4 text-vanessa-danger" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(tx.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <span className={`pr-5 text-sm font-semibold ${tx.type === 'entrada' ? 'text-vanessa-success' : 'text-foreground'}`}>
                {tx.type === 'entrada' ? '+' : '-'}R$ {tx.value.toFixed(2)}
              </span>
            </motion.div>
          ))
        ) : (
          <div className="glass-card rounded-2xl px-4 py-5 text-center text-xs text-muted-foreground">
            Nenhuma transação registrada.
          </div>
        )}
      </div>

      {/* Due modal */}
      {showDueModal && (fixedCostReminders.dueToday.length > 0 || fixedCostReminders.overdue.length > 0) && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-md">
          <div className="glass-strong w-full rounded-t-3xl p-5 pb-10">
            <p className="mb-3 text-sm font-semibold text-foreground">Lembrete de gastos fixos</p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {fixedCostReminders.dueToday.map(item => (
                <li key={item.id}>Vence hoje: {item.name} — R$ {item.amount.toFixed(2)}</li>
              ))}
              {fixedCostReminders.overdue.map(item => (
                <li key={item.id}>Em atraso há {item.daysOverdue} dia(s): {item.name} — R$ {item.amount.toFixed(2)}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowDueModal(false)}
              className="btn-primary mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
