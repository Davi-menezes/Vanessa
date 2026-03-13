'use client'

import type { MoodEntry, Transaction, MoodType, TransactionCategory, User, PiggyBank, PlanningGoal, FixedCost, BudgetSettings } from './types'

const USERS_KEY = 'vanessa_users'
const SESSION_KEY = 'vanessa_session'

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

// --- Auth ---
function getUsers(): User[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function signup(name: string, email: string, password: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers()
  const normalizedEmail = email.toLowerCase().trim()

  if (users.find(u => u.email === normalizedEmail)) {
    return { success: false, error: 'Esse email ja esta cadastrado. Tente fazer login.' }
  }

  const user: User = {
    id: generateId(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  }

  users.push(user)
  saveUsers(users)
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }))
  return { success: true, user }
}

export function login(email: string, password: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers()
  const normalizedEmail = email.toLowerCase().trim()
  const user = users.find(u => u.email === normalizedEmail)

  if (!user) {
    return { success: false, error: 'Email nao encontrado. Crie uma conta primeiro.' }
  }

  if (user.password !== password) {
    return { success: false, error: 'Senha incorreta.' }
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }))
  return { success: true, user }
}

export function resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
  const users = getUsers()
  const normalizedEmail = email.toLowerCase().trim()
  const index = users.findIndex(u => u.email === normalizedEmail)

  if (index === -1) {
    return { success: false, error: 'Email nao encontrado.' }
  }

  if (newPassword.length < 4) {
    return { success: false, error: 'A nova senha precisa ter pelo menos 4 caracteres.' }
  }

  users[index] = { ...users[index], password: newPassword }
  saveUsers(users)
  return { success: true }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem(SESSION_KEY)
  if (!session) return null

  const { userId } = JSON.parse(session)
  const users = getUsers()
  return users.find(u => u.id === userId) || null
}

// --- Helpers for per-user data ---
function getUserMoodsKey(): string {
  const user = getCurrentUser()
  return user ? `vanessa_moods_${user.id}` : 'vanessa_moods'
}

function getUserTransactionsKey(): string {
  const user = getCurrentUser()
  return user ? `vanessa_transactions_${user.id}` : 'vanessa_transactions'
}

function getUserHomeHiddenNotificationsKey(): string {
  const user = getCurrentUser()
  return user ? `vanessa_home_hidden_notifications_${user.id}` : 'vanessa_home_hidden_notifications'
}

function getUserExpensesHiddenNotificationsKey(): string {
  const user = getCurrentUser()
  return user ? `vanessa_expenses_hidden_notifications_${user.id}` : 'vanessa_expenses_hidden_notifications'
}

function getUserPiggyBanksKey(): string {
  const user = getCurrentUser()
  return user ? `vanessa_piggy_banks_${user.id}` : 'vanessa_piggy_banks'
}

function getUserPlanningGoalsKey(): string {
  const user = getCurrentUser()
  return user ? `vanessa_planning_goals_${user.id}` : 'vanessa_planning_goals'
}

function getUserFixedCostsKey(): string {
  const user = getCurrentUser()
  return user ? `vanessa_fixed_costs_${user.id}` : 'vanessa_fixed_costs'
}

function getUserFixedCostsPaidKey(): string {
  const user = getCurrentUser()
  return user ? `vanessa_fixed_costs_paid_${user.id}` : 'vanessa_fixed_costs_paid'
}

function getUserBudgetSettingsKey(): string {
  const user = getCurrentUser()
  return user ? `vanessa_budget_settings_${user.id}` : 'vanessa_budget_settings'
}

// --- Moods ---
export function getMoods(): MoodEntry[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getUserMoodsKey())
  return data ? JSON.parse(data) : []
}

export function addMood(mood: MoodType): MoodEntry {
  const moods = getMoods()
  const entry: MoodEntry = {
    id: generateId(),
    mood,
    timestamp: new Date().toISOString(),
  }
  moods.push(entry)
  localStorage.setItem(getUserMoodsKey(), JSON.stringify(moods))
  return entry
}

export function getLatestMood(): MoodEntry | null {
  const moods = getMoods()
  return moods.length > 0 ? moods[moods.length - 1] : null
}

