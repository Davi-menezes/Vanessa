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
  { id: 'home', label: 'Início', icon: <Home className="h-5 w-5" /> },
  { id: 'transacoes', label: 'Gastos', icon: <Wallet className="h-5 w-5" /> },
  { id: 'insights', label: 'Insights', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'planejamento', label: 'Plano', icon: <PiggyBank className="h-5 w-5" /> },
]

export function Sidebar({ activeTab, onTabChange, onLogout, userName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) return null

  return (
    <motion.aside
      initial={{ width: collapsed ? '64px' : '260px' }}
      animate={{ width: collapsed ? '64px' : '260px' }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-card/95 backdrop-blur-xl transition-all duration-300 flex flex-col"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Logo & Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-vanessa-lavender/15 border border-vanessa-lavender/20">
              <span className="text-xl font-bold text-vanessa-lavender">M</span>
            </div>
            <span className="text-lg font-semibold text-foreground">mdmr</span>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          {collapsed ? <Home className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 w-full transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-vanessa-lavender/10 text-vanessa-lavender'
                : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
            }`}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="relative z-10 flex-shrink-0">{tab.icon}</span>
            {!collapsed && (
              <span className="relative z-10 text-sm font-medium truncate">{tab.label}</span>
            )}
            {activeTab === tab.id && !collapsed && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute left-0 top-0 bottom-0 w-1 rounded-r-xl bg-vanessa-lavender"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* User info & Logout at bottom */}
      <div className="border-t border-border/50 p-4">
        {!collapsed && userName && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Conectado como</p>
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 w-full transition-colors text-muted-foreground hover:bg-secondary/40 hover:text-foreground ${
            collapsed ? 'justify-center' : ''
          }`}
          aria-label="Sair da conta"
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </motion.button>
      </div>
    </motion.aside>
  )
}