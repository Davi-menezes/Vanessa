'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, FileText, TrendingUp, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMoodGastosCorrelation, getCategorySpending, getTransactions } from '@/lib/store'
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
  const moodGastos = getMoodGastosCorrelation()
  const categorySpending = getCategorySpending()
  const transactions = getTransactions()

  const totalExpenses = transactions.filter(t => t.type === 'saida' && !t.sleeping).reduce((s, t) => s + t.value, 0)
  const impulsiveExpenses = transactions
    .filter(t => t.type === 'saida' && !t.sleeping && t.mood && MOOD_CONFIG[t.mood as MoodType]?.isImpulsive)
    .reduce((s, t) => s + t.value, 0)
  const impulsivePercent = totalExpenses > 0 ? Math.round((impulsiveExpenses / totalExpenses) * 100) : 0

  const moodChartData = moodGastos.map(d => ({
    name: MOOD_CONFIG[d.mood as MoodType]?.label || d.mood,
    total: d.total,
    mood: d.mood,
  }))

  const catChartData = categorySpending.map(d => ({
    name: CATEGORY_LABELS[d.category as TransactionCategory] || d.category,
    total: d.total,
  }))

  const handleExportCSV = () => {
    const headers = 'Data,Descricao,Categoria,Tipo,Valor,Humor\n'
    const rows = transactions.map(t =>
      `${new Date(t.timestamp).toLocaleDateString('pt-BR')},${t.description},${CATEGORY_LABELS[t.category]},${t.type === 'entrada' ? 'Receita' : 'Saida'},${t.value.toFixed(2)},${t.mood || 'N/A'}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vanessa-relatorio.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGeneratePDF = () => {
    // Simulate PDF generation
    const content = `
RELATORIO VANESSA
==================
Periodo: ${new Date().toLocaleDateString('pt-BR')}
Total de Transacoes: ${transactions.length}
Gastos Totais: R$ ${totalExpenses.toFixed(2)}
Gastos Impulsivos: R$ ${impulsiveExpenses.toFixed(2)} (${impulsivePercent}%)

DETALHES:
${transactions.map(t => `${new Date(t.timestamp).toLocaleDateString('pt-BR')} | ${t.description} | ${t.type === 'entrada' ? '+' : '-'}R$ ${t.value.toFixed(2)} | ${t.mood || 'N/A'}`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vanessa-relatorio.txt'
    a.click()
    URL.revokeObjectURL(url)
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
      {moodChartData.length === 0 && catChartData.length === 0 && (
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
