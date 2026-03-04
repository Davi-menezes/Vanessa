'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TransactionCategory, TransactionType } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

interface AddTransactionFormProps {
  onAdd: (data: { value: number; category: TransactionCategory; type: TransactionType; description: string }) => void
  onClose: () => void
}

const categories = Object.keys(CATEGORY_LABELS) as TransactionCategory[]

export function AddTransactionForm({ onAdd, onClose }: AddTransactionFormProps) {
  const [value, setValue] = useState('')
  const [category, setCategory] = useState<TransactionCategory>('alimentacao')
  const [type, setType] = useState<TransactionType>('saida')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0 || !description.trim()) return
    onAdd({ value: numValue, category, type, description: description.trim() })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full rounded-t-3xl border-t border-border bg-card p-6 pb-10"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Nova Transacao</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="flex gap-2 rounded-xl bg-secondary/50 p-1">
            <button
              type="button"
              onClick={() => setType('saida')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${type === 'saida' ? 'bg-vanessa-danger/20 text-vanessa-danger' : 'text-muted-foreground'}`}
            >
              Saida
            </button>
            <button
              type="button"
              onClick={() => setType('entrada')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${type === 'entrada' ? 'bg-vanessa-success/20 text-vanessa-success' : 'text-muted-foreground'}`}
            >
              Entrada
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="0.00"
              className="border-border bg-secondary/50 text-lg"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Descricao</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Supermercado, Uber..."
              className="border-border bg-secondary/50"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Categoria</Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(cat => (
                <motion.button
                  key={cat}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(cat)}
                  className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
                    category === cat
                      ? 'border-vanessa-lavender/50 bg-vanessa-lavender/15 text-vanessa-lavender'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </motion.button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="mt-2 gap-2 bg-vanessa-lavender text-primary-foreground hover:bg-vanessa-lavender/90"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </form>
      </motion.div>
    </motion.div>
  )
}
