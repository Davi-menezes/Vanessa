'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, FileText, TrendingUp, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSpendingControlSnapshot, getTransactions } from '@/lib/store'
import { MOOD_CONFIG, CATEGORY_LABELS } from '@/lib/types'
import type { TransactionCategory, MoodType } from '@/lib/types'

const moodBarColors: Record<string, string> = {
  ansiedade: 'oklch(0.68 0.12 85)',
  tedio: 'oklch(0.50 0.02 200)',
  euforia: 'oklch(0.65 0.18 150)',
  tristeza: 'oklch(0.55 0.10 155)',
  calmaria: 'oklch(0.45 0.14 150)',
}

const catBarColors = [
  'oklch(0.48 0.14 150)', 'oklch(0.42 0.12 152)', 'oklch(0.50 0.11 160)',
  'oklch(0.65 0.12 85)', 'oklch(0.55 0.16 25)', 'oklch(0.55 0.10 145)',
  'oklch(0.60 0.10 120)', 'oklch(0.35 0.08 160)',
].map(c => c)

const glassPanelStyle: React.CSSProperties = {
  background: 'oklch(0.11 0.014 150 / 0.50)',
  backdropFilter: 'blur(20px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
  border: '1px solid oklch(1 0 0 / 0.09)',
  boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.10), inset 0 -1px 0 oklch(0 0 0 / 0.25), 0 4px 20px oklch(0 0 0 / 0.40)',
  borderRadius: '20px',
}

const tooltipStyle = {
  background: 'oklch(0.08 0.010 150 / 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid oklch(1 0 0 / 0.12)',
  borderRadius: '12px',
  fontSize: 11,
  color: 'oklch(0.88 0.02 145)',
}

