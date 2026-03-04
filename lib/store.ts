'use client'

import type { MoodEntry, Transaction, MoodType, TransactionCategory, User } from './types'

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
  return data ? JSON.parse(data) : []
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
  return true
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