export function getTodayMood(): MoodEntry | null {
  const moods = getMoods()
  const today = new Date().toDateString()
  const todayMoods = moods.filter(m => new Date(m.timestamp).toDateString() === today)
  return todayMoods.length > 0 ? todayMoods[todayMoods.length - 1] : null
}

// --- Transactions ---
export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getUserTransactionsKey())
  const parsed: Transaction[] = data ? JSON.parse(data) : []
  return parsed.map(tx => ({
    ...tx,
    paymentMethod: tx.paymentMethod || (tx.type === 'entrada' ? 'conta_corrente' : 'conta_corrente'),
    excludeFromSavingsAdvice: tx.excludeFromSavingsAdvice || false,
  }))
}

export function addTransaction(tx: Omit<Transaction, 'id'>): Transaction {
  const transactions = getTransactions()
  const newTx: Transaction = {
    ...tx,
    id: generateId(),
  }
  transactions.push(newTx)
  localStorage.setItem(getUserTransactionsKey(), JSON.stringify(transactions))
  return newTx
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const transactions = getTransactions()
  const index = transactions.findIndex(t => t.id === id)
  if (index === -1) return null
  transactions[index] = { ...transactions[index], ...updates }
  localStorage.setItem(getUserTransactionsKey(), JSON.stringify(transactions))
  return transactions[index]
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions()
  const filtered = transactions.filter(t => t.id !== id)
  if (filtered.length === transactions.length) return false
  localStorage.setItem(getUserTransactionsKey(), JSON.stringify(filtered))
  const homeHidden = getHiddenHomeTransactionIds().filter(itemId => itemId !== id)
  const expensesHidden = getHiddenExpensesTransactionIds().filter(itemId => itemId !== id)
  localStorage.setItem(getUserHomeHiddenNotificationsKey(), JSON.stringify(homeHidden))
  localStorage.setItem(getUserExpensesHiddenNotificationsKey(), JSON.stringify(expensesHidden))
  return true
}

export function clearTransactions(): void {
  localStorage.setItem(getUserTransactionsKey(), JSON.stringify([]))
  localStorage.setItem(getUserHomeHiddenNotificationsKey(), JSON.stringify([]))
  localStorage.setItem(getUserExpensesHiddenNotificationsKey(), JSON.stringify([]))
  localStorage.setItem(getUserFixedCostsPaidKey(), JSON.stringify({}))
}

export function getHiddenHomeTransactionIds(): string[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getUserHomeHiddenNotificationsKey())
  return data ? JSON.parse(data) : []
}

export function hideHomeTransactionNotification(id: string): void {
  const ids = new Set(getHiddenHomeTransactionIds())
  ids.add(id)
  localStorage.setItem(getUserHomeHiddenNotificationsKey(), JSON.stringify(Array.from(ids)))
}

export function getHiddenExpensesTransactionIds(): string[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getUserExpensesHiddenNotificationsKey())
  return data ? JSON.parse(data) : []
}

export function hideExpensesTransactionNotification(id: string): void {
  const ids = new Set(getHiddenExpensesTransactionIds())
  ids.add(id)
  localStorage.setItem(getUserExpensesHiddenNotificationsKey(), JSON.stringify(Array.from(ids)))
}

export function getAwakeSleepingTransactions(): Transaction[] {
  const transactions = getTransactions()
  const now = new Date()
  return transactions.filter(
    t => t.sleeping && t.sleepUntil && new Date(t.sleepUntil) <= now
  )
}

// --- Analytics ---
export function getMoodGastosCorrelation(): { mood: string; total: number; count: number }[] {
  const transactions = getTransactions().filter(t => t.type === 'saida' && t.mood)
  const map = new Map<string, { total: number; count: number }>()

  for (const tx of transactions) {
    if (!tx.mood) continue
    const existing = map.get(tx.mood) || { total: 0, count: 0 }
    existing.total += tx.value
    existing.count += 1
    map.set(tx.mood, existing)
  }

  return Array.from(map.entries()).map(([mood, data]) => ({
    mood,
    total: data.total,
    count: data.count,
  }))
}

export function getCategorySpending(): { category: string; total: number }[] {
  const transactions = getTransactions().filter(t => t.type === 'saida')
  const map = new Map<string, number>()

  for (const tx of transactions) {
    map.set(tx.category, (map.get(tx.category) || 0) + tx.value)
  }

  return Array.from(map.entries()).map(([category, total]) => ({
    category,
    total,
  }))
}

