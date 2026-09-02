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
      const txDate = new Date(tx.timestamp)
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear() && !tx.sleeping
    }),
    [transactions, now]
  )

  const walletTransactions = useMemo(
    () => monthTransactions.filter(tx => selectedWallet === 'conta_corrente'
      ? tx.paymentMethod === 'conta_corrente' || tx.type === 'entrada'
      : tx.paymentMethod === 'credito' && tx.type === 'saida'),
    [monthTransactions, selectedWallet]
  )

  const income = walletTransactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.value, 0)
  const expenses = walletTransactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.value, 0)
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 px-5 pb-32 pt-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-muted-foreground">{greeting}{userName ? `, ${userName.split(' ')[0]}` : ''}</p>
          <h1 className="text-[26px] font-semibold text-foreground tracking-tight">mdmr</h1>
        </div>
        <button
          onClick={onLogout}
          className="glass-card flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Sair da conta"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Mood bar */}
      {latestMood && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onChangeMood}
          className="glass glass-glow flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
        >
          <span className={MOOD_CONFIG[latestMood.mood].color}>{moodIcons[latestMood.mood]}</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Sentindo {MOOD_CONFIG[latestMood.mood].label}</p>
            <p className="text-xs text-muted-foreground">Toque para atualizar</p>
          </div>
          {MOOD_CONFIG[latestMood.mood].isImpulsive && (
            <span className="glass-card rounded-full px-2.5 py-1 text-[10px] font-medium" style={{ color: 'oklch(0.65 0.12 85)' }}>
              Alerta ativo
            </span>
          )}
        </motion.button>
      )}

      {/* Balance card — the crown jewel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'oklch(0.09 0.012 150 / 0.55)',
          backdropFilter: 'blur(28px) saturate(1.7)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.7)',
          border: '1px solid oklch(1 0 0 / 0.12)',
          boxShadow: [
            'inset 0 1px 0 oklch(1 0 0 / 0.15)',
            'inset 0 -1px 0 oklch(0 0 0 / 0.40)',
            '0 0 0 1px oklch(0.35 0.13 150 / 0.18)',
            '0 8px 32px oklch(0 0 0 / 0.50)',
            '0 24px 70px oklch(0.35 0.13 150 / 0.18)',
          ].join(', '),
        }}
      >
        {/* Inner ambient bloom */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 300px 200px at 30% 10%, oklch(0.35 0.14 150 / 0.18), transparent 70%)',
          }}
        />

        <div className="relative p-6">
          {/* Label + wallet toggle */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" style={{ color: 'oklch(0.52 0.14 150)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {selectedWallet === 'conta_corrente' ? 'Saldo da Conta' : 'Fatura no Credito'}
              </span>
            </div>
          </div>

          {/* Wallet selector */}
          <div className="glass-card mb-5 flex gap-1 rounded-2xl p-1">
            {(['conta_corrente', 'credito'] as const).map(method => (
              <button
                key={method}
                onClick={() => setSelectedWallet(method)}
                className="flex-1 rounded-xl py-2 text-xs font-medium transition-all"
                style={selectedWallet === method
                  ? {
                      background: 'oklch(0.35 0.13 150 / 0.30)',
                      color: 'oklch(0.62 0.14 150)',
                      boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.12), 0 0 12px oklch(0.38 0.13 150 / 0.20)',
                    }
                  : { color: 'oklch(0.58 0.035 150)' }}
              >
                {method === 'conta_corrente' ? 'Conta corrente' : 'Credito'}
              </button>
            ))}
          </div>

          {/* Balance number */}
          <p
            className="mb-5 text-[34px] font-bold leading-none tracking-tight"
            style={{
              color: displayedBalance >= 0 ? 'oklch(0.62 0.14 150)' : 'oklch(0.65 0.16 25)',
              textShadow: displayedBalance >= 0
                ? '0 0 40px oklch(0.45 0.14 150 / 0.50)'
                : '0 0 40px oklch(0.55 0.18 25 / 0.30)',
            }}
          >
            R$ {displayedBalance.toFixed(2)}
          </p>

          {/* Cofrinho toggle row */}
          <div className="glass-card mb-4 flex items-center justify-between rounded-2xl px-3.5 py-3">
            <div>
              <p className="text-xs font-medium text-foreground">Considerar valor no cofrinho</p>
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

          {/* Income/expense row */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: 'oklch(0.38 0.14 150 / 0.20)',
                  border: '1px solid oklch(0.45 0.14 150 / 0.25)',
                  boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.10)',
                }}
              >
                <ArrowUp className="h-3.5 w-3.5" style={{ color: 'oklch(0.60 0.14 150)' }} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Receitas</p>
                <p className="text-sm font-semibold" style={{ color: 'oklch(0.60 0.14 150)' }}>R$ {income.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: 'oklch(0.50 0.18 25 / 0.15)',
                  border: '1px solid oklch(0.50 0.18 25 / 0.20)',
                  boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.08)',
                }}
              >
                <ArrowDown className="h-3.5 w-3.5" style={{ color: 'oklch(0.65 0.16 25)' }} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Saidas</p>
                <p className="text-sm font-semibold" style={{ color: 'oklch(0.65 0.16 25)' }}>R$ {expenses.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Due soon banner */}
      {fixedCostReminders.dueSoon.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl px-4 py-3"
          style={{ borderColor: 'oklch(0.55 0.12 85 / 0.25)' }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color: 'oklch(0.68 0.12 85)' }}>
            Lembrete de vencimento
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {fixedCostReminders.dueSoon.map(item => `${item.name} (${item.daysLeft}d)`).join(' • ')}
          </p>
        </motion.div>
      )}

      {/* Transaction history */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Historico</p>
          {transactions.length > 0 && (
            <button
              onClick={onClearHistory}
              className="glass-card flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] text-muted-foreground"
            >
              <Trash2 className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>

        {recentTxs.length > 0 ? (
          recentTxs.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.07, ease: 'easeOut' }}
              className="glass-card glass-card-hover relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
            >
              <button
                onClick={() => {
                  hideHomeTransactionNotification(tx.id)
                  setHiddenNotificationIds(prev => Array.from(new Set([...prev, tx.id])))
                }}
                className="absolute right-2.5 top-2 rounded-md p-1 transition-colors hover:text-white"
                style={{ color: 'oklch(0.58 0.18 25 / 0.70)' }}
                aria-label="Remover notificacao"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                style={tx.type === 'entrada'
                  ? { background: 'oklch(0.38 0.14 150 / 0.18)', border: '1px solid oklch(0.45 0.14 150 / 0.20)' }
                  : { background: 'oklch(0.50 0.18 25 / 0.12)', border: '1px solid oklch(0.50 0.18 25 / 0.15)' }}
              >
                {tx.type === 'entrada'
                  ? <ArrowUp className="h-4 w-4" style={{ color: 'oklch(0.58 0.14 150)' }} />
                  : <ArrowDown className="h-4 w-4" style={{ color: 'oklch(0.62 0.16 25)' }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(tx.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <span
                className="pr-5 text-sm font-semibold"
                style={{ color: tx.type === 'entrada' ? 'oklch(0.58 0.14 150)' : 'oklch(0.88 0.02 145)' }}
              >
                {tx.type === 'entrada' ? '+' : '-'}R$ {tx.value.toFixed(2)}
              </span>
            </motion.div>
          ))
        ) : (
          <div
            className="glass-card rounded-2xl px-4 py-5 text-center text-xs text-muted-foreground"
          >
            Nenhuma transacao registrada.
          </div>
        )}
      </div>

      {/* Due modal */}
      {showDueModal && (fixedCostReminders.dueToday.length > 0 || fixedCostReminders.overdue.length > 0) && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'oklch(0.05 0.005 150 / 0.65)', backdropFilter: 'blur(16px)' }}
        >
          <div className="glass-strong w-full rounded-t-[28px] border-t border-white/10 p-5 pb-10">
            <p className="mb-3 text-sm font-semibold text-foreground">Lembrete de gastos fixos</p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {fixedCostReminders.dueToday.map(item => (
                <li key={item.id}>Vence hoje: {item.name} — R$ {item.amount.toFixed(2)}</li>
              ))}
              {fixedCostReminders.overdue.map(item => (
                <li key={item.id}>Em atraso ha {item.daysOverdue} dia(s): {item.name} — R$ {item.amount.toFixed(2)}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowDueModal(false)}
              className="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, oklch(0.38 0.14 150), oklch(0.30 0.12 152))',
                boxShadow: '0 4px 20px oklch(0.38 0.14 150 / 0.35)',
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}