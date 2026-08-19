'use client'

import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileText, Trash2, ReceiptText } from 'lucide-react'
import { TransactionList } from './transaction-list'
import { getHiddenExpensesTransactionIds, getMonthlyBalance, hideExpensesTransactionNotification } from '@/lib/store'
import type { Transaction, TransactionCategory } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import { Input } from '@/components/ui/input'

interface TransactionsViewProps {
  transactions: Transaction[]
  onAddNew: () => void
  onClearHistory: () => void
  onImportReceipt: (items: Array<{ value: number; description: string; category: TransactionCategory }>) => void
  onDeleteTransaction: (id: string) => void
}

function inferCategory(text: string): TransactionCategory {
  const normalized = text.toLowerCase()
  if (/(gasolina|etanol|diesel|combustivel|combustível|posto)/.test(normalized)) return 'combustivel'
  if (/(uber|taxi|onibus|ônibus|metro|metrô)/.test(normalized)) return 'transporte'
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

export function TransactionsView({ transactions, onAddNew, onClearHistory, onImportReceipt, onDeleteTransaction }: TransactionsViewProps) {
  const balance = getMonthlyBalance()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const invoiceInputRef = useRef<HTMLInputElement | null>(null)
  const [hiddenIds, setHiddenIds] = useState<string[]>(getHiddenExpensesTransactionIds())
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | TransactionCategory>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [infoModalMessage, setInfoModalMessage] = useState<string | null>(null)
  const [showManualInvoiceModal, setShowManualInvoiceModal] = useState(false)
  const [manualInvoiceFileName, setManualInvoiceFileName] = useState('')
  const [manualInvoiceValue, setManualInvoiceValue] = useState('')
  const [manualInvoiceDescription, setManualInvoiceDescription] = useState('')

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const parsedItems = parseReceiptText(content)
      if (parsedItems.length === 0) {
        setInfoModalMessage('Nao consegui ler os valores desse arquivo. Use txt/csv com valores no formato 12,34.')
      } else {
        onImportReceipt(parsedItems)
      }
    } catch {
      setInfoModalMessage('Falha ao importar arquivo.')
    } finally {
      event.target.value = ''
    }
  }

  const handleInvoiceUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileName = file.name.toLowerCase()
      const isTextLike = /\.(txt|csv|xml|json|md|log)$/i.test(fileName)

      if (isTextLike) {
        const content = await file.text()
        const parsedItems = parseReceiptText(content)
        if (parsedItems.length === 0) {
          setManualInvoiceFileName(file.name)
          setManualInvoiceValue('')
          setManualInvoiceDescription(`Nota fiscal: ${file.name}`)
          setShowManualInvoiceModal(true)
        } else {
          onImportReceipt(parsedItems)
          return
        }
      } else {
        setManualInvoiceFileName(file.name)
        setManualInvoiceValue('')
        setManualInvoiceDescription(`Nota fiscal: ${file.name}`)
        setShowManualInvoiceModal(true)
      }
    } finally {
      event.target.value = ''
    }
  }

  const handleManualInvoiceSubmit = () => {
    const value = Number(manualInvoiceValue.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) {
      setInfoModalMessage('Valor invalido. Informe um numero maior que zero.')
      return
    }

    const description = manualInvoiceDescription.trim() || `Nota fiscal: ${manualInvoiceFileName}`
    onImportReceipt([{ value, description, category: inferCategory(description) }])
    setShowManualInvoiceModal(false)
    setManualInvoiceValue('')
    setManualInvoiceDescription('')
    setManualInvoiceFileName('')
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const searchAsNumber = Number(normalizedSearch.replace(',', '.'))
  const hasNumericSearch = normalizedSearch.length > 0 && Number.isFinite(searchAsNumber)

  const filteredTransactions = transactions.filter(tx => {
    const matchesCategory = selectedCategoryFilter === 'all' ? true : tx.category === selectedCategoryFilter
    if (!matchesCategory) return false
    if (!normalizedSearch) return true

    const descriptionMatch = tx.description.toLowerCase().includes(normalizedSearch)
    const valueAsText = tx.value.toFixed(2)
    const valueAsTextBr = valueAsText.replace('.', ',')
    const valueTextMatch = valueAsText.includes(normalizedSearch) || valueAsTextBr.includes(normalizedSearch)
    const valueNumberMatch = hasNumericSearch ? Math.abs(tx.value - searchAsNumber) < 0.01 : false

    return descriptionMatch || valueTextMatch || valueNumberMatch
  })
  const filteredExpenses = filteredTransactions.filter(t => t.type === 'saida' && !t.sleeping).reduce((sum, t) => sum + t.value, 0)

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
            ref={invoiceInputRef}
            type="file"
            accept=".txt,.csv,.xml,.json,.md,.log,.pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleInvoiceUpload}
          />
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
            onClick={() => invoiceInputRef.current?.click()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/30 text-secondary-foreground"
            aria-label="Upload de nota fiscal"
            title="Upload de nota fiscal"
          >
            <ReceiptText className="h-5 w-5" />
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
          <p className="text-[10px] text-muted-foreground">
            {selectedCategoryFilter === 'all' ? 'Este mes' : `Filtro: ${CATEGORY_LABELS[selectedCategoryFilter]}`}
          </p>
          <p className="text-lg font-bold text-vanessa-danger">-R$ {(selectedCategoryFilter === 'all' ? balance.expenses : filteredExpenses).toFixed(2)}</p>
        </div>
        <div className="flex-1 rounded-xl border border-border/50 bg-secondary/20 px-3 py-3">
          <p className="text-[10px] text-muted-foreground">Transacoes</p>
          <p className="text-lg font-bold text-foreground">{filteredTransactions.filter(t => !t.sleeping).length}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap ${
            selectedCategoryFilter === 'all'
              ? 'border-vanessa-lavender/50 bg-vanessa-lavender/15 text-vanessa-lavender'
              : 'border-border text-muted-foreground'
          }`}
        >
          Todas
        </button>
        {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategoryFilter(category)}
            className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap ${
              selectedCategoryFilter === category
                ? 'border-vanessa-lavender/50 bg-vanessa-lavender/15 text-vanessa-lavender'
                : 'border-border text-muted-foreground'
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <Input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Pesquisar por descricao ou valor (ex: mercado, 45,90)"
        className="border-border bg-secondary/30"
      />

      <TransactionList
        transactions={filteredTransactions}
        hiddenIds={hiddenIds}
        onHideNotification={(id) => {
          hideExpensesTransactionNotification(id)
          setHiddenIds(prev => Array.from(new Set([...prev, id])))
        }}
        onDeleteTransaction={onDeleteTransaction}
      />

      {infoModalMessage && (
        <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl border-t border-border bg-card p-5 pb-8">
            <p className="text-sm font-medium text-foreground">Aviso</p>
            <p className="mt-2 text-sm text-muted-foreground">{infoModalMessage}</p>
            <button
              onClick={() => setInfoModalMessage(null)}
              className="mt-4 w-full rounded-xl bg-vanessa-lavender px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-vanessa-lavender/90"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {showManualInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl border-t border-border bg-card p-5 pb-8">
            <p className="text-sm font-medium text-foreground">Cadastrar nota fiscal manualmente</p>
            <p className="mt-1 text-xs text-muted-foreground">{manualInvoiceFileName}</p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Valor total</p>
                <Input
                  value={manualInvoiceValue}
                  onChange={e => setManualInvoiceValue(e.target.value)}
                  placeholder="Ex: 129,90"
                  inputMode="decimal"
                  className="border-border bg-secondary/40"
                />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Descricao (opcional)</p>
                <Input
                  value={manualInvoiceDescription}
                  onChange={e => setManualInvoiceDescription(e.target.value)}
                  placeholder="Ex: Compra no mercado"
                  className="border-border bg-secondary/40"
                />
              </div>
              <button
                onClick={handleManualInvoiceSubmit}
                className="rounded-xl bg-vanessa-lavender px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-vanessa-lavender/90"
              >
                Cadastrar gasto
              </button>
              <button
                onClick={() => setShowManualInvoiceModal(false)}
                className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