export function getHappinessGoals(): { category: TransactionCategory; message: string; daysAgo: number }[] {
  const transactions = getTransactions().filter(t => t.type === 'saida')
  const now = new Date()
  const categories: TransactionCategory[] = ['lazer', 'saude', 'educacao']
  const goals: { category: TransactionCategory; message: string; daysAgo: number }[] = []

  for (const cat of categories) {
    const catTxs = transactions.filter(t => t.category === cat)
    if (catTxs.length === 0) {
      goals.push({
        category: cat,
        message: `Voce nao gasta com ${cat} ha muito tempo. Que tal investir em voce?`,
        daysAgo: 30,
      })
    } else {
      const last = catTxs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      const daysAgo = Math.floor((now.getTime() - new Date(last.timestamp).getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo >= 15) {
        goals.push({
          category: cat,
          message: `Voce nao gasta com ${cat} ha ${daysAgo} dias. Que tal investir em voce?`,
          daysAgo,
        })
      }
    }
  }

  return goals
}

export function getMonthlyBalance(): { income: number; expenses: number; balance: number } {
  const now = new Date()
  const transactions = getTransactions().filter(t => {
    const d = new Date(t.timestamp)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && !t.sleeping
  })

  const income = transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.value, 0)
  const expenses = transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.value, 0)

  return { income, expenses, balance: income - expenses }
}

// --- Piggy Banks ---
export function getPiggyBanks(): PiggyBank[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getUserPiggyBanksKey())
  return data ? JSON.parse(data) : []
}

export function addPiggyBank(data: Omit<PiggyBank, 'id' | 'createdAt'>): PiggyBank {
  const piggyBanks = getPiggyBanks()
  const newPiggyBank: PiggyBank = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  piggyBanks.push(newPiggyBank)
  localStorage.setItem(getUserPiggyBanksKey(), JSON.stringify(piggyBanks))
  return newPiggyBank
}

export function updatePiggyBank(id: string, updates: Partial<PiggyBank>): PiggyBank | null {
  const piggyBanks = getPiggyBanks()
  const index = piggyBanks.findIndex(item => item.id === id)
  if (index === -1) return null
  piggyBanks[index] = { ...piggyBanks[index], ...updates, id: piggyBanks[index].id }
  localStorage.setItem(getUserPiggyBanksKey(), JSON.stringify(piggyBanks))
  return piggyBanks[index]
}

export function deletePiggyBank(id: string): boolean {
  const piggyBanks = getPiggyBanks()
  const next = piggyBanks.filter(item => item.id !== id)
  if (next.length === piggyBanks.length) return false
  localStorage.setItem(getUserPiggyBanksKey(), JSON.stringify(next))
  return true
}

// --- Planning Goals ---
export function getPlanningGoals(): PlanningGoal[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getUserPlanningGoalsKey())
  return data ? JSON.parse(data) : []
}

export function addPlanningGoal(data: Omit<PlanningGoal, 'id' | 'createdAt'>): PlanningGoal {
  const goals = getPlanningGoals()
  const newGoal: PlanningGoal = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  goals.push(newGoal)
  localStorage.setItem(getUserPlanningGoalsKey(), JSON.stringify(goals))
  return newGoal
}

export function deletePlanningGoal(id: string): boolean {
  const goals = getPlanningGoals()
  const next = goals.filter(goal => goal.id !== id)
  if (next.length === goals.length) return false
  localStorage.setItem(getUserPlanningGoalsKey(), JSON.stringify(next))
  return true
}

// --- Fixed Costs ---
export function getFixedCosts(): FixedCost[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getUserFixedCostsKey())
  return data ? JSON.parse(data) : []
}

export function addFixedCost(data: Omit<FixedCost, 'id' | 'createdAt'>): FixedCost {
  const costs = getFixedCosts()
  const newCost: FixedCost = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  costs.push(newCost)
  localStorage.setItem(getUserFixedCostsKey(), JSON.stringify(costs))
  return newCost
}

export function deleteFixedCost(id: string): boolean {
  const costs = getFixedCosts()
  const next = costs.filter(item => item.id !== id)
  if (next.length === costs.length) return false
  localStorage.setItem(getUserFixedCostsKey(), JSON.stringify(next))
  return true
}

