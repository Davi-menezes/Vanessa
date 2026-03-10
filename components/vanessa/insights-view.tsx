'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, FileText, TrendingUp, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSpendingControlSnapshot, getTransactions } from '@/lib/store'
import { MOOD_CONFIG, CATEGORY_LABELS } from '@/lib/types'
import type { TransactionCategory, MoodType } from '@/lib/types'

const moodColors: Record<string, string> = {
  ansiedade: '#d4a030',
  tedio: '#888',
  euforia: '#a78bfa',
  tristeza: '#5b8db8',
  calmaria: '#5bb88d',
}

const catColors = ['#a78bfa', '#5b8db8', '#5bb88d', '#d4a030', '#e87c7c', '#7c9ee8', '#c77ce8', '#888']

export function InsightsView() {
  const transactions = getTransactions()
  const spendingControl = getSpendingControlSnapshot()

  const expenseTransactions = transactions.filter(t => t.type === 'saida' && !t.sleeping)
  const totalExpenses = expenseTransactions.reduce((s, t) => s + t.value, 0)
  const totalIncome = transactions.filter(t => t.type === 'entrada' && !t.sleeping).reduce((s, t) => s + t.value, 0)

  const impulsiveExpenses = expenseTransactions
    .filter(t => t.type === 'saida' && !t.sleeping && t.mood && MOOD_CONFIG[t.mood as MoodType]?.isImpulsive)
    .reduce((s, t) => s + t.value, 0)
  const impulsivePercent = totalExpenses > 0 ? Math.round((impulsiveExpenses / totalExpenses) * 100) : 0

  const moodMap = new Map<string, { total: number; count: number }>()
  for (const tx of expenseTransactions) {
    if (!tx.mood) continue
    const previous = moodMap.get(tx.mood) || { total: 0, count: 0 }
    previous.total += tx.value
    previous.count += 1
    moodMap.set(tx.mood, previous)
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
    { name: 'Entradas', total: totalIncome, color: '#5bb88d' },
    { name: 'Saidas', total: totalExpenses, color: '#e87c7c' },
  ].filter(item => item.total > 0)

  const topCategoryPercent = spendingControl.totalSpent > 0 && spendingControl.topCategory
    ? Math.round((spendingControl.topCategory.total / spendingControl.totalSpent) * 100)
    : 0

  const handleExportCSV = () => {
    const headers = 'Data,Descricao,Categoria,Tipo,Metodo,Valor,Humor\n'
    const rows = transactions.map(t =>
      `${new Date(t.timestamp).toLocaleDateString('pt-BR')},${t.description},${CATEGORY_LABELS[t.category]},${t.type === 'entrada' ? 'Receita' : 'Saida'},${t.paymentMethod === 'credito' ? 'Credito' : 'Conta corrente'},${t.value.toFixed(2)},${t.mood || 'N/A'}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vanessa-relatorio.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGeneratePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    doc.setFillColor(14, 20, 44)
    doc.rect(0, 0, 210, 38, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.text('Relatorio Financeiro Vanessa', 14, 18)
    doc.setFontSize(10)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 26)

    doc.setTextColor(40, 40, 40)
    doc.setFontSize(12)
    doc.text(`Total de transacoes: ${transactions.length}`, 14, 52)
    doc.text(`Receitas do periodo: R$ ${totalIncome.toFixed(2)}`, 14, 60)
    doc.text(`Gastos do periodo: R$ ${totalExpenses.toFixed(2)}`, 14, 68)
    doc.text(`Gastos impulsivos: R$ ${impulsiveExpenses.toFixed(2)} (${impulsivePercent}%)`, 14, 76)

    doc.setFontSize(13)
    doc.text('Detalhamento', 14, 90)
    doc.setFontSize(10)

    let y = 98
    const maxRows = Math.min(transactions.length, 28)
    for (let i = 0; i < maxRows; i += 1) {
      const tx = transactions[i]
      const sign = tx.type === 'entrada' ? '+' : '-'
      const line = `${new Date(tx.timestamp).toLocaleDateString('pt-BR')} | ${tx.description.slice(0, 22)} | ${tx.paymentMethod === 'credito' ? 'Credito' : 'Conta'} | ${sign}R$ ${tx.value.toFixed(2)}`
      doc.text(line, 14, y)
      y += 6
      if (y > 280) break
    }

    if (transactions.length > maxRows) {
      doc.text(`... e mais ${transactions.length - maxRows} transacoes`, 14, Math.min(y + 2, 286))
    }

    doc.save(`vanessa-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 px-5 pb-28 pt-6"
    >
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Insights</p>
        <h2 className="text-xl font-semibold text-foreground">Humor vs. Gastos</h2>
      </div>

      {/* Impulsive spending card */}
      {impulsivePercent > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-vanessa-warning/20 bg-vanessa-warning/5 px-4 py-4"
        >
          <Brain className="h-8 w-8 text-vanessa-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {impulsivePercent}% dos gastos foram impulsivos
            </p>
            <p className="text-xs text-muted-foreground">
              Feitos em momentos de ansiedade ou euforia
            </p>
          </div>
        </motion.div>
      )}

      {(spendingControl.monthlyLimit || spendingControl.topCategory || spendingControl.overCategoryLimits.length > 0) && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-secondary/20 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Controle inteligente</p>
          {spendingControl.monthlyLimit && (
            <p className="text-sm text-secondary-foreground">
              Gasto do mes: <strong>R$ {spendingControl.totalSpent.toFixed(2)}</strong> de meta{' '}
              <strong>R$ {spendingControl.monthlyLimit.toFixed(2)}</strong>
              {spendingControl.monthlyUsagePercent !== null && (
                <span className={spendingControl.monthlyUsagePercent >= 100 ? 'text-vanessa-danger' : 'text-muted-foreground'}>
                  {` (${spendingControl.monthlyUsagePercent}% usado)`}
                </span>
              )}
            </p>
          )}
          {spendingControl.topCategory && (
            <p className="text-sm text-secondary-foreground">
              Maior foco de gasto: <strong>{CATEGORY_LABELS[spendingControl.topCategory.category]}</strong>{' '}
              (R$ {spendingControl.topCategory.total.toFixed(2)} / {topCategoryPercent}% do total)
            </p>
          )}
          {spendingControl.overCategoryLimits.length > 0 && (
            <div className="rounded-xl bg-vanessa-warning/10 px-3 py-2 text-xs text-vanessa-warning">
              {spendingControl.overCategoryLimits.map(item => (
                <p key={item.category}>
                  Limite estourado em {CATEGORY_LABELS[item.category]}: R$ {item.total.toFixed(2)} de R$ {item.limit.toFixed(2)}
                </p>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Dica: tente reduzir 10% da categoria mais alta nas proximas 2 semanas para sentir impacto rapido no saldo.
          </p>
        </div>
      )}

      {/* Mood vs Spending Chart */}
      {moodChartData.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-secondary-foreground">Gastos por Humor</h3>
          <div className="h-52 w-full rounded-2xl border border-border/50 bg-secondary/20 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                    borderRadius: '12px',
                    fontSize: 12,
                    color: '#e0e0e0'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {moodChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={moodColors[entry.mood] || '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category spending chart */}
      {catChartData.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-secondary-foreground">Gastos por Categoria</h3>
          <div className="h-52 w-full rounded-2xl border border-border/50 bg-secondary/20 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                    borderRadius: '12px',
                    fontSize: 12,
                    color: '#e0e0e0'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {catChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={catColors[index % catColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* No data state */}
      {moodChartData.length === 0 && catChartData.length === 0 && typeChartData.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-secondary-foreground">Entradas vs Saidas</h3>
          <div className="h-52 w-full rounded-2xl border border-border/50 bg-secondary/20 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                    borderRadius: '12px',
                    fontSize: 12,
                    color: '#e0e0e0'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {typeChartData.map((entry, index) => (
                    <Cell key={`type-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {moodChartData.length === 0 && catChartData.length === 0 && typeChartData.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12">
          <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Registre gastos para ver insights</p>
        </div>
      )}

      {/* Export buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleGeneratePDF}
          variant="outline"
          className="flex-1 gap-2 border-border text-secondary-foreground"
        >
          <FileText className="h-4 w-4" />
          Gerar Relatorio
        </Button>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="flex-1 gap-2 border-border text-secondary-foreground"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>
    </motion.div>
  )
}
