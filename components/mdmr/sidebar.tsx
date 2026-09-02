'use client'

import { motion } from 'framer-motion'
import { Home, BarChart3, Wallet, PiggyBank, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

type Tab = 'home' | 'transacoes' | 'insights' | 'planejamento'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onLogout: () => void
  userName?: string
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home',          label: 'Início',   icon: <Home className="h-5 w-5" /> },
  { id: 'transacoes',   label: 'Gastos',   icon: <Wallet className="h-5 w-5" /> },
  { id: 'insights',     label: 'Insights', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'planejamento', label: 'Plano',    icon: <PiggyBank className="h-5 w-5" /> },
]

export function Sidebar({ activeTab, onTabChange, onLogout, userName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) return null

  return (
    <motion.aside
      initial={{ width: collapsed ? 64 : 260 }}
      animate={{ width: collapsed ? 64 : 260 }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col"
      style={{
        background: 'oklch(0.08 0.010 150 / 0.82)',
        backdropFilter: 'blur(32px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
        borderRight: '1px solid oklch(1 0 0 / 0.08)',
        boxShadow: 'inset -1px 0 0 oklch(0 0 0 / 0.30), 4px 0 32px oklch(0 0 0 / 0.50)',
      }}
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Brand */}
      <div
        className="flex h-16 items-center justify-between px-4"
        style={{ borderBottom: '1px solid oklch(1 0 0 / 0.06)' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: 'oklch(0.30 0.13 150 / 0.35)',
                backdropFilter: 'blur(16px)',
                border: '1px solid oklch(0.45 0.14 150 / 0.28)',
                boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.10), 0 0 16px oklch(0.38 0.13 150 / 0.25)',
              }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: 'oklch(0.58 0.14 150)', textShadow: '0 0 16px oklch(0.45 0.14 150 / 0.9)' }}
              >
                M
              </span>
            </div>
            <span className="text-[15px] font-semibold text-foreground">mdmr</span>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setCollapsed(!collapsed)}
          className="glass-card flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? <Home className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
        </motion.button>
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onTabChange(tab.id)}
              className="relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left"
              style={{
                color: isActive ? 'oklch(0.62 0.14 150)' : 'oklch(0.48 0.025 150)',
                transition: 'color 0.2s ease',
                background: isActive ? 'oklch(0.28 0.11 150 / 0.35)' : 'transparent',
                border: isActive ? '1px solid oklch(1 0 0 / 0.08)' : '1px solid transparent',
                boxShadow: isActive
                  ? 'inset 0 1px 0 oklch(1 0 0 / 0.10), 0 0 20px oklch(0.35 0.12 150 / 0.20)'
                  : 'none',
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator bar */}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="side-indicator"
                  className="absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-full"
                  style={{
                    height: '60%',
                    background: 'oklch(0.52 0.14 150)',
                    boxShadow: '0 0 12px oklch(0.45 0.14 150 / 0.70)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              <span className="flex-shrink-0">{tab.icon}</span>
              {!collapsed && (
                <span className="truncate text-sm font-medium">{tab.label}</span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div
        className="p-4"
        style={{ borderTop: '1px solid oklch(1 0 0 / 0.06)' }}
      >
        {!collapsed && userName && (
          <div className="mb-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">Conectado como</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">{userName}</p>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${collapsed ? 'justify-center' : ''}`}
          style={{ color: 'oklch(0.48 0.025 150)' }}
          aria-label="Sair da conta"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </motion.button>
      </div>
    </motion.aside>
  )
}