export function updateFixedCost(id: string, updates: Partial<FixedCost>): FixedCost | null {
  const costs = getFixedCosts()
  const index = costs.findIndex(item => item.id === id)
  if (index === -1) return null
  costs[index] = { ...costs[index], ...updates, id: costs[index].id }
  localStorage.setItem(getUserFixedCostsKey(), JSON.stringify(costs))
  return costs[index]
}

export function getMonthlyIncomeFromTransactions(): number {
  const now = new Date()
  return getTransactions()
    .filter(t => {
      const d = new Date(t.timestamp)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'entrada' && !t.sleeping
    })
    .reduce((sum, t) => sum + t.value, 0)
}

export function getMonthlyFixedCostsTotal(): number {
  return getFixedCosts().reduce((sum, item) => sum + item.amount, 0)
}

export function getPiggyBanksSavedTotal(): number {
  return getPiggyBanks().reduce((sum, item) => sum + item.savedAmount, 0)
}

export function getBudgetSettings(): BudgetSettings {
  if (typeof window === 'undefined') {
    return { monthlyLimit: null, categoryLimits: {}, updatedAt: new Date().toISOString() }
  }
  const data = localStorage.getItem(getUserBudgetSettingsKey())
  if (!data) {
    return { monthlyLimit: null, categoryLimits: {}, updatedAt: new Date().toISOString() }
  }
  return JSON.parse(data)
}

function saveBudgetSettings(settings: BudgetSettings): void {
  localStorage.setItem(getUserBudgetSettingsKey(), JSON.stringify(settings))
}

export function setMonthlyBudgetLimit(limit: number | null): BudgetSettings {
  const current = getBudgetSettings()
  const next: BudgetSettings = {
    ...current,
    monthlyLimit: limit,
    updatedAt: new Date().toISOString(),
  }
  saveBudgetSettings(next)
  return next
}

export function setCategoryBudgetLimit(category: TransactionCategory, limit: number): BudgetSettings {
  const current = getBudgetSettings()
  const next: BudgetSettings = {
    ...current,
    categoryLimits: {
      ...current.categoryLimits,
      [category]: limit,
    },
    updatedAt: new Date().toISOString(),
  }
  saveBudgetSettings(next)
  return next
}

export function removeCategoryBudgetLimit(category: TransactionCategory): BudgetSettings {
  const current = getBudgetSettings()
  const nextLimits = { ...current.categoryLimits }
  delete nextLimits[category]
  const next: BudgetSettings = {
    ...current,
    categoryLimits: nextLimits,
    updatedAt: new Date().toISOString(),
  }
  saveBudgetSettings(next)
  return next
}

