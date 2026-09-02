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
    () => [...transactions]
      .filter(tx => !hiddenIds.includes(tx.id))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [transactions, hiddenIds]
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-14">
        <TrendingUp className="h-10 w-10" style={{ color: 'oklch(0.35 0.10 150 / 0.50)' }} />
        <p className="text-sm text-muted-foreground">Nenhuma transacao ainda</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((tx, i) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
          style={{
            background: 'oklch(0.12 0.016 150 / 0.50)',
            backdropFilter: 'blur(16px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
            border: '1px solid oklch(1 0 0 / 0.08)',
            boxShadow: [
              'inset 0 1px 0 oklch(1 0 0 / 0.08)',
              'inset 0 -1px 0 oklch(0 0 0 / 0.25)',
              '0 2px 8px oklch(0 0 0 / 0.30)',
            ].join(', '),
          }}
        >
          {/* Delete button */}
          <button
            onClick={() => setSelectedTxId(tx.id)}
            className="absolute right-2.5 top-2 rounded-lg p-1 transition-colors"
            style={{ color: 'oklch(0.55 0.18 25 / 0.60)' }}
            aria-label="Remover"
          >
            <Trash2 className="h-3 w-3" />
          </button>

          {/* Icon */}
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
            style={tx.type === 'entrada'
              ? {
                  background: 'oklch(0.35 0.13 150 / 0.20)',
                  border: '1px solid oklch(0.45 0.14 150 / 0.22)',
                  boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.08), 0 0 12px oklch(0.38 0.14 150 / 0.15)',
                }
              : {
                  background: 'oklch(0.45 0.18 25 / 0.12)',
                  border: '1px solid oklch(0.50 0.18 25 / 0.18)',
                  boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.06)',
                }}
          >
            {tx.type === 'entrada'
              ? <ArrowUp className="h-4 w-4" style={{ color: 'oklch(0.58 0.14 150)' }} />
              : <ArrowDown className="h-4 w-4" style={{ color: 'oklch(0.62 0.15 25)' }} />
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">{CATEGORY_LABELS[tx.category]}</span>
              <span className="text-[11px] text-muted-foreground/50">·</span>
              <span className="text-[11px] text-muted-foreground/70">{tx.paymentMethod === 'credito' ? 'Credito' : 'Conta corrente'}</span>
              {tx.mood && (
                <>
                  <span className="text-[11px] text-muted-foreground/40">·</span>
                  <span className={`text-[11px] ${MOOD_CONFIG[tx.mood].color}`}>{MOOD_CONFIG[tx.mood].label}</span>
                </>
              )}
            </div>
          </div>

          {/* Amount */}
          <span
            className="pr-5 text-sm font-semibold flex-shrink-0"
            style={{ color: tx.type === 'entrada' ? 'oklch(0.58 0.14 150)' : 'oklch(0.88 0.02 145)' }}
          >
            {tx.type === 'entrada' ? '+' : '-'}{tx.value.toFixed(2)}
          </span>
        </motion.div>
      ))}

      {/* Delete confirmation modal */}
      {selectedTxId && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'oklch(0.05 0.005 150 / 0.70)', backdropFilter: 'blur(20px)' }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="glass-strong w-full rounded-t-[28px] border-t border-white/10 p-5 pb-10"
          >
            <p className="mb-1 text-sm font-semibold text-foreground">Como remover?</p>
            <p className="mb-4 text-xs text-muted-foreground">Escolha se quer esconder apenas a notificacao ou apagar o valor.</p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => { onHideNotification(selectedTxId); setSelectedTxId(null) }}
                className="glass-card w-full rounded-2xl py-3.5 text-sm text-muted-foreground transition-all hover:text-foreground"
                style={{ borderRadius: '14px' }}
              >
                Apagar apenas a notificacao
              </button>
              <button
                onClick={() => { onDeleteTransaction(selectedTxId); setSelectedTxId(null) }}
                className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.45 0.16 25), oklch(0.38 0.14 20))',
                  boxShadow: '0 4px 20px oklch(0.45 0.16 25 / 0.30)',
                }}
              >
                Apagar valor completo
              </button>
              <button
                onClick={() => setSelectedTxId(null)}
                className="w-full rounded-2xl py-3 text-sm text-muted-foreground/60 transition-colors hover:text-muted-foreground"
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
