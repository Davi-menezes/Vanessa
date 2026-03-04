export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export type MoodType = 'ansiedade' | 'tedio' | 'euforia' | 'tristeza' | 'calmaria'

export type TransactionCategory =
  | 'alimentacao'
  | 'transporte'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'moradia'
  | 'vestuario'
  | 'outros'

export type TransactionType = 'entrada' | 'saida'

export interface MoodEntry {
  id: string
  mood: MoodType
  timestamp: string
}

export interface Transaction {
  id: string
  value: number
  category: TransactionCategory
  type: TransactionType
  description: string
  moodId: string | null
  mood: MoodType | null
  timestamp: string
  sleeping: boolean
  sleepUntil: string | null
}

export interface HappinessGoal {
  id: string
  category: TransactionCategory
  message: string
  lastSpentDaysAgo: number
}

export interface PiggyBank {
  id: string
  name: string
  savedAmount: number
  targetAmount: number
  createdAt: string
}

export interface PlanningGoal {
  id: string
  title: string
  type: 'viagem' | 'compra'
  targetAmount: number
  targetMonths: number
  createdAt: string
}

export interface FixedCost {
  id: string
  name: string
  amount: number
  dueDay: number
  category: 'moradia' | 'educacao' | 'transporte' | 'saude' | 'assinaturas' | 'outros'
  createdAt: string
}

export const MOOD_CONFIG: Record<MoodType, { label: string; icon: string; color: string; isImpulsive: boolean }> = {
  ansiedade: { label: 'Ansiedade', icon: 'brain', color: 'text-vanessa-warning', isImpulsive: true },
  tedio: { label: 'Tedio', icon: 'meh', color: 'text-muted-foreground', isImpulsive: false },
  euforia: { label: 'Euforia', icon: 'sparkles', color: 'text-vanessa-lavender', isImpulsive: true },
  tristeza: { label: 'Tristeza', icon: 'cloud-rain', color: 'text-vanessa-calm', isImpulsive: false },
  calmaria: { label: 'Calmaria', icon: 'leaf', color: 'text-vanessa-success', isImpulsive: false },
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  alimentacao: 'Alimentacao',
  transporte: 'Transporte',
  lazer: 'Lazer',
  saude: 'Saude',
  educacao: 'Educacao',
  moradia: 'Moradia',
  vestuario: 'Vestuario',
  outros: 'Outros',
}