function getCurrentMonthExpenseTransactions(): Transaction[] {
  const now = new Date()
  return getTransactions().filter(tx => {
    const d = new Date(tx.timestamp)
    return tx.type === 'saida' && !tx.sleeping && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
}

function getCurrentMonthAdviceExpenseTransactions(): Transaction[] {
  return getCurrentMonthExpenseTransactions().filter(tx => !tx.excludeFromSavingsAdvice)
}

export function getCurrentMonthCategoryTotals(): Array<{ category: TransactionCategory; total: number }> {
  const txs = getCurrentMonthExpenseTransactions()
  const map = new Map<TransactionCategory, number>()
  for (const tx of txs) {
    map.set(tx.category, (map.get(tx.category) || 0) + tx.value)
  }
  return Array.from(map.entries()).map(([category, total]) => ({ category, total }))
}

export function getSpendingControlSnapshot(): {
  totalSpent: number
  monthlyLimit: number | null
  monthlyUsagePercent: number | null
  topCategory: { category: TransactionCategory; total: number } | null
  overCategoryLimits: Array<{ category: TransactionCategory; total: number; limit: number }>
} {
  const settings = getBudgetSettings()
  const allCategoryTotals = getCurrentMonthCategoryTotals()
  const adviceTxs = getCurrentMonthAdviceExpenseTransactions()
  const adviceMap = new Map<TransactionCategory, number>()
  for (const tx of adviceTxs) {
    adviceMap.set(tx.category, (adviceMap.get(tx.category) || 0) + tx.value)
  }
  const adviceCategoryTotals = Array.from(adviceMap.entries()).map(([category, total]) => ({ category, total }))
  const totalSpent = allCategoryTotals.reduce((sum, item) => sum + item.total, 0)
  const topCategory = [...adviceCategoryTotals].sort((a, b) => b.total - a.total)[0] || null
  const monthlyUsagePercent = settings.monthlyLimit && settings.monthlyLimit > 0
    ? Math.round((totalSpent / settings.monthlyLimit) * 100)
    : null

  const overCategoryLimits = adviceCategoryTotals
    .filter(item => {
      const limit = settings.categoryLimits[item.category]
      return typeof limit === 'number' && limit > 0 && item.total > limit
    })
    .map(item => ({
      category: item.category,
      total: item.total,
      limit: settings.categoryLimits[item.category] as number,
    }))

  return {
    totalSpent,
    monthlyLimit: settings.monthlyLimit,
    monthlyUsagePercent,
    topCategory,
    overCategoryLimits,
  }
}

function getFixedCostsPaidMap(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(getUserFixedCostsPaidKey())
  return raw ? JSON.parse(raw) : {}
}

function saveFixedCostsPaidMap(data: Record<string, string>): void {
  localStorage.setItem(getUserFixedCostsPaidKey(), JSON.stringify(data))
}

function toMonthKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

function normalizeFixedCategory(category: FixedCost['category']): TransactionCategory {
  if (category === 'assinaturas') return 'outros'
  return category as TransactionCategory
}

export function applyDueFixedCosts(referenceDate: Date = new Date()): number {
  // Backwards compatibility: no automatic discount anymore.
  return 0
}

export function isFixedCostPaidInMonth(fixedCostId: string, referenceDate: Date = new Date()): boolean {
  const paidMap = getFixedCostsPaidMap()
  return paidMap[fixedCostId] === toMonthKey(referenceDate)
}

export function markFixedCostAsPaid(fixedCostId: string, valueOverride?: number): { success: boolean; error?: string } {
  const fixedCosts = getFixedCosts()
  const fixedCost = fixedCosts.find(item => item.id === fixedCostId)
  if (!fixedCost) return { success: false, error: 'Gasto fixo nao encontrado.' }

  const paidMap = getFixedCostsPaidMap()
  const monthKey = toMonthKey(new Date())
  if (paidMap[fixedCostId] === monthKey) {
    return { success: false, error: 'Esse gasto fixo ja foi marcado como pago neste mes.' }
  }

  const value = Number.isFinite(valueOverride) && valueOverride && valueOverride > 0
    ? valueOverride
    : fixedCost.amount

  addTransaction({
    value,
    category: normalizeFixedCategory(fixedCost.category),
    type: 'saida',
    paymentMethod: 'conta_corrente',
    excludeFromSavingsAdvice: false,
    description: `Gasto fixo pago: ${fixedCost.name}`,
    moodId: null,
    mood: null,
    timestamp: new Date().toISOString(),
    sleeping: false,
    sleepUntil: null,
  })

  paidMap[fixedCostId] = monthKey
  saveFixedCostsPaidMap(paidMap)
  return { success: true }
}

export function getFixedCostReminders(referenceDate: Date = new Date()): {
  dueSoon: Array<FixedCost & { daysLeft: number }>
  dueToday: FixedCost[]
  overdue: Array<FixedCost & { daysOverdue: number }>
} {
  const fixedCosts = getFixedCosts()
  const today = referenceDate.getDate()

  const dueSoon: Array<FixedCost & { daysLeft: number }> = []
  const dueToday: FixedCost[] = []
  const overdue: Array<FixedCost & { daysOverdue: number }> = []

  for (const item of fixedCosts) {
    if (isFixedCostPaidInMonth(item.id, referenceDate)) continue
    const daysLeft = item.dueDay - today
    if (daysLeft === 0) {
      dueToday.push(item)
    } else if (daysLeft < 0) {
      overdue.push({ ...item, daysOverdue: Math.abs(daysLeft) })
    } else if (daysLeft > 0 && daysLeft <= 3) {
      dueSoon.push({ ...item, daysLeft })
    }
  }

  return { dueSoon, dueToday, overdue }
}
