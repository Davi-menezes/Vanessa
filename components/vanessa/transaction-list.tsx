'use client'

import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, TrendingUp, Moon } from 'lucide-react'
import type { Transaction } from '@/lib/types'
import { CATEGORY_LABELS, MOOD_CONFIG } from '@/lib/types'

interface TransactionListProps {
  transactions: Transaction[]
  onSleep: (id: string) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onSleep, onDelete }: TransactionListProps) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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
          className={`flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 ${tx.sleeping ? 'opacity-50' : ''}`}
        >
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
              {tx.sleeping && (
                <>
                  <span className="text-xs text-muted-foreground/50">{'|'}</span>
                  <span className="flex items-center gap-1 text-xs text-vanessa-calm">
                    <Moon className="h-3 w-3" />
                    Dormindo
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-sm font-semibold ${tx.type === 'entrada' ? 'text-vanessa-success' : 'text-foreground'}`}>
              {tx.type === 'entrada' ? '+' : '-'}R$ {tx.value.toFixed(2)}
            </span>
            <div className="flex gap-1">
              {!tx.sleeping && tx.type === 'saida' && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSleep(tx.id)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-vanessa-calm"
                  title="Dormir sobre o gasto"
                >
                  <Moon className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
