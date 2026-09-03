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
    const finalDescription = type === 'entrada'
      ? description.trim() || (incomeKind === 'salario' ? 'Salario' : '')
      : description.trim()
    if (!finalDescription) return
    const finalCategory: TransactionCategory = type === 'entrada' && incomeKind === 'salario' ? 'outros' : category
    const finalPaymentMethod: PaymentMethod = type === 'entrada' ? 'conta_corrente' : paymentMethod
    onAdd({ value: numValue, category: finalCategory, type, paymentMethod: finalPaymentMethod, description: finalDescription, excludeFromSavingsAdvice: type === 'saida' && finalCategory === 'educacao' && isEducationTuition })
  }

  const toggleBtn = (active: boolean, variant: 'green' | 'red' | 'amber' | 'neutral' = 'neutral') => {
    if (!active) return 'flex-1 rounded-xl py-2.5 text-sm text-muted-foreground transition-all'
    const activeCls = variant === 'green'
      ? 'bg-vanessa-success/20 text-vanessa-success shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
      : variant === 'red'
      ? 'bg-vanessa-danger/20 text-vanessa-danger shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
      : variant === 'amber'
      ? 'bg-vanessa-warning/20 text-vanessa-warning shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
      : 'bg-vanessa-lavender/20 text-vanessa-lavender shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
    return `flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${activeCls}`
  }

  const catBtn = (active: boolean) => `rounded-xl px-2 py-2.5 text-[11px] font-medium transition-all ${
    active ? 'bg-vanessa-lavender/20 text-vanessa-lavender shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : 'glass-card text-muted-foreground hover:text-foreground'
  }`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="glass-strong w-full rounded-t-3xl p-6 pb-10"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[17px] font-semibold text-foreground">Nova Transacao</h3>
          <button onClick={onClose} className="glass-card flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition hover:text-foreground" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Type toggle */}
          <div className="glass-card flex gap-1 rounded-2xl p-1">
            {(['saida', 'entrada'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setIncomeKind('salario'); setIsEducationTuition(false) }}
                className={toggleBtn(type === t, type === 'saida' ? 'red' : 'green')}
              >
                {t === 'saida' ? 'Saida' : 'Entrada'}
              </button>
            ))}
          </div>

          {/* Income kind */}
          {type === 'entrada' && (
            <div className="glass-card flex gap-1 rounded-2xl p-1">
              {(['salario', 'outro'] as const).map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setIncomeKind(k)
                    if (k === 'salario') { setCategory('outros'); if (!description.trim()) setDescription('Salario') }
                    else if (description === 'Salario') setDescription('')
                  }}
                  className={toggleBtn(incomeKind === k, k === 'salario' ? 'neutral' : 'neutral')}
                >
                  {k === 'salario' ? 'Salario' : 'Outra entrada'}
                </button>
              ))}
            </div>
          )}

          {/* Payment method */}
          {type === 'saida' && (
            <div className="glass-card flex gap-1 rounded-2xl p-1">
              {(['conta_corrente', 'credito'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={toggleBtn(paymentMethod === m, m === 'conta_corrente' ? 'green' : 'amber')}
                >
                  {m === 'conta_corrente' ? 'Conta corrente' : 'Credito'}
                </button>
              ))}
            </div>
          )}

          {/* Value */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
            <Input
              type="number" step="0.01" min="0"
              value={value} onChange={e => setValue(e.target.value)}
              placeholder="0.00"
              className="input-glass rounded-2xl border-white/[0.08] bg-transparent"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Descricao</Label>
            <Input
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder={type === 'entrada' ? 'Ex: Salario, Freela...' : 'Ex: Supermercado, Uber...'}
              className="input-glass rounded-2xl border-white/[0.08] bg-transparent"
              required
            />
          </div>

          {/* Category grid */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Categoria</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => { setCategory(cat); if (cat !== 'educacao') setIsEducationTuition(false) }} className={catBtn(category === cat)}>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Education tuition */}
          {type === 'saida' && category === 'educacao' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Esse gasto e mensalidade?</Label>
              <div className="glass-card flex gap-1 rounded-2xl p-1">
                {[true, false].map(v => (
                  <button
                    key={String(v)} type="button"
                    onClick={() => setIsEducationTuition(v)}
                    className={toggleBtn(isEducationTuition === v, v ? 'amber' : 'neutral')}
                  >
                    {v ? 'Sim, mensalidade' : 'Nao, variavel'}
                  </button>
                ))}
              </div>
              {isEducationTuition && (
                <p className="text-[11px] text-muted-foreground">
                  Mensalidade nao entra nas sugestoes de "gastar menos" no Insights.
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="btn-primary mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
