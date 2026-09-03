'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, FileText, TrendingUp, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSpendingControlSnapshot, getTransactions } from '@/lib/store'
import { MOOD_CONFIG, CATEGORY_LABELS } from '@/lib/types'
import type { TransactionCategory, MoodType } from '@/lib/types'

const moodChartColors: Record<string, string> = {
  ansiedade: '#b8952a',
  tedio: '#5a6a5a',
  euforia: '#4d8a4d',
  tristeza: '#4a7a8a',
  calmaria: '#3d7a3d',
}

const catChartColors = ['#4d8a4d', '#4d7a8a', '#3d7a4d', '#b8952a', '#8a6d4d', '#4a6d8a', '#7a5d7a', '#5a5a4a']

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
    prev.total += tx.value; prev.count += 1
    moodMap.set(tx.mood, prev)
  }
  const moodChartData = Array.from(moodMap.entries()).map(([mood, data]) => ({
    name: MOOD_CONFIG[mood as MoodType]?.label || mood,
    total: data.total,
    mood,
  }))

  const categoryMap = new Map<string, number>()
  for (const tx of expenseTransactions) {
    categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.value)
  }
  const catChartData = Array.from(categoryMap.entries()).map(([category, total]) => ({
    name: CATEGORY_LABELS[category as TransactionCategory] || category,
    total,
  }))

  const typeChartData = [
    { name: 'Entradas', total: totalIncome, color: '#4d8a4d' },
    { name: 'Saidas', total: totalExpenses, color: '#c04444' },
  ].filter(item => item.total > 0)

  const topCategoryPercent = spendingControl.totalSpent > 0 && spendingControl.topCategory
    ? Math.round((spendingControl.topCategory.total / spendingControl.totalSpent) * 100)
    : 0

  const handleExportCSV = () => {
    const headers = 'Data,Descricao,Categoria,Tipo,Metodo,Valor,Humor,Regra\n'
    const rows = transactions.map(t =>
      `${new Date(t.timestamp).toLocaleDateString('pt-BR')},${t.description},${CATEGORY_LABELS[t.category]},${t.type},${t.paymentMethod},${t.value.toFixed(2)},${t.mood || 'N/A'},${t.excludeFromSavingsAdvice ? 'Mensalidade' : ''}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'mdmr-relatorio.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleGeneratePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const margin = 14
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - margin * 2

    doc.setFillColor(10, 12, 9)
    doc.rect(0, 0, 210, 42, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.text('Relatorio Financeiro mdmr', 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(130, 150, 130)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 28)

    doc.setTextColor(50, 50, 50)
    doc.setFontSize(12)
    let y = 52
    const metrics = [
      `Total de transacoes: ${transactions.length}`,
      `Receitas do periodo: R$ ${totalIncome.toFixed(2)}`,
      `Gastos do periodo: R$ ${totalExpenses.toFixed(2)}`,
      `Gastos impulsivos: R$ ${impulsiveExpenses.toFixed(2)} (${impulsivePercent}%)`,
    ]
    metrics.forEach(line => { doc.text(line, margin, y); y += 8 })

    doc.setFontSize(13); doc.setTextColor(50, 50, 50)
    doc.text('Detalhamento', margin, y + 8)
    doc.setFontSize(9); doc.setTextColor(50, 50, 50)
    y += 18
    for (const tx of transactions) {
      const sign = tx.type === 'entrada' ? '+' : '-'
      const adviceFlag = tx.excludeFromSavingsAdvice ? ' [mensalidade]' : ''
      const line = `${new Date(tx.timestamp).toLocaleDateString('pt-BR')} | ${tx.description}${adviceFlag} | ${tx.paymentMethod === 'credito' ? 'Credito' : 'Conta'} | ${sign}R$ ${tx.value.toFixed(2)}`
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
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5 px-5 pb-32 pt-6"
    >
      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Insights</p>
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">Humor vs. Gastos</h2>
      </div>

      {/* Impulsive spending */}
      {impulsivePercent > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass flex items-center gap-3 rounded-2xl border-vanessa-warning/20 p-4"
        >
          <Brain className="h-8 w-8 flex-shrink-0 text-vanessa-warning" />
          <div>
            <p className="text-sm font-semibold text-vanessa-warning">{impulsivePercent}% dos gastos foram impulsivos</p>
            <p className="text-xs text-muted-foreground">Momentos de ansiedade ou euforia</p>
          </div>
        </motion.div>
      )}

      {/* Spending control */}
      {(spendingControl.monthlyLimit || spendingControl.topCategory || spendingControl.overCategoryLimits.length > 0) && (
        <div className="glass flex flex-col gap-3 rounded-2xl p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Controle inteligente</p>
          {spendingControl.monthlyLimit && (
            <p className="text-sm text-foreground">
              Gasto do mes: <strong className="text-vanessa-success">R$ {spendingControl.totalSpent.toFixed(2)}</strong>
              {' '}de meta <strong className="text-foreground">R$ {spendingControl.monthlyLimit.toFixed(2)}</strong>
              {spendingControl.monthlyUsagePercent !== null && (
                <span className={spendingControl.monthlyUsagePercent >= 100 ? 'text-vanessa-danger' : 'text-muted-foreground'}>
                  {' '}({spendingControl.monthlyUsagePercent}% usado)
                </span>
              )}
            </p>
          )}
          {spendingControl.topCategory && (
            <p className="text-sm text-foreground">
              Maior foco: <strong className="text-vanessa-success">{CATEGORY_LABELS[spendingControl.topCategory.category]}</strong>
              {' '}(R$ {spendingControl.topCategory.total.toFixed(2)} / {topCategoryPercent}% do total)
            </p>
          )}
          {spendingControl.overCategoryLimits.length > 0 && (
            <div className="rounded-xl bg-vanessa-warning/10 px-3 py-2.5 text-xs">
              {spendingControl.overCategoryLimits.map(item => (
                <p key={item.category} className="text-vanessa-warning">
                  Limite estourado em {CATEGORY_LABELS[item.category]}: R$ {item.total.toFixed(2)} de R$ {item.limit.toFixed(2)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mood chart */}
      {moodChartData.length > 0 && (
        <ChartSection title="Gastos por Humor">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={moodChartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6a8a6a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6a8a6a' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,12,9,0.9)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 11,
                }}
                formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Total']}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {moodChartData.map((entry, i) => (
                  <Cell key={i} fill={moodChartColors[entry.mood] || '#4d8a4d'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* Category chart */}
      {catChartData.length > 0 && (
        <ChartSection title="Gastos por Categoria">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catChartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6a8a6a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6a8a6a' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,12,9,0.9)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 11,
                }}
                formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Total']}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {catChartData.map((_, i) => (
                  <Cell key={i} fill={catChartColors[i % catChartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* Type chart */}
      {moodChartData.length === 0 && catChartData.length === 0 && typeChartData.length > 0 && (
        <ChartSection title="Entradas vs Saidas">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeChartData} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6a8a6a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6a8a6a' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,12,9,0.9)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 11,
                }}
                formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Total']}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {typeChartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {/* Empty state */}
      {moodChartData.length === 0 && catChartData.length === 0 && typeChartData.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-14">
          <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Registre gastos para ver insights</p>
        </div>
      )}

      {/* Export buttons */}
      <div className="flex gap-3">
        {[
          { label: 'Gerar Relatorio', Icon: FileText, action: handleGeneratePDF },
          { label: 'Exportar CSV', Icon: Download, action: handleExportCSV },
        ].map(({ label, Icon, action }) => (
          <button
            key={label}
            onClick={action}
            className="glass-card flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium text-foreground hover:bg-white/[0.06]"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function ChartSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
      <div className="glass rounded-2xl p-3">
        {children}
      </div>
    </div>
  )
}
