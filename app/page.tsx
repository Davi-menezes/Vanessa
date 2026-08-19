'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AuthScreen } from '@/components/mdmr/auth-screen'
import { MoodCheckin } from '@/components/mdmr/mood-checkin'
import { ImpulsivityAlert } from '@/components/mdmr/impulsivity-alert'
import { AudioInput } from '@/components/mdmr/audio-input'
import { HomeView } from '@/components/mdmr/home-view'
import { TransactionsView } from '@/components/mdmr/transactions-view'
import { InsightsView } from '@/components/mdmr/insights-view'
import { PlanningView } from '@/components/mdmr/planning-view'
import { AddTransactionForm } from '@/components/mdmr/add-transaction-form'
import { BottomNav } from '@/components/mdmr/bottom-nav'
import { Sidebar } from '@/components/mdmr/sidebar'
import {
  addMood,
  getLatestMood,
  addTransaction,
  clearTransactions,
  deleteTransaction,
  getTransactions,
  getCurrentUser,
  logout,
} from '@/lib/store'
import { MOOD_CONFIG } from '@/lib/types'
import type { MoodType, PaymentMethod, TransactionCategory, TransactionType, User } from '@/lib/types'

type Tab = 'home' | 'transacoes' | 'insights' | 'planejamento'

export default function mdmrApp() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [showMoodCheckin, setShowMoodCheckin] = useState(false)
  const [showImpulsivityAlert, setShowImpulsivityAlert] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null)
  const [transactions, setTransactions] = useState<ReturnType<typeof getTransactions>>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    const existingUser = getCurrentUser()
    if (existingUser) {
      setUser(existingUser)
    }
    setAuthChecked(true)
  }, [])

  // Load user data after auth
  useEffect(() => {
    if (!user) return
    const latestMood = getLatestMood()
    if (!latestMood) {
      setShowMoodCheckin(true)
    } else {
      setCurrentMood(latestMood.mood)
    }
    setTransactions(getTransactions())
  }, [user])

  const refresh = useCallback(() => {
    setTransactions(getTransactions())
    setRefreshKey(k => k + 1)
  }, [])

  const handleAuth = (authUser: User) => {
    setUser(authUser)
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setActiveTab('home')
    setCurrentMood(null)
    setTransactions([])
    setShowMoodCheckin(false)
  }

  const handleMoodSelect = (mood: MoodType) => {
    addMood(mood)
    setCurrentMood(mood)
    setShowMoodCheckin(false)

    if (MOOD_CONFIG[mood].isImpulsive) {
      setShowImpulsivityAlert(true)
    }
    refresh()
  }

  const handleAddTransaction = (data: {
    value: number
    category: TransactionCategory
    type: TransactionType
    paymentMethod: PaymentMethod
    description: string
    excludeFromSavingsAdvice: boolean
  }) => {
    const latestMood = getLatestMood()
    addTransaction({
      ...data,
      moodId: latestMood?.id || null,
      mood: latestMood?.mood || null,
      timestamp: new Date().toISOString(),
      sleeping: false,
      sleepUntil: null,
    })
    setShowAddForm(false)
    refresh()
  }

  const handleAudioTransaction = (data: { value: number; category: TransactionCategory; description: string }) => {
    const latestMood = getLatestMood()
    addTransaction({
      value: data.value,
      category: data.category,
      type: 'saida',
      paymentMethod: 'conta_corrente',
      description: data.description,
      excludeFromSavingsAdvice: false,
      moodId: latestMood?.id || null,
      mood: latestMood?.mood || null,
      timestamp: new Date().toISOString(),
      sleeping: false,
      sleepUntil: null,
    })
    refresh()
  }

  // Show nothing until auth is checked
  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-vanessa-lavender/30 border-t-vanessa-lavender" />
      </main>
    )
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen onAuth={handleAuth} />
  }

  const renderContent = () => (
    <>
      {/* Mood check-in overlay */}
      <AnimatePresence>
        {showMoodCheckin && (
          <div className="fixed inset-0 z-50 bg-background">
            <MoodCheckin onSelectMood={handleMoodSelect} />
          </div>
        )}
      </AnimatePresence>

      {/* Impulsivity alert */}
      <ImpulsivityAlert
        show={showImpulsivityAlert}
        onPause={() => setShowImpulsivityAlert(false)}
        onDismiss={() => setShowImpulsivityAlert(false)}
      />

      {/* Main content */}
      {!showMoodCheckin && (
        <>
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <HomeView
                key="home"
                onChangeMood={() => setShowMoodCheckin(true)}
                onLogout={handleLogout}
                transactions={transactions}
                onClearHistory={() => {
                  if (confirm('Tem certeza que deseja limpar todo o historico de transacoes?')) {
                    clearTransactions()
                    refresh()
                  }
                }}
                userName={user.name}
              />
            )}
            {activeTab === 'transacoes' && (
              <TransactionsView
                key="transacoes"
                transactions={transactions}
                onAddNew={() => setShowAddForm(true)}
                onClearHistory={() => {
                  if (confirm('Tem certeza que deseja limpar todo o historico de transacoes?')) {
                    clearTransactions()
                    refresh()
                  }
                }}
                onImportReceipt={(items) => {
                  const latestMood = getLatestMood()
                  for (const item of items) {
                    addTransaction({
                      value: item.value,
                      category: item.category,
                      type: 'saida',
                      paymentMethod: 'conta_corrente',
                      description: item.description,
                      excludeFromSavingsAdvice: false,
                      moodId: latestMood?.id || null,
                      mood: latestMood?.mood || null,
                      timestamp: new Date().toISOString(),
                      sleeping: false,
                      sleepUntil: null,
                    })
                  }
                  refresh()
                }}
                onDeleteTransaction={(id) => {
                  deleteTransaction(id)
                  refresh()
                }}
              />
            )}
            {activeTab === 'insights' && <InsightsView key={`insights-${refreshKey}`} />}
            {activeTab === 'planejamento' && <PlanningView key={`planejamento-${refreshKey}`} />}
          </AnimatePresence>

          {/* Floating audio button */}
          <AudioInput onTransactionExtracted={handleAudioTransaction} />

          {/* Add transaction form */}
          <AnimatePresence>
            {showAddForm && (
              <AddTransactionForm onAdd={handleAddTransaction} onClose={() => setShowAddForm(false)} />
            )}
          </AnimatePresence>

          {/* Bottom navigation - mobile only */}
          {isMobile && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
        </>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - desktop only */}
      {!isMobile && (
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          userName={user.name}
        />
      )}

      {/* Main content area */}
      <main className={`
        min-h-screen bg-background transition-all duration-300
        ${isMobile ? 'w-full' : 'lg:ml-64 lg:w-[calc(100%-16rem)]'}
      `}>
        <div className={isMobile ? 'max-w-md mx-auto' : 'max-w-4xl mx-auto p-8'}>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
