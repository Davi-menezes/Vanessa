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
    () =>
      transactions.filter(tx => {
        const txDate = new Date(tx.timestamp)
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear() && !tx.sleeping
      }),
    [transactions, now]
  )

  const walletTransactions = useMemo(
    () =>
      monthTransactions.filter(tx =>
        selectedWallet === 'conta_corrente'
          ? tx.paymentMethod === 'conta_corrente' || tx.type === 'entrada'
          : tx.paymentMethod === 'credito' && tx.type === 'saida'
      ),
    [monthTransactions, selectedWallet]
  )

  const income = walletTransactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.value, 0)
  const expenses = walletTransactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.value, 0)
  const rawBalance = selectedWallet === 'conta_corrente' ? income - expenses : -expenses
  const displayedBalance = showCofrinhoDiscount ? rawBalance - piggySavedTotal : rawBalance

  const recentTxs = useMemo(
    () =>
      [...walletTransactions]
        .filter(t => !t.sleeping && !hiddenNotificationIds.includes(t.id))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 4),
    [walletTransactions, hiddenNotificationIds]
  )

  useEffect(() => {
    if (fixedCostReminders.dueToday.length > 0) {
      setShowDueModal(true)
    }
  }, [fixedCostReminders.dueToday.length])

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
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {selectedWallet === 'conta_corrente' ? 'Saldo da Conta' : 'Fatura no Credito'}
          </span>
        </div>
        <div className="flex gap-2 rounded-xl bg-secondary/40 p-1">
          <button
            onClick={() => setSelectedWallet('conta_corrente')}
            className={`flex-1 rounded-lg py-2 text-xs font-medium ${
              selectedWallet === 'conta_corrente'
                ? 'bg-vanessa-success/20 text-vanessa-success'
                : 'text-muted-foreground'
            }`}
          >
            Conta corrente
          </button>
          <button
            onClick={() => setSelectedWallet('credito')}
            className={`flex-1 rounded-lg py-2 text-xs font-medium ${
              selectedWallet === 'credito'
                ? 'bg-vanessa-warning/20 text-vanessa-warning'
                : 'text-muted-foreground'
            }`}
          >
            Credito
          </button>
        </div>
        <p className={`text-3xl font-bold ${displayedBalance >= 0 ? 'text-vanessa-success' : 'text-vanessa-danger'}`}>
          R$ {displayedBalance.toFixed(2)}
        </p>
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 px-3 py-2">
          <div>
            <p className="text-xs font-medium text-foreground">Considerar valor guardado no cofrinho</p>
            <p className="text-[10px] text-muted-foreground">Total guardado: R$ {piggySavedTotal.toFixed(2)}</p>
          </div>
          <Switch
            checked={showCofrinhoDiscount}
            onCheckedChange={setShowCofrinhoDiscount}
            aria-label="Alternar saldo considerando valor guardado no cofrinho"
          />
        </div>
        {selectedWallet === 'credito' && (
          <p className="text-[10px] text-muted-foreground">
            Gastos no credito entram como previsao e serao pagos no proximo mes.
          </p>
        )}
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vanessa-success/15">
              <ArrowUp className="h-3 w-3 text-vanessa-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Receitas</p>
              <p className="text-xs font-semibold text-vanessa-success">R$ {income.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vanessa-danger/15">
              <ArrowDown className="h-3 w-3 text-vanessa-danger" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Saidas</p>
              <p className="text-xs font-semibold text-vanessa-danger">R$ {expenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {fixedCostReminders.dueSoon.length > 0 && (
        <div className="rounded-2xl border border-vanessa-warning/30 bg-vanessa-warning/10 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-vanessa-warning">Lembrete de vencimento</p>
          <p className="mt-1 text-xs text-secondary-foreground">
            {fixedCostReminders.dueSoon.map(item => `${item.name} (${item.daysLeft}d)`).join(' • ')}
          </p>
        </div>
      )}

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

      {showDueModal && fixedCostReminders.dueToday.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl border-t border-border bg-card p-5 pb-8">
            <p className="text-sm font-medium text-foreground">Vencimento hoje</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Voce tem gasto(s) fixo(s) vencendo hoje:
            </p>
            <ul className="mt-3 flex flex-col gap-1 text-sm text-secondary-foreground">
              {fixedCostReminders.dueToday.map(item => (
                <li key={item.id}>
                  {item.name} - R$ {item.amount.toFixed(2)}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowDueModal(false)}
              className="mt-4 w-full rounded-xl bg-vanessa-lavender px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-vanessa-lavender/90"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
