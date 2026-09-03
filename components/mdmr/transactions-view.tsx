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
  const n = text.toLowerCase()
  if (/(gasolina|etanol|diesel|combustivel|posto)/.test(n)) return 'combustivel'
  if (/(uber|taxi|onibus|ônibus|metro|metrô)/.test(n)) return 'transporte'
  if (/(mercado|comida|almoco|almoço|janta|lanche|restaurante|padaria)/.test(n)) return 'alimentacao'
  if (/(cinema|netflix|show|jogo|lazer)/.test(n)) return 'lazer'
  if (/(farmacia|farmácia|medico|médico|consulta|exame)/.test(n)) return 'saude'
  if (/(faculdade|curso|livro|escola|educacao|educação)/.test(n)) return 'educacao'
  if (/(aluguel|condominio|condomínio|energia|internet|agua|água)/.test(n)) return 'moradia'
  if (/(roupa|camisa|tenis|tênis|calcado|calçado)/.test(n)) return 'vestuario'
  return 'outros'
}

function parseReceiptText(rawText: string): Array<{ value: number; description: string; category: TransactionCategory }> {
  const items: Array<{ value: number; description: string; category: TransactionCategory }> = []
  for (const line of rawText.split(/\r?\n/)) {
    const clean = line.trim().replace(/\s+/g, ' ')
    if (!clean || /^(subtotal|troco|cpf|cnpj|data|hora|cartao|cartão)/i.test(clean)) continue
    const matches = clean.match(/(\d+[.,]\d{2})/g)
    if (!matches?.length) continue
    const lastAmount = matches[matches.length - 1]
    const value = Number(lastAmount.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) continue
    const description = clean.replace(lastAmount, '').replace(/[-|:]+/g, ' ').trim() || 'Gasto importado'
    items.push({ value, description, category: inferCategory(description) })
  }
  if (items.length > 0) return items.slice(0, 25)

  const totalMatch = rawText.match(/total[^\d]*(\d+[.,]\d{2})/i)
  if (totalMatch) {
    const totalValue = Number(totalMatch[1].replace(',', '.'))
    if (Number.isFinite(totalValue) && totalValue > 0) {
      return [{ value: totalValue, description: 'Gasto importado por comprovante', category: 'outros' }]
    }
  }
  return []
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="glass-card flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground"
      aria-label={label}
      title={label}
    >
      {children}
    </motion.button>
  )
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

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const searchAsNumber = Number(normalizedSearch.replace(',', '.'))
  const hasNumericSearch = normalizedSearch.length > 0 && Number.isFinite(searchAsNumber)

  const filteredTransactions = transactions.filter(tx => {
    const matchesCategory = selectedCategoryFilter === 'all' || tx.category === selectedCategoryFilter
    if (!matchesCategory) return false
    if (!normalizedSearch) return true
    const valueAsText = tx.value.toFixed(2)
    const valueText = valueAsText.replace('.', ',')
    return (
      tx.description.toLowerCase().includes(normalizedSearch) ||
      valueAsText.includes(normalizedSearch) ||
      valueText.includes(normalizedSearch) ||
      (hasNumericSearch && Math.abs(tx.value - searchAsNumber) < 0.01)
    )
  })

  const visibleTransactions = filteredTransactions.filter(t => !t.sleeping)
  const filteredExpenses = visibleTransactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.value, 0)

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const content = await file.text()
      const parsed = parseReceiptText(content)
      if (!parsed.length) {
        setInfoModalMessage('Nao consegui ler os valores desse arquivo. Use txt/csv com valores no formato 12,34.')
      } else {
        onImportReceipt(parsed)
      }
    } catch {
      setInfoModalMessage('Falha ao importar arquivo.')
    } finally {
      e.target.value = ''
    }
  }

  const handleInvoiceUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const isTextLike = /\.(txt|csv|xml|json|md|log)$/i.test(file.name)
      if (isTextLike) {
        const content = await file.text()
        const parsed = parseReceiptText(content)
        if (parsed.length) {
          onImportReceipt(parsed)
          return
        }
      }
      setManualInvoiceFileName(file.name)
      setManualInvoiceValue('')
      setManualInvoiceDescription(`Nota fiscal: ${file.name}`)
      setShowManualInvoiceModal(true)
    } finally {
      e.target.value = ''
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

  const filterBtnClass = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-all ${
      active
        ? 'border-vanessa-lavender/40 bg-vanessa-lavender/15 text-vanessa-lavender'
        : 'glass-card text-muted-foreground hover:text-foreground'
    }`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5 px-5 pb-32 pt-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Transações</p>
          <h2 className="text-[22px] font-semibold tracking-tight text-foreground">Seus Gastos</h2>
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
          <IconBtn label="Importar comprovante" onClick={() => inputRef.current?.click()}>
            <FileText className="h-5 w-5" />
          </IconBtn>
          <IconBtn label="Upload de nota fiscal" onClick={() => invoiceInputRef.current?.click()}>
            <ReceiptText className="h-5 w-5" />
          </IconBtn>
          <IconBtn label="Limpar historico" onClick={onClearHistory}>
            <Trash2 className="h-5 w-5 text-vanessa-danger/70" />
          </IconBtn>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAddNew}
            className="btn-primary flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Adicionar transacao"
            title="Adicionar transacao"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl px-4 py-3"
        >
          <p className="text-[10px] text-muted-foreground">
            {selectedCategoryFilter === 'all' ? 'Este mes' : `Filtro: ${CATEGORY_LABELS[selectedCategoryFilter]}`}
          </p>
          <p className="text-lg font-semibold text-vanessa-danger">
            -R$ {(selectedCategoryFilter === 'all' ? balance.expenses : filteredExpenses).toFixed(2)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="glass rounded-2xl px-4 py-3"
        >
          <p className="text-[10px] text-muted-foreground">Transações</p>
          <p className="text-lg font-semibold text-foreground">{visibleTransactions.length}</p>
        </motion.div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setSelectedCategoryFilter('all')} className={filterBtnClass(selectedCategoryFilter === 'all')}>
          Todas
        </button>
        {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategoryFilter(category)}
            className={filterBtnClass(selectedCategoryFilter === category)}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Search */}
      <Input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Pesquisar por descricao ou valor..."
        className="input-glass rounded-2xl border-white/[0.08] bg-transparent"
      />

      <TransactionList
        transactions={visibleTransactions}
        hiddenIds={hiddenIds}
        onHideNotification={id => {
          hideExpensesTransactionNotification(id)
          setHiddenIds(prev => Array.from(new Set([...prev, id])))
        }}
        onDeleteTransaction={onDeleteTransaction}
      />

      {/* Info modal */}
      {infoModalMessage && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="glass-strong w-full rounded-t-3xl p-5 pb-10"
          >
            <p className="text-sm font-semibold text-foreground">Aviso</p>
            <p className="mt-2 text-sm text-muted-foreground">{infoModalMessage}</p>
            <button
              onClick={() => setInfoModalMessage(null)}
              className="btn-primary mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold"
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}

      {/* Manual invoice modal */}
      {showManualInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="glass-strong w-full rounded-t-3xl p-5 pb-10"
          >
            <p className="text-sm font-semibold text-foreground">Cadastrar nota fiscal manualmente</p>
            <p className="mt-1 text-xs text-muted-foreground">{manualInvoiceFileName}</p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Valor total</p>
                <Input
                  value={manualInvoiceValue}
                  onChange={e => setManualInvoiceValue(e.target.value)}
                  placeholder="Ex: 129,90"
                  inputMode="decimal"
                  className="input-glass rounded-2xl border-white/[0.08] bg-transparent"
                />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Descricao (opcional)</p>
                <Input
                  value={manualInvoiceDescription}
                  onChange={e => setManualInvoiceDescription(e.target.value)}
                  placeholder="Ex: Compra no mercado"
                  className="input-glass rounded-2xl border-white/[0.08] bg-transparent"
                />
              </div>
              <button
                onClick={handleManualInvoiceSubmit}
                className="btn-primary rounded-2xl py-3.5 text-sm font-semibold"
              >
                Cadastrar gasto
              </button>
              <button
                onClick={() => setShowManualInvoiceModal(false)}
                className="rounded-2xl py-3 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
