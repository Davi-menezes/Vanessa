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
    <nav
      className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] lg:hidden"
      role="navigation"
      aria-label="Menu principal"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 26 }}
        className="glass-strong flex items-center gap-1 rounded-full p-1.5"
      >
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 rounded-full px-4 py-2"
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-vanessa-lavender/15 border border-vanessa-lavender/25"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${active ? 'text-vanessa-success' : 'text-muted-foreground'}`}>
                {tab.icon}
              </span>
              <span className={`relative z-10 text-[9px] font-medium transition-colors ${active ? 'text-vanessa-success' : 'text-muted-foreground/70'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </motion.div>
    </nav>
  )
}
