'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { TransactionList } from './transaction-list'
import { getTransactions, getMonthlyBalance } from '@/lib/store'
import type { Transaction } from '@/lib/types'

interface TransactionsViewProps {
  transactions: Transaction[]
  onSleep: (id: string) => void
  onDelete: (id: string) => void
  onAddNew: () => void
}

export function TransactionsView({ transactions, onSleep, onDelete, onAddNew }: TransactionsViewProps) {
  const balance = getMonthlyBalance()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 px-5 pb-28 pt-6"
    >
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Transacoes</p>
          <h2 className="text-xl font-semibold text-foreground">Suas Movimentacoes</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onAddNew}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-vanessa-lavender text-primary-foreground"
          aria-label="Adicionar transacao"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl border border-border/50 bg-secondary/20 px-3 py-3">
          <p className="text-[10px] text-muted-foreground">Este mes</p>
          <p className="text-lg font-bold text-vanessa-danger">-R$ {balance.expenses.toFixed(2)}</p>
        </div>
        <div className="flex-1 rounded-xl border border-border/50 bg-secondary/20 px-3 py-3">
          <p className="text-[10px] text-muted-foreground">Transacoes</p>
          <p className="text-lg font-bold text-foreground">{transactions.filter(t => !t.sleeping).length}</p>
        </div>
      </div>

      <TransactionList transactions={transactions} onSleep={onSleep} onDelete={onDelete} />
    </motion.div>
  )
}
