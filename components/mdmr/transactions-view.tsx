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
    if (Number.isFinite(totalValue) && totalValue > 0)
      return [{ value: totalValue, description: 'Gasto importado por comprovante', category: 'outros' }]
  }
  return []
}

const iconBtnStyle: React.CSSProperties = {
  background: 'oklch(0.13 0.018 150 / 0.55)',
  backdropFilter: 'blur(16px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
  border: '1px solid oklch(1 0 0 / 0.10)',
  boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.10), inset 0 -1px 0 oklch(0 0 0 / 0.25), 0 2px 8px oklch(0 0 0 / 0.30)',
  borderRadius: '9999px',
  width: 40, height: 40,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const glassInputStyle: React.CSSProperties = {
  background: 'oklch(0.12 0.016 150 / 0.60)',
  backdropFilter: 'blur(16px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
  border: '1px solid oklch(1 0 0 / 0.09)',
  boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.08), inset 0 -1px 0 oklch(0 0 0 / 0.20)',
  borderRadius: '14px',
  color: 'oklch(0.88 0.02 145)',
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
    return tx.description.toLowerCase().includes(normalizedSearch)
      || valueAsText.includes(normalizedSearch)
      || valueAsText.replace('.', ',').includes(normalizedSearch)
      || (hasNumericSearch && Math.abs(tx.value - searchAsNumber) < 0.01)
  })
  const filteredExpenses = filteredTransactions.filter(t => t.type === 'saida' && !t.sleeping).reduce((s, t) => s + t.value, 0)

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const content = await file.text()
      const parsed = parseReceiptText(content)
      if (!parsed.length) setInfoModalMessage('Nao consegui ler os valores desse arquivo. Use txt/csv com valores no formato 12,34.')
      else onImportReceipt(parsed)
    } catch { setInfoModalMessage('Falha ao importar arquivo.') }
    finally { e.target.value = '' }
  }

  const handleInvoiceUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const fileName = file.name.toLowerCase()
      if (/\.(txt|csv|xml|json|md|log)$/i.test(fileName)) {
        const content = await file.text()
        const parsed = parseReceiptText(content)
        if (!parsed.length) { setManualInvoiceFileName(file.name); setManualInvoiceValue(''); setManualInvoiceDescription(`Nota fiscal: ${file.name}`); setShowManualInvoiceModal(true) }
        else { onImportReceipt(parsed); return }
      } else { setManualInvoiceFileName(file.name); setManualInvoiceValue(''); setManualInvoiceDescription(`Nota fiscal: ${file.name}`); setShowManualInvoiceModal(true) }
    } finally { e.target.value = '' }
  }

  const handleManualInvoiceSubmit = () => {
    const value = Number(manualInvoiceValue.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) { setInfoModalMessage('Valor invalido.'); return }
    const description = manualInvoiceDescription.trim() || `Nota fiscal: ${manualInvoiceFileName}`
    onImportReceipt([{ value, description, category: inferCategory(description) }])
    setShowManualInvoiceModal(false); setManualInvoiceValue(''); setManualInvoiceDescription(''); setManualInvoiceFileName('')
  }

  const filterBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: '9999px', fontSize: 12, whiteSpace: 'nowrap',
    background: active ? 'oklch(0.32 0.12 150 / 0.40)' : 'oklch(0.12 0.016 150 / 0.55)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    border: active ? '1px solid oklch(0.42 0.13 150 / 0.45)' : '1px solid oklch(1 0 0 / 0.09)',
    color: active ? 'oklch(0.65 0.13 150)' : 'oklch(0.55 0.03 150)',
    boxShadow: active ? 'inset 0 1px 0 oklch(1 0 0 / 0.10), 0 0 16px oklch(0.38 0.13 150 / 0.20)' : 'inset 0 1px 0 oklch(1 0 0 / 0.06)',
    transition: 'all 0.2s ease',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 px-5 pb-32 pt-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">Transacoes</p>
          <h2 className="text-[22px] font-semibold text-foreground">Seus Gastos</h2>
        </div>
        <div className="flex items-center gap-2">
          <input ref={invoiceInputRef} type="file" accept=".txt,.csv,.xml,.json,.md,.log,.pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={handleInvoiceUpload} />
          <input ref={inputRef} type="file" accept=".txt,.csv,.md,.log" className="hidden" onChange={handleFileSelect} />
          {[FileText, ReceiptText].map((Icon, i) => (
            <motion.button
              key={i} whileTap={{ scale: 0.88 }}
              onClick={i === 0 ? () => inputRef.current?.click() : () => invoiceInputRef.current?.click()}
              style={iconBtnStyle} aria-label={i === 0 ? 'Importar comprovante' : 'Upload nota fiscal'}
            >
              <Icon className="h-4.5 w-4.5" style={{ color: 'oklch(0.58 0.04 150)' }} />
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.88 }} onClick={onClearHistory} style={{ ...iconBtnStyle, color: 'oklch(0.58 0.16 25)' }}
            aria-label="Limpar historico"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }} onClick={onAddNew}
            style={{
              ...iconBtnStyle,
              background: 'oklch(0.28 0.13 150 / 0.60)',
              boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.10), inset 0 -1px 0 oklch(0 0 0 / 0.20), 0 0 20px oklch(0.38 0.13 150 / 0.35)',
            }}
            aria-label="Adicionar transacao"
          >
            <Plus className="h-4.5 w-4.5" style={{ color: 'oklch(0.72 0.13 150)' }} />
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: selectedCategoryFilter === 'all' ? 'Este mes' : `Filtro: ${CATEGORY_LABELS[selectedCategoryFilter]}`, value: `-R$ ${(selectedCategoryFilter === 'all' ? balance.expenses : filteredExpenses).toFixed(2)}`, red: true },
          { label: 'Transacoes', value: String(filteredTransactions.filter(t => !t.sleeping).length), red: false },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="rounded-2xl px-4 py-3.5"
            style={iconBtnStyle}
          >
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-lg font-bold" style={{ color: item.red ? 'oklch(0.62 0.16 25)' : 'oklch(0.88 0.02 145)' }}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setSelectedCategoryFilter('all')} style={filterBtn(selectedCategoryFilter === 'all')}>Todas</button>
        {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(cat => (
          <button key={cat} onClick={() => setSelectedCategoryFilter(cat)} style={filterBtn(selectedCategoryFilter === cat)}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por descricao ou valor..."
          className="focus:outline-none focus:ring-0"
          style={glassInputStyle}
        />
      </div>

      <TransactionList
        transactions={filteredTransactions}
        hiddenIds={hiddenIds}
        onHideNotification={id => { hideExpensesTransactionNotification(id); setHiddenIds(prev => Array.from(new Set([...prev, id]))) }}
        onDeleteTransaction={onDeleteTransaction}
      />

      {/* Info modal */}
      {infoModalMessage && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'oklch(0.05 0.005 150 / 0.70)', backdropFilter: 'blur(20px)' }}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="glass-strong w-full rounded-t-[28px] border-t border-white/10 p-5 pb-10">
            <p className="mb-2 text-sm font-semibold text-foreground">Aviso</p>
            <p className="text-sm text-muted-foreground">{infoModalMessage}</p>
            <button
              onClick={() => setInfoModalMessage(null)}
              className="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, oklch(0.38 0.14 150), oklch(0.28 0.11 152))', boxShadow: '0 4px 20px oklch(0.38 0.14 150 / 0.30)' }}
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}

      {/* Manual invoice modal */}
      {showManualInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'oklch(0.05 0.005 150 / 0.70)', backdropFilter: 'blur(20px)' }}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="glass-strong w-full rounded-t-[28px] border-t border-white/10 p-5 pb-10">
            <p className="mb-1 text-sm font-semibold text-foreground">Cadastrar nota fiscal</p>
            <p className="mb-4 text-xs text-muted-foreground">{manualInvoiceFileName}</p>
            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Valor total</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                  <Input value={manualInvoiceValue} onChange={e => setManualInvoiceValue(e.target.value)} placeholder="0.00" inputMode="decimal" className="pl-9 focus:outline-none" style={glassInputStyle} />
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Descricao</p>
                <Input value={manualInvoiceDescription} onChange={e => setManualInvoiceDescription(e.target.value)} placeholder="Ex: Compra no mercado" className="focus:outline-none" style={glassInputStyle} />
              </div>
              <button
                onClick={handleManualInvoiceSubmit}
                className="rounded-2xl py-3.5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, oklch(0.38 0.14 150), oklch(0.28 0.11 152))', boxShadow: '0 4px 20px oklch(0.38 0.14 150 / 0.30)' }}
              >
                Cadastrar gasto
              </button>
              <button onClick={() => setShowManualInvoiceModal(false)} className="rounded-2xl py-3 text-sm text-muted-foreground" style={{ background: 'oklch(0.13 0.02 150 / 0.55)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
