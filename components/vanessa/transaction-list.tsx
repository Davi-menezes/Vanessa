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
      <div className="flex flex-col items-center gap-3 py-12">
        <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Nenhuma transacao ainda</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((tx, i) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 px-4 py-3"
        >
          <button
            onClick={() => setSelectedTxId(tx.id)}
            className="absolute right-2 top-2 rounded-md p-1 text-vanessa-danger transition-colors hover:bg-vanessa-danger/10"
            aria-label="Remover notificacao ou valor"
            title="Remover notificacao ou valor"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tx.type === 'entrada' ? 'bg-vanessa-success/15' : 'bg-vanessa-danger/15'}`}>
            {tx.type === 'entrada' ? (
              <ArrowUp className="h-4 w-4 text-vanessa-success" />
            ) : (
              <ArrowDown className="h-4 w-4 text-vanessa-danger" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{tx.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[tx.category]}</span>
              {tx.mood && (
                <>
                  <span className="text-xs text-muted-foreground/50">{'|'}</span>
                  <span className={`text-xs ${MOOD_CONFIG[tx.mood].color}`}>
                    {MOOD_CONFIG[tx.mood].label}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`pr-6 text-sm font-semibold ${tx.type === 'entrada' ? 'text-vanessa-success' : 'text-foreground'}`}>
              {tx.type === 'entrada' ? '+' : '-'}R$ {tx.value.toFixed(2)}
            </span>
          </div>
        </motion.div>
      ))}

      {selectedTxId && (
        <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl border-t border-border bg-card p-5 pb-8">
            <p className="text-sm font-medium text-foreground">Como voce quer remover?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Escolha se quer esconder apenas o card ou apagar o valor do sistema.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  onHideNotification(selectedTxId)
                  setSelectedTxId(null)
                }}
                className="rounded-xl border border-border px-4 py-3 text-sm text-secondary-foreground transition-colors hover:bg-secondary"
              >
                Apagar apenas a notificação
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(selectedTxId)
                  setSelectedTxId(null)
                }}
                className="rounded-xl bg-vanessa-danger px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-vanessa-danger/90"
              >
                Apagar valor completo
              </button>
              <button
                onClick={() => setSelectedTxId(null)}
                className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