export function InsightsView() {
  const transactions = getTransactions()
  const spendingControl = getSpendingControlSnapshot()

  const expenseTransactions = transactions.filter(t => t.type === 'saida' && !t.sleeping)
  const totalExpenses = expenseTransactions.reduce((s, t) => s + t.value, 0)
  const totalIncome = transactions.filter(t => t.type === 'entrada' && !t.sleeping).reduce((s, t) => s + t.value, 0)

  const impulsiveExpenses = expenseTransactions
    .filter(t => t.mood && MOOD_CONFIG[t.mood as MoodType]?.isImpulsive)
    .reduce((s, t) => s + t.value, 0)
  const impulsivePercent = totalExpenses > 0 ? Math.round((impulsiveExpenses / totalExpenses) * 100) : 0

  const moodMap = new Map<string, { total: number; count: number }>()
  for (const tx of expenseTransactions) {
    if (!tx.mood) continue
    const prev = moodMap.get(tx.mood) || { total: 0, count: 0 }
    prev.total += tx.value; prev.count += 1; moodMap.set(tx.mood, prev)
  }
  const moodChartData = Array.from(moodMap.entries()).map(([mood, data]) => ({
    name: MOOD_CONFIG[mood as MoodType]?.label || mood,
    total: data.total, mood,
  }))

  const categoryMap = new Map<string, number>()
  for (const tx of expenseTransactions) {
    categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.value)
  }
  const catChartData = Array.from(categoryMap.entries()).map(([category, total]) => ({
    name: CATEGORY_LABELS[category as TransactionCategory] || category, total,
  }))

  const typeChartData = [
    { name: 'Entradas', total: totalIncome, color: 'oklch(0.52 0.14 150)' },
    { name: 'Saidas', total: totalExpenses, color: 'oklch(0.55 0.16 25)' },
  ].filter(item => item.total > 0)

  const topCategoryPercent = spendingControl.totalSpent > 0 && spendingControl.topCategory
    ? Math.round((spendingControl.topCategory.total / spendingControl.totalSpent) * 100) : 0

  const handleExportCSV = () => {
    const headers = 'Data,Descricao,Categoria,Tipo,Metodo,Valor,Humor,Regra\n'
    const rows = transactions.map(t =>
      `${new Date(t.timestamp).toLocaleDateString('pt-BR')},${t.description},${CATEGORY_LABELS[t.category]},${t.type},${t.paymentMethod},${t.value.toFixed(2)},${t.mood || 'N/A'},${t.excludeFromSavingsAdvice ? 'Mensalidade' : ''}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'mdmr-relatorio.csv'; a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleGeneratePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const margin = 14; const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth(); const contentWidth = pageWidth - margin * 2

    doc.setFillColor(10, 13, 8)
    doc.rect(0, 0, 210, 42, 'F')
    doc.setTextColor(70, 130, 70); doc.setFontSize(20)
    doc.text('Relatorio Financeiro mdmr', 14, 18)
    doc.setFontSize(10); doc.setTextColor(120, 120, 120)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 28)

    doc.setTextColor(40, 40, 40); doc.setFontSize(12)
    const lines = [
      `Total de transacoes: ${transactions.length}`,
      `Receitas: R$ ${totalIncome.toFixed(2)}`,
      `Gastos: R$ ${totalExpenses.toFixed(2)}`,
      `Gastos impulsivos: R$ ${impulsiveExpenses.toFixed(2)} (${impulsivePercent}%)`,
    ]
    lines.forEach((line, i) => doc.text(line, 14, 52 + i * 7))

    doc.setFontSize(13); doc.text('Detalhamento', 14, 86)
    doc.setFontSize(9)
    let y = 94
    for (const tx of transactions) {
      const sign = tx.type === 'entrada' ? '+' : '-'
      const adviceFlag = tx.excludeFromSavingsAdvice ? ' [mensalidade]' : ''
      const line = `${new Date(tx.timestamp).toLocaleDateString('pt-BR')} | ${tx.description}${adviceFlag} | ${sign}R$ ${tx.value.toFixed(2)}`
      const wrapped = doc.splitTextToSize(line, contentWidth)
      const blockHeight = wrapped.length * 5 + 2
      if (y + blockHeight > pageHeight - 12) { doc.addPage(); y = 20 }
      doc.text(wrapped, margin, y); y += blockHeight
    }
    doc.save(`mdmr-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 px-5 pb-32 pt-6"
    >
      {/* Header */}
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">Insights</p>
        <h2 className="text-[22px] font-semibold text-foreground">Humor vs. Gastos</h2>
      </div>

      {/* Impulsive spending */}
      {impulsivePercent > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 22 }}
          className="flex items-center gap-3 px-4 py-4"
          style={{
            ...glassPanelStyle,
            borderColor: 'oklch(0.65 0.12 85 / 0.20)',
            boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.10), 0 0 24px oklch(0.65 0.12 85 / 0.20), 0 4px 20px oklch(0 0 0 / 0.40)',
          }}
        >
          <Brain className="h-8 w-8 flex-shrink-0" style={{ color: 'oklch(0.72 0.11 85)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'oklch(0.72 0.10 85)' }}>
              {impulsivePercent}% dos gastos foram impulsivos
            </p>
            <p className="text-xs text-muted-foreground">Momentos de ansiedade ou euforia</p>
          </div>
        </motion.div>
      )}

      {/* Spending control summary */}
      {(spendingControl.monthlyLimit || spendingControl.topCategory || spendingControl.overCategoryLimits.length > 0) && (
        <div className="flex flex-col gap-3 rounded-2xl p-4" style={glassPanelStyle}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Controle inteligente</p>
          {spendingControl.monthlyLimit && (
            <p className="text-sm text-foreground">
              Gasto do mes: <strong style={{ color: 'oklch(0.60 0.14 150)' }}>R$ {spendingControl.totalSpent.toFixed(2)}</strong>
              {' '}de meta <strong>R$ {spendingControl.monthlyLimit.toFixed(2)}</strong>
              {spendingControl.monthlyUsagePercent !== null && (
                <span style={{ color: spendingControl.monthlyUsagePercent >= 100 ? 'oklch(0.62 0.16 25)' : 'oklch(0.55 0.03 150)' }}>
                  {' '}({spendingControl.monthlyUsagePercent}% usado)
                </span>
              )}
            </p>
          )}
          {spendingControl.topCategory && (
            <p className="text-sm text-foreground">
              Maior foco: <strong style={{ color: 'oklch(0.58 0.13 150)' }}>{CATEGORY_LABELS[spendingControl.topCategory.category]}</strong>
              {' '}(R$ {spendingControl.topCategory.total.toFixed(2)} / {topCategoryPercent}% do total)
            </p>
          )}
          {spendingControl.overCategoryLimits.length > 0 && (
            <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background: 'oklch(0.60 0.12 85 / 0.10)', border: '1px solid oklch(0.65 0.10 85 / 0.18)' }}>
              {spendingControl.overCategoryLimits.map(item => (
                <p key={item.category} style={{ color: 'oklch(0.70 0.10 85)' }}>
                  Limite estourado em {CATEGORY_LABELS[item.category]}: R$ {item.total.toFixed(2)} de R$ {item.limit.toFixed(2)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      {moodChartData.length > 0 && (
        <ChartSection title="Gastos por Humor">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={moodChartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'oklch(0.45 0.02 200)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'oklch(0.45 0.02 200)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'oklch(1 0 0 / 0.04)' }} formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Total']} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {moodChartData.map((entry, i) => <Cell key={i} fill={moodBarColors[entry.mood] || 'oklch(0.45 0.14 150)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {catChartData.length > 0 && (
        <ChartSection title="Gastos por Categoria">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catChartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'oklch(0.45 0.02 200)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'oklch(0.45 0.02 200)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'oklch(1 0 0 / 0.04)' }} formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Total']} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {catChartData.map((_, i) => <Cell key={i} fill={catBarColors[i % catBarColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {moodChartData.length === 0 && catChartData.length === 0 && typeChartData.length > 0 && (
        <ChartSection title="Entradas vs Saidas">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeChartData} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'oklch(0.45 0.02 200)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'oklch(0.45 0.02 200)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'oklch(1 0 0 / 0.04)' }} formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Total']} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {typeChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {moodChartData.length === 0 && catChartData.length === 0 && typeChartData.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-14">
          <TrendingUp className="h-10 w-10" style={{ color: 'oklch(0.35 0.10 150 / 0.40)' }} />
          <p className="text-sm text-muted-foreground">Registre gastos para ver insights</p>
        </div>
      )}

      {/* Export */}
      <div className="flex gap-3">
        {[
          { label: 'Gerar Relatorio', Icon: FileText, action: handleGeneratePDF },
          { label: 'Exportar CSV', Icon: Download, action: handleExportCSV },
        ].map(({ label, Icon, action }) => (
          <Button
            key={label}
            onClick={action}
            variant="outline"
            className="flex-1 gap-2 rounded-2xl py-3 text-sm"
            style={{
              background: 'oklch(0.12 0.016 150 / 0.55)',
              backdropFilter: 'blur(16px) saturate(1.5)',
              border: '1px solid oklch(1 0 0 / 0.10)',
              boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.08), 0 2px 8px oklch(0 0 0 / 0.30)',
            }}
          >
            <Icon className="h-4 w-4" /> {label}
          </Button>
        ))}
      </div>
    </motion.div>
  )
}

function ChartSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold" style={{ color: 'oklch(0.70 0.03 150)' }}>{title}</h3>
      <div className="rounded-2xl p-3" style={{
        background: 'oklch(0.08 0.010 150 / 0.55)',
        backdropFilter: 'blur(20px) saturate(1.7)',
        border: '1px solid oklch(1 0 0 / 0.09)',
        boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.10), inset 0 -1px 0 oklch(0 0 0 / 0.20)',
      }}>
        {children}
      </div>
    </div>
  )
}
