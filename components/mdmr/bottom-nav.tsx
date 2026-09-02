'use client'

import { motion } from 'framer-motion'
import { Home, BarChart3, Wallet, PiggyBank } from 'lucide-react'

type Tab = 'home' | 'transacoes' | 'insights' | 'planejamento'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home',         label: 'Início',   icon: <Home className="h-5 w-5" /> },
  { id: 'transacoes',  label: 'Gastos',   icon: <Wallet className="h-5 w-5" /> },
  { id: 'insights',    label: 'Insights', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'planejamento',label: 'Plano',    icon: <PiggyBank className="h-5 w-5" /> },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 z-40 flex justify-center lg:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      role="navigation"
      aria-label="Menu principal"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 28 }}
        className="flex items-center gap-1 rounded-full px-2 py-2"
        style={{
          background: 'oklch(0.10 0.012 150 / 0.82)',
          backdropFilter: 'blur(32px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
          border: '1px solid oklch(1 0 0 / 0.12)',
          boxShadow: [
            'inset 0 1px 0 oklch(1 0 0 / 0.12)',
            'inset 0 -1px 0 oklch(0 0 0 / 0.30)',
            '0 16px 48px oklch(0 0 0 / 0.55)',
            '0 0 32px oklch(0.30 0.12 150 / 0.20)',
          ].join(', '),
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.82 }}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center gap-0.5 rounded-full px-4 py-2"
              style={{
                color: isActive ? 'oklch(0.62 0.14 150)' : 'oklch(0.45 0.025 150)',
                transition: 'color 0.25s ease',
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active glass pill */}
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'oklch(0.32 0.12 150 / 0.35)',
                    border: '1px solid oklch(1 0 0 / 0.10)',
                    boxShadow: [
                      'inset 0 1px 0 oklch(1 0 0 / 0.12)',
                      'inset 0 -1px 0 oklch(0 0 0 / 0.25)',
                      '0 0 20px oklch(0.38 0.13 150 / 0.30)',
                    ].join(', '),
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {/* Icon */}
              <span className="relative z-10">{tab.icon}</span>
              {/* Label */}
              <span className="relative z-10 text-[9px] font-semibold tracking-wide">{tab.label}</span>
            </motion.button>
          )
        })}
      </motion.div>
    </nav>
  )
}
