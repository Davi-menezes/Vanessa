'use client'

import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileText, Trash2 } from 'lucide-react'
import { TransactionList } from './transaction-list'
import { getMonthlyBalance } from '@/lib/store'
import type { Transaction, TransactionCategory } from '@/lib/types'

interface TransactionsViewProps {
  transactions: Transaction[]
  onAddNew: () => void
  onClearHistory: () => void
  onImportReceipt: (items: Array<{ value: number; description: string; category: TransactionCategory }>) => void
}

function inferCategory(text: string): TransactionCategory {
  const normalized = text.toLowerCase()
  if (/(uber|taxi|onibus|ônibus|metro|metrô|gasolina)/.test(normalized)) return 'transporte'
  if (/(mercado|comida|almoco|almoço|janta|lanche|restaurante|padaria)/.test(normalized)) return 'alimentacao'
  if (/(cinema|netflix|show|jogo|lazer)/.test(normalized)) return 'lazer'
  if (/(farmacia|farmácia|medico|médico|consulta|exame)/.test(normalized)) return 'saude'
  if (/(faculdade|curso|livro|escola|educacao|educação)/.test(normalized)) return 'educacao'
  if (/(aluguel|condominio|condomínio|energia|internet|agua|água)/.test(normalized)) return 'moradia'
  if (/(roupa|camisa|tenis|tênis|calcado|calçado)/.test(normalized)) return 'vestuario'
  return 'outros'
}

function parseReceiptText(rawText: string): Array<{ value: number; description: string; category: TransactionCategory }> {
  const lines = rawText.split(/\r?\n/)
  const items: Array<{ value: number; description: string; category: TransactionCategory }> = []

  for (const line of lines) {
    const clean = line.trim().replace(/\s+/g, ' ')
    if (!clean) continue
    if (/^(subtotal|troco|cpf|cnpj|data|hora|cartao|cartão)/i.test(clean)) continue

    const matches = clean.match(/(\d+[.,]\d{2})/g)
    if (!matches || matches.length === 0) continue
    const lastAmount = matches[matches.length - 1]
    const value = Number(lastAmount.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) continue

    const description = clean.replace(lastAmount, '').replace(/[-|:]+/g, ' ').trim() || 'Gasto importado'
    items.push({ value, description, category: inferCategory(description) })
  }

  if (items.length > 0) {
    return items.slice(0, 25)
  }

  const totalMatch = rawText.match(/total[^\d]*(\d+[.,]\d{2})/i)
  if (totalMatch) {
    const totalValue = Number(totalMatch[1].replace(',', '.'))
    if (Number.isFinite(totalValue) && totalValue > 0) {
      return [{ value: totalValue, description: 'Gasto importado por comprovante', category: 'outros' }]
    }
  }

  return []
}

export function TransactionsView({ transactions, onAddNew, onClearHistory, onImportReceipt }: TransactionsViewProps) {
  const balance = getMonthlyBalance()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const parsedItems = parseReceiptText(content)
      if (parsedItems.length === 0) {
        alert('Nao consegui ler os valores desse arquivo. Use txt/csv com valores no formato 12,34.')
      } else {
        onImportReceipt(parsedItems)
      }
    } catch {
      alert('Falha ao importar arquivo.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 px-5 pb-28 pt-6"
    >
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Transacoes</p>
          <h2 className="text-xl font-semibold text-foreground">Seus Gastos</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.csv,.md,.log"
            className="hidden"
            onChange={handleFileSelect}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => inputRef.current?.click()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/30 text-secondary-foreground"
            aria-label="Importar comprovante"
            title="Importar comprovante"
          >
            <FileText className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClearHistory}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/30 text-muted-foreground"
            aria-label="Limpar historico"
            title="Limpar historico"
          >
            <Trash2 className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAddNew}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-vanessa-lavender text-primary-foreground"
            aria-label="Adicionar transacao"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>
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

      <TransactionList transactions={transactions} />
    </motion.div>
  )
}
