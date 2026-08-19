'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PaymentMethod, TransactionCategory, TransactionType } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

interface AddTransactionFormProps {
  onAdd: (data: { value: number; category: TransactionCategory; type: TransactionType; paymentMethod: PaymentMethod; description: string; excludeFromSavingsAdvice: boolean }) => void
  onClose: () => void
}

const categories = Object.keys(CATEGORY_LABELS) as TransactionCategory[]

export function AddTransactionForm({ onAdd, onClose }: AddTransactionFormProps) {
  const [value, setValue] = useState('')
  const [category, setCategory] = useState<TransactionCategory>('alimentacao')
  const [type, setType] = useState<TransactionType>('saida')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('conta_corrente')
  const [description, setDescription] = useState('')
  const [incomeKind, setIncomeKind] = useState<'salario' | 'outro'>('salario')
  const [isEducationTuition, setIsEducationTuition] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) return

    const finalDescription =
      type === 'entrada'
        ? (
            description.trim()
            || (incomeKind === 'salario' ? 'Salario' : '')
          )
        : description.trim()

    if (!finalDescription) return

    const finalCategory: TransactionCategory =
      type === 'entrada' && incomeKind === 'salario'
        ? 'outros'
        : category

    const finalPaymentMethod: PaymentMethod = type === 'entrada' ? 'conta_corrente' : paymentMethod
    onAdd({
      value: numValue,
      category: finalCategory,
      type,
      paymentMethod: finalPaymentMethod,
      description: finalDescription,
      excludeFromSavingsAdvice: type === 'saida' && finalCategory === 'educacao' && isEducationTuition,
    })
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
              onClick={() => {
                setType('saida')
                setIncomeKind('salario')
                setIsEducationTuition(false)
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${type === 'saida' ? 'bg-vanessa-danger/20 text-vanessa-danger' : 'text-muted-foreground'}`}
            >
              Saida
            </button>
            <button
              type="button"
              onClick={() => {
                setType('entrada')
                setIsEducationTuition(false)
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${type === 'entrada' ? 'bg-vanessa-success/20 text-vanessa-success' : 'text-muted-foreground'}`}
            >
              Entrada
            </button>
          </div>

          {type === 'entrada' && (
            <div className="flex gap-2 rounded-xl bg-secondary/40 p-1">
              <button
                type="button"
                onClick={() => {
                  setIncomeKind('salario')
                  setCategory('outros')
                  if (!description.trim()) setDescription('Salario')
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                  incomeKind === 'salario'
                    ? 'bg-vanessa-success/20 text-vanessa-success'
                    : 'text-muted-foreground'
                }`}
              >
                Salario
              </button>
              <button
                type="button"
                onClick={() => {
                  setIncomeKind('outro')
                  if (description.trim() === 'Salario') setDescription('')
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                  incomeKind === 'outro'
                    ? 'bg-vanessa-lavender/20 text-vanessa-lavender'
                    : 'text-muted-foreground'
                }`}
              >
                Outra entrada
              </button>
            </div>
          )}

          {type === 'saida' && (
            <div className="flex gap-2 rounded-xl bg-secondary/40 p-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('conta_corrente')}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                  paymentMethod === 'conta_corrente'
                    ? 'bg-vanessa-success/20 text-vanessa-success'
                    : 'text-muted-foreground'
                }`}
              >
                Conta corrente
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('credito')}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                  paymentMethod === 'credito'
                    ? 'bg-vanessa-warning/20 text-vanessa-warning'
                    : 'text-muted-foreground'
                }`}
              >
                Credito
              </button>
            </div>
          )}

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
              placeholder={type === 'entrada' ? 'Ex: Salario, Freela...' : 'Ex: Supermercado, Uber...'}
              className="border-border bg-secondary/50"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Categoria</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <motion.button
                  key={cat}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCategory(cat)
                    if (cat !== 'educacao') setIsEducationTuition(false)
                  }}
                  className={`rounded-lg border px-2 py-2 text-[11px] transition-colors ${
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

          {type === 'saida' && category === 'educacao' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Esse gasto e mensalidade?</Label>
              <div className="flex gap-2 rounded-xl bg-secondary/40 p-1">
                <button
                  type="button"
                  onClick={() => setIsEducationTuition(true)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium ${
                    isEducationTuition ? 'bg-vanessa-calm/20 text-vanessa-calm' : 'text-muted-foreground'
                  }`}
                >
                  Sim, mensalidade
                </button>
                <button
                  type="button"
                  onClick={() => setIsEducationTuition(false)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium ${
                    !isEducationTuition ? 'bg-vanessa-lavender/20 text-vanessa-lavender' : 'text-muted-foreground'
                  }`}
                >
                  Nao, gasto variavel
                </button>
              </div>
              {isEducationTuition && (
                <p className="text-[11px] text-muted-foreground">
                  Mensalidade nao entra nas sugestoes de "gastar menos" do Insights.
                </p>
              )}
            </div>
          )}

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
