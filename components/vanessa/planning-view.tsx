'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PiggyBank, Plane, ShoppingBag, Trash2, WalletCards, CalendarDays, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  addFixedCost,
  addPiggyBank,
  addPlanningGoal,
  deleteFixedCost,
  deletePiggyBank,
  deletePlanningGoal,
  getFixedCosts,
  getMonthlyFixedCostsTotal,
  getMonthlyIncomeFromTransactions,
  getPiggyBanks,
  getPlanningGoals,
  isFixedCostPaidInMonth,
  markFixedCostAsPaid,
  updateFixedCost,
  updatePiggyBank,
} from '@/lib/store'
import type { FixedCost } from '@/lib/types'

const FIXED_COST_LABELS: Record<FixedCost['category'], string> = {
  moradia: 'Moradia',
  educacao: 'Educacao',
  transporte: 'Transporte',
  combustivel: 'Combustivel',
  saude: 'Saude',
  assinaturas: 'Assinaturas',
  outros: 'Outros',
}

export function PlanningView() {
  const [piggyBanks, setPiggyBanks] = useState(getPiggyBanks())
  const [planningGoals, setPlanningGoals] = useState(getPlanningGoals())
  const [fixedCosts, setFixedCosts] = useState(getFixedCosts())

  const [piggyName, setPiggyName] = useState('')
  const [piggyTarget, setPiggyTarget] = useState('')
  const [goalTitle, setGoalTitle] = useState('')
  const [goalType, setGoalType] = useState<'viagem' | 'compra'>('viagem')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalMonths, setGoalMonths] = useState('12')
  const [fixedName, setFixedName] = useState('')
  const [fixedAmount, setFixedAmount] = useState('')
  const [fixedDueDay, setFixedDueDay] = useState('10')
  const [fixedCategory, setFixedCategory] = useState<FixedCost['category']>('moradia')
  const [piggyAdjustById, setPiggyAdjustById] = useState<Record<string, string>>({})
  const [fixedEditById, setFixedEditById] = useState<Record<string, string>>({})

  const refreshData = () => {
    setPiggyBanks(getPiggyBanks())
    setPlanningGoals(getPlanningGoals())
    setFixedCosts(getFixedCosts())
  }

  const income = getMonthlyIncomeFromTransactions()
  const fixedTotal = getMonthlyFixedCostsTotal()

  const monthlyGoalsTotal = useMemo(
    () => planningGoals.reduce((sum, goal) => sum + goal.targetAmount / Math.max(goal.targetMonths, 1), 0),
    [planningGoals]
  )

  const availableAfterFixed = Math.max(income - fixedTotal, 0)
  const availableAfterPlan = availableAfterFixed - monthlyGoalsTotal

  const handleAddPiggyBank = (e: React.FormEvent) => {
    e.preventDefault()
    const target = Number(piggyTarget)
    if (!piggyName.trim() || !Number.isFinite(target) || target <= 0) return
    addPiggyBank({
      name: piggyName.trim(),
      savedAmount: 0,
      targetAmount: target,
    })
    setPiggyName('')
    setPiggyTarget('')
    refreshData()
  }

  const handlePiggyDelta = (id: string, delta: number) => {
    const current = piggyBanks.find(item => item.id === id)
    if (!current) return
    const nextSaved = Math.max(current.savedAmount + delta, 0)
    updatePiggyBank(id, { savedAmount: nextSaved })
    refreshData()
  }

  const getPiggyAdjustValue = (id: string): number => {
    const raw = piggyAdjustById[id] || ''
    const parsed = Number(raw.replace(',', '.'))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const target = Number(goalTarget)
    const months = Number(goalMonths)
    if (!goalTitle.trim() || !Number.isFinite(target) || target <= 0 || !Number.isFinite(months) || months <= 0) return
    addPlanningGoal({
      title: goalTitle.trim(),
      type: goalType,
      targetAmount: target,
      targetMonths: Math.floor(months),
    })
    setGoalTitle('')
    setGoalTarget('')
    setGoalMonths('12')
    refreshData()
  }

  const handleAddFixedCost = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(fixedAmount)
    const dueDay = Number(fixedDueDay)
    if (!fixedName.trim() || !Number.isFinite(amount) || amount <= 0) return
    if (!Number.isFinite(dueDay) || dueDay < 1 || dueDay > 31) return
    addFixedCost({
      name: fixedName.trim(),
      amount,
      dueDay: Math.floor(dueDay),
      category: fixedCategory,
    })
    setFixedName('')
    setFixedAmount('')
    setFixedDueDay('10')
    setFixedCategory('moradia')
    refreshData()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 px-5 pb-28 pt-6"
    >
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Planejamento</p>
        <h2 className="text-xl font-semibold text-foreground">Cofrinhos, Viagem e Gastos Fixos</h2>
      </div>

      <div className="rounded-2xl border border-vanessa-lavender/20 bg-secondary/20 p-4">
        <p className="text-xs text-muted-foreground">Resumo mensal</p>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Receitas</p>
            <p className="font-semibold text-vanessa-success">R$ {income.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gastos fixos</p>
            <p className="font-semibold text-vanessa-danger">R$ {fixedTotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Metas/mês</p>
            <p className="font-semibold text-foreground">R$ {monthlyGoalsTotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Sobra planejada</p>
            <p className={`font-semibold ${availableAfterPlan >= 0 ? 'text-vanessa-success' : 'text-vanessa-warning'}`}>
              R$ {availableAfterPlan.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-4 w-4 text-vanessa-lavender" />
          <h3 className="text-sm font-medium text-secondary-foreground">Cofrinhos</h3>
        </div>

        <form onSubmit={handleAddPiggyBank} className="grid grid-cols-1 gap-2 rounded-2xl border border-border/50 bg-card p-3">
          <Input
            value={piggyName}
            onChange={e => setPiggyName(e.target.value)}
            placeholder="Nome do cofrinho (ex: Viagem Recife)"
            className="border-border bg-secondary/40"
            required
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            value={piggyTarget}
            onChange={e => setPiggyTarget(e.target.value)}
            placeholder="Meta total (R$)"
            className="border-border bg-secondary/40"
            required
          />
          <Button type="submit" className="gap-2 bg-vanessa-lavender text-primary-foreground hover:bg-vanessa-lavender/90">
            <Plus className="h-4 w-4" />
            Criar cofrinho
          </Button>
        </form>

        {piggyBanks.map(item => {
          const progress = item.targetAmount > 0 ? Math.min((item.savedAmount / item.targetAmount) * 100, 100) : 0
          const adjustValue = getPiggyAdjustValue(item.id)
          return (
            <div key={item.id} className="rounded-2xl border border-border/40 bg-secondary/20 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <button onClick={() => { deletePiggyBank(item.id); refreshData() }} aria-label="Remover cofrinho">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                R$ {item.savedAmount.toFixed(2)} de R$ {item.targetAmount.toFixed(2)}
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-vanessa-lavender transition-all" style={{ width: `${progress}%` }} />
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={piggyAdjustById[item.id] || ''}
                onChange={e => setPiggyAdjustById(prev => ({ ...prev, [item.id]: e.target.value }))}
                placeholder="Valor para adicionar/remover"
                className="mt-3 border-border bg-secondary/30"
              />
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-border text-secondary-foreground"
                  onClick={() => {
                    if (adjustValue <= 0) return
                    handlePiggyDelta(item.id, adjustValue)
                  }}
                >
                  + valor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-border text-secondary-foreground"
                  onClick={() => {
                    if (adjustValue <= 0) return
                    handlePiggyDelta(item.id, -adjustValue)
                  }}
                >
                  - valor
                </Button>
              </div>
            </div>
          )
        })}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-vanessa-calm" />
          <h3 className="text-sm font-medium text-secondary-foreground">Planejamento de Viagem ou Compra</h3>
        </div>

        <form onSubmit={handleAddGoal} className="rounded-2xl border border-border/50 bg-card p-3">
          <div className="flex flex-col gap-2">
            <Input
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
              placeholder="Ex: Viajar para Fortaleza / Notebook"
              className="border-border bg-secondary/40"
              required
            />
            <div className="flex gap-2 rounded-xl bg-secondary/40 p-1">
              <button
                type="button"
                onClick={() => setGoalType('viagem')}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs ${goalType === 'viagem' ? 'bg-vanessa-lavender/20 text-vanessa-lavender' : 'text-muted-foreground'}`}
              >
                <Plane className="h-3.5 w-3.5" />
                Viagem
              </button>
              <button
                type="button"
                onClick={() => setGoalType('compra')}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs ${goalType === 'compra' ? 'bg-vanessa-calm/20 text-vanessa-calm' : 'text-muted-foreground'}`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Compra
              </button>
            </div>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={goalTarget}
              onChange={e => setGoalTarget(e.target.value)}
              placeholder="Valor total da meta (R$)"
              className="border-border bg-secondary/40"
              required
            />
            <Input
              type="number"
              min="1"
              value={goalMonths}
              onChange={e => setGoalMonths(e.target.value)}
              placeholder="Prazo em meses"
              className="border-border bg-secondary/40"
              required
            />
            <Button type="submit" className="gap-2 bg-vanessa-lavender text-primary-foreground hover:bg-vanessa-lavender/90">
              <Plus className="h-4 w-4" />
              Adicionar planejamento
            </Button>
          </div>
        </form>

        {planningGoals.map(goal => {
          const monthlyNeed = goal.targetAmount / Math.max(goal.targetMonths, 1)
          const canFit = availableAfterFixed >= monthlyGoalsTotal
          return (
            <div key={goal.id} className="rounded-2xl border border-border/40 bg-secondary/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {goal.type === 'viagem' ? <Plane className="h-4 w-4 text-vanessa-lavender" /> : <ShoppingBag className="h-4 w-4 text-vanessa-calm" />}
                  <p className="text-sm font-medium text-foreground">{goal.title}</p>
                </div>
                <button onClick={() => { deletePlanningGoal(goal.id); refreshData() }} aria-label="Remover meta">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Meta: R$ {goal.targetAmount.toFixed(2)} em {goal.targetMonths} meses
              </p>
              <p className="text-sm font-semibold text-foreground">Reserve ~ R$ {monthlyNeed.toFixed(2)} por mes</p>
              <p className={`mt-1 text-xs ${canFit ? 'text-vanessa-success' : 'text-vanessa-warning'}`}>
                {canFit
                  ? 'Planejamento viavel com sua renda atual.'
                  : 'Metas acima da sobra mensal. Ajuste prazo, valores ou reduza custos.'}
              </p>
            </div>
          )
        })}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <WalletCards className="h-4 w-4 text-vanessa-warning" />
          <h3 className="text-sm font-medium text-secondary-foreground">Gastos Fixos</h3>
        </div>

        <form onSubmit={handleAddFixedCost} className="rounded-2xl border border-border/50 bg-card p-3">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Nome</Label>
            <Input
              value={fixedName}
              onChange={e => setFixedName(e.target.value)}
              placeholder="Ex: Faculdade, Plano celular"
              className="border-border bg-secondary/40"
              required
            />
            <Label className="text-xs text-muted-foreground">Valor mensal</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={fixedAmount}
              onChange={e => setFixedAmount(e.target.value)}
              placeholder="R$ 0,00"
              className="border-border bg-secondary/40"
              required
            />
            <Label className="text-xs text-muted-foreground">Dia de vencimento</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={fixedDueDay}
              onChange={e => setFixedDueDay(e.target.value)}
              placeholder="Dia"
              className="border-border bg-secondary/40"
              required
            />
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FIXED_COST_LABELS) as FixedCost['category'][]).map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFixedCategory(category)}
                  className={`rounded-lg border px-2 py-2 text-xs ${
                    fixedCategory === category
                      ? 'border-vanessa-lavender/40 bg-vanessa-lavender/15 text-vanessa-lavender'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {FIXED_COST_LABELS[category]}
                </button>
              ))}
            </div>
            <Button type="submit" className="gap-2 bg-vanessa-lavender text-primary-foreground hover:bg-vanessa-lavender/90">
              <Plus className="h-4 w-4" />
              Adicionar gasto fixo
            </Button>
          </div>
        </form>

        {fixedCosts.map(item => (
          <div key={item.id} className="rounded-2xl border border-border/40 bg-secondary/20 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{FIXED_COST_LABELS[item.category]}</p>
              </div>
              <button onClick={() => { deleteFixedCost(item.id); refreshData() }} aria-label="Remover gasto fixo">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <p className="font-semibold text-vanessa-danger">R$ {item.amount.toFixed(2)}</p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                dia {item.dueDay}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={fixedEditById[item.id] ?? String(item.amount)}
                onChange={e => setFixedEditById(prev => ({ ...prev, [item.id]: e.target.value }))}
                className="border-border bg-secondary/30"
              />
              <Button
                type="button"
                variant="outline"
                className="border-border text-secondary-foreground"
                onClick={() => {
                  const value = Number((fixedEditById[item.id] ?? String(item.amount)).replace(',', '.'))
                  if (!Number.isFinite(value) || value <= 0) return
                  updateFixedCost(item.id, { amount: value })
                  refreshData()
                }}
              >
                Atualizar
              </Button>
            </div>
            <div className="mt-3">
              {isFixedCostPaidInMonth(item.id) ? (
                <p className="rounded-xl bg-vanessa-success/10 px-3 py-2 text-xs text-vanessa-success">
                  Pago neste mes (ja entrou na saida e no relatorio)
                </p>
              ) : (
                <Button
                  type="button"
                  className="w-full bg-vanessa-lavender text-primary-foreground hover:bg-vanessa-lavender/90"
                  onClick={() => {
                    const edited = Number((fixedEditById[item.id] ?? String(item.amount)).replace(',', '.'))
                    const customValue = Number.isFinite(edited) && edited > 0 ? edited : item.amount
                    updateFixedCost(item.id, { amount: customValue })
                    markFixedCostAsPaid(item.id, customValue)
                    refreshData()
                  }}
                >
                  Marcar como pago
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>
    </motion.div>
  )
}
