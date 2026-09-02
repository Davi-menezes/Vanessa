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

const glassInput = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: 'oklch(0.14 0.020 150 / 0.55)',
  backdropFilter: 'blur(16px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
  border: '1px solid oklch(1 0 0 / 0.10)',
  boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.10), inset 0 -1px 0 oklch(0 0 0 / 0.25)',
  borderRadius: '14px',
  color: 'oklch(0.88 0.02 145)',
  ...extra,
})

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
    const finalDescription = type === 'entrada' ? (description.trim() || (incomeKind === 'salario' ? 'Salario' : '')) : description.trim()
    if (!finalDescription) return
    const finalCategory: TransactionCategory = type === 'entrada' && incomeKind === 'salario' ? 'outros' : category
    const finalPaymentMethod: PaymentMethod = type === 'entrada' ? 'conta_corrente' : paymentMethod
    onAdd({ value: numValue, category: finalCategory, type, paymentMethod: finalPaymentMethod, description: finalDescription, excludeFromSavingsAdvice: type === 'saida' && finalCategory === 'educacao' && isEducationTuition })
  }

  const toggleBtn = (active: boolean, color: string): React.CSSProperties => ({
    background: active ? color : 'oklch(0.16 0.022 150 / 0.60)',
    backdropFilter: active ? 'blur(12px)' : 'none',
    border: active ? `1px solid ${color.replace('/ 0.35', '/ 0.55')}` : '1px solid transparent',
    boxShadow: active ? `inset 0 1px 0 oklch(1 0 0 / 0.10), 0 0 16px ${color}` : 'none',
    color: active ? 'oklch(0.88 0.02 145)' : 'oklch(0.50 0.025 150)',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    fontWeight: 500,
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'oklch(0.05 0.005 150 / 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="glass-strong w-full rounded-t-[28px] border-t border-white/10 p-6 pb-10"
        style={{ boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.12), 0 -24px 64px oklch(0 0 0 / 0.60)' }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[17px] font-semibold text-foreground">Nova Transacao</h3>
          <button
            onClick={onClose}
            className="glass-card flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
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
                className="flex-1 py-2.5 text-sm"
                style={toggleBtn(type === t, type === 'saida' ? 'oklch(0.50 0.18 25 / 0.30)' : 'oklch(0.38 0.14 150 / 0.35)')}
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
                  onClick={() => { setIncomeKind(k); if (k === 'salario') { setCategory('outros'); if (!description.trim()) setDescription('Salario') } else if (description === 'Salario') setDescription('') }}
                  className="flex-1 py-2 text-xs"
                  style={toggleBtn(incomeKind === k, k === 'salario' ? 'oklch(0.38 0.14 150 / 0.25)' : 'oklch(0.32 0.11 152 / 0.30)')}
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
                  className="flex-1 py-2 text-xs"
                  style={toggleBtn(paymentMethod === m, m === 'conta_corrente' ? 'oklch(0.38 0.14 150 / 0.25)' : 'oklch(0.40 0.12 85 / 0.25)')}
                >
                  {m === 'conta_corrente' ? 'Conta corrente' : 'Credito'}
                </button>
              ))}
            </div>
          )}

          {/* Value */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium" style={{ color: 'oklch(0.55 0.025 150)' }}>Valor (R$)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">R$</span>
              <Input
                type="number" step="0.01" min="0"
                value={value} onChange={e => setValue(e.target.value)}
                placeholder="0.00"
                className="pl-10 text-base focus:outline-none focus:ring-0"
                style={glassInput({ paddingLeft: '2.75rem' })}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium" style={{ color: 'oklch(0.55 0.025 150)' }}>Descricao</Label>
            <Input
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder={type === 'entrada' ? 'Ex: Salario, Freela...' : 'Ex: Supermercado, Uber...'}
              className="focus:outline-none focus:ring-0"
              style={glassInput()}
              required
            />
          </div>

          {/* Category grid */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium" style={{ color: 'oklch(0.55 0.025 150)' }}>Categoria</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat} type="button"
                  onClick={() => { setCategory(cat); if (cat !== 'educacao') setIsEducationTuition(false) }}
                  className="py-2.5 text-[11px] font-medium rounded-xl transition-all"
                  style={toggleBtn(category === cat, 'oklch(0.35 0.13 150 / 0.35)')}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Education tuition */}
          {type === 'saida' && category === 'educacao' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium" style={{ color: 'oklch(0.55 0.025 150)' }}>Esse gasto e mensalidade?</Label>
              <div className="glass-card flex gap-1 rounded-2xl p-1">
                {[true, false].map(v => (
                  <button
                    key={String(v)} type="button"
                    onClick={() => setIsEducationTuition(v)}
                    className="flex-1 py-2 text-xs"
                    style={toggleBtn(isEducationTuition === v, v ? 'oklch(0.35 0.12 158 / 0.30)' : 'oklch(0.30 0.11 150 / 0.30)')}
                  >
                    {v ? 'Sim, mensalidade' : 'Nao, variavel'}
                  </button>
                ))}
              </div>
              {isEducationTuition && (
                <p className="text-[11px]" style={{ color: 'oklch(0.50 0.04 150)' }}>
                  Mensalidade nao entra nas sugestoes de "gastar menos" no Insights.
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, oklch(0.38 0.14 150) 0%, oklch(0.28 0.11 152) 100%)',
              boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.15), 0 0 0 1px oklch(0.45 0.14 150 / 0.25), 0 8px 28px oklch(0.38 0.14 150 / 0.35)',
            }}
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
