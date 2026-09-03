'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, TrendingUp, Trash2 } from 'lucide-react'
import type { Transaction } from '@/lib/types'
import { CATEGORY_LABELS, MOOD_CONFIG } from '@/lib/types'

interface TransactionListProps {
  transactions: Transaction[]
  hiddenIds: string[]
  onHideNotification: (id: string) => void
  onDeleteTransaction: (id: string) => void
}

export function TransactionList({ transactions, hiddenIds, onHideNotification, onDeleteTransaction }: TransactionListProps) {
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)
  const sorted = useMemo(
    () =>
      [...transactions]
        .filter(tx => !hiddenIds.includes(tx.id))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [transactions, hiddenIds]
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-14">
        <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Nenhuma transacao ainda</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((tx, i) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
        >
          <button
            onClick={() => setSelectedTxId(tx.id)}
            className="absolute right-2.5 top-2 rounded-md p-1 text-vanessa-danger/60 transition hover:bg-vanessa-danger/10 hover:text-vanessa-danger"
            aria-label="Remover"
          >
            <Trash2 className="h-3 w-3" />
          </button>

          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
              tx.type === 'entrada'
                ? 'border-vanessa-success/20 bg-vanessa-success/10'
                : 'border-vanessa-danger/20 bg-vanessa-danger/10'
            }`}
          >
            {tx.type === 'entrada'
              ? <ArrowUp className="h-4 w-4 text-vanessa-success" />
              : <ArrowDown className="h-4 w-4 text-vanessa-danger" />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">{CATEGORY_LABELS[tx.category]}</span>
              <span className="text-[11px] text-muted-foreground/50">·</span>
              <span className="text-[11px] text-muted-foreground/70">
                {tx.paymentMethod === 'credito' ? 'Crédito' : 'Conta corrente'}
              </span>
              {tx.mood && (
                <>
                  <span className="text-[11px] text-muted-foreground/40">·</span>
                  <span className={`text-[11px] ${MOOD_CONFIG[tx.mood].color}`}>{MOOD_CONFIG[tx.mood].label}</span>
                </>
              )}
            </div>
          </div>

          <span className={`shrink-0 pr-5 text-sm font-semibold ${tx.type === 'entrada' ? 'text-vanessa-success' : 'text-foreground'}`}>
            {tx.type === 'entrada' ? '+' : '-'}R$ {tx.value.toFixed(2)}
          </span>
        </motion.div>
      ))}

      {selectedTxId && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="glass-strong w-full rounded-t-3xl p-5 pb-10"
          >
            <p className="mb-1 text-sm font-semibold text-foreground">Como voce quer remover?</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Escolha se quer esconder apenas o card ou apagar o valor do sistema.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onHideNotification(selectedTxId); setSelectedTxId(null) }}
                className="glass-card w-full rounded-2xl py-3.5 text-sm text-foreground transition"
              >
                Apagar apenas a notificação
              </button>
              <button
                onClick={() => { onDeleteTransaction(selectedTxId); setSelectedTxId(null) }}
                className="w-full rounded-2xl bg-vanessa-danger/90 py-3.5 text-sm font-semibold text-white transition hover:bg-vanessa-danger"
              >
                Apagar valor completo
              </button>
              <button
                onClick={() => setSelectedTxId(null)}
                className="w-full rounded-2xl py-3 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
