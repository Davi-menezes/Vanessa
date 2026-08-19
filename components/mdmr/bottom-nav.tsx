'use client'

import { motion } from 'framer-motion'
import { Home, BarChart3, Wallet, PiggyBank } from 'lucide-react'

type Tab = 'home' | 'transacoes' | 'insights' | 'planejamento'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Início', icon: <Home className="h-5 w-5" /> },
  { id: 'transacoes', label: 'Gastos', icon: <Wallet className="h-5 w-5" /> },
  { id: 'insights', label: 'Insights', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'planejamento', label: 'Plano', icon: <PiggyBank className="h-5 w-5" /> },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/50 bg-card/95 backdrop-blur-xl lg:hidden" role="navigation" aria-label="Menu principal">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-colors ${
              activeTab === tab.id
                ? 'text-vanessa-lavender'
                : 'text-muted-foreground'
            }`}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="nav-indicator-mobile"
                className="absolute inset-0 rounded-xl bg-vanessa-lavender/10"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10 text-[10px] font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  )
}
