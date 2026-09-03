'use client'

import { motion } from 'framer-motion'
import { Home, BarChart3, Wallet, PiggyBank, LogOut, ChevronRight, ChevronLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

type Tab = 'home' | 'transacoes' | 'insights' | 'planejamento'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onLogout: () => void
  userName?: string
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Início', icon: <Home className="h-[18px] w-[18px]" /> },
  { id: 'transacoes', label: 'Gastos', icon: <Wallet className="h-[18px] w-[18px]" /> },
  { id: 'insights', label: 'Insights', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
  { id: 'planejamento', label: 'Plano', icon: <PiggyBank className="h-[18px] w-[18px]" /> },
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
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong fixed left-0 top-0 z-40 flex h-screen flex-col rounded-r-3xl rounded-l-none border-y-0 border-l-0"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="glass ring-jungle flex h-8 w-8 items-center justify-center rounded-xl">
              <span className="text-lg font-bold text-vanessa-success">M</span>
            </div>
            <span className="text-[15px] font-semibold text-foreground">mdmr</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="glass-card flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:text-foreground"
          aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                active
                  ? 'bg-vanessa-lavender/15 text-vanessa-lavender'
                  : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
              } ${collapsed ? 'justify-center' : ''}`}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              {active && !collapsed && (
                <motion.span
                  layoutId="side-indicator"
                  className="absolute left-0 top-1/2 h-1/2 w-[3px] -translate-y-1/2 rounded-full bg-vanessa-lavender"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="shrink-0">{tab.icon}</span>
              {!collapsed && <span className="truncate text-sm font-medium">{tab.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/[0.06] p-4">
        {!collapsed && userName && (
          <div className="mb-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Conectado como</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">{userName}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground ${collapsed ? 'justify-center' : ''}`}
          aria-label="Sair da conta"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </motion.aside>
  )
}
