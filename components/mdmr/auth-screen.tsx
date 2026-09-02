'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { signup, login, resetPassword } from '@/lib/store'
import type { User as UserType } from '@/lib/types'

interface AuthScreenProps {
  onAuth: (user: UserType) => void
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetPasswordValue, setResetPasswordValue] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Informe seu nome.'); setLoading(false); return }
        if (!email.trim()) { setError('Informe seu email.'); setLoading(false); return }
        if (password.length < 4) { setError('A senha precisa ter pelo menos 4 caracteres.'); setLoading(false); return }
        const result = signup(name, email, password)
        if (result.success && result.user) { onAuth(result.user) } else { setError(result.error || 'Erro ao cadastrar.') }
      } else {
        if (!email.trim()) { setError('Informe seu email.'); setLoading(false); return }
        if (!password) { setError('Informe sua senha.'); setLoading(false); return }
        const result = login(email, password)
        if (result.success && result.user) { onAuth(result.user) } else { setError(result.error || 'Erro ao entrar.') }
      }
      setLoading(false)
    }, 400)
  }

  const switchMode = () => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }

  const openResetModal = () => {
    setResetEmail(email); setResetPasswordValue(''); setResetConfirmPassword('')
    setResetError(''); setResetSuccess(''); setShowResetModal(true)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(''); setResetSuccess('')
    if (!resetEmail.trim()) { setResetError('Informe seu email.'); return }
    if (resetPasswordValue.length < 4) { setResetError('A nova senha precisa ter pelo menos 4 caracteres.'); return }
    if (resetPasswordValue !== resetConfirmPassword) { setResetError('As senhas nao conferem.'); return }
    setResetLoading(true)
    setTimeout(() => {
      const result = resetPassword(resetEmail, resetPasswordValue)
      if (!result.success) { setResetError(result.error || 'Nao foi possivel redefinir sua senha.'); setResetLoading(false); return }
      setResetSuccess('Senha redefinida com sucesso. Agora faca login.')
      setEmail(resetEmail); setPassword(''); setMode('login'); setResetLoading(false)
      setTimeout(() => setShowResetModal(false), 700)
    }, 300)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 overflow-hidden">
      {/* Canopy glow behind the card */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 600, height: 600,
            background: 'radial-gradient(ellipse at center, oklch(0.38 0.14 150 / 0.22) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Glass auth card */}
        <motion.div
          className="glass-strong rounded-3xl p-8"
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="mb-6 flex items-center justify-center"
          >
            <div className="glass flex h-14 w-14 items-center justify-center rounded-2xl glass-glow">
              <span
                className="text-2xl font-bold"
                style={{ color: 'oklch(0.55 0.14 150)', textShadow: '0 0 24px oklch(0.45 0.14 150 / 0.8)' }}
              >
                M
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="mb-1 text-center text-2xl font-semibold text-foreground"
          >
            mdmr
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.36 }}
            className="mb-7 text-center text-sm text-muted-foreground"
          >
            Sua assistente financeira comportamental
          </motion.p>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
          >
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="glass-card w-full rounded-2xl py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Seu email"
                className="glass-card w-full rounded-2xl py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="glass-card w-full rounded-2xl py-3.5 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-xl px-3 py-2.5 text-xs"
                  style={{ color: 'oklch(0.68 0.16 25)' }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="relative mt-2 flex items-center justify-center gap-2 overflow-hidden rounded-2xl py-3.5 text-sm font-semibold text-[oklch(0.99_0.005_145)] transition-opacity disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, oklch(0.38 0.14 150) 0%, oklch(0.30 0.12 152) 100%)',
                boxShadow: '0 0 0 1px oklch(0.45 0.14 150 / 0.30), 0 4px 20px oklch(0.38 0.14 150 / 0.30), 0 8px 32px oklch(0.30 0.12 150 / 0.20)',
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white"
                />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Toggle mode */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6 flex flex-col items-center gap-2.5 text-center"
          >
            {mode === 'login' && (
              <button
                onClick={openResetModal}
                className="text-xs text-muted-foreground/70 transition-colors hover:text-muted-foreground"
              >
                Esqueci minha senha
              </button>
            )}
            <button
              onClick={switchMode}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {mode === 'login' ? (
                <>Nao tem conta? <span className="font-medium" style={{ color: 'oklch(0.52 0.14 150)' }}>Cadastre-se</span></>
              ) : (
                <>Ja tem conta? <span className="font-medium" style={{ color: 'oklch(0.52 0.14 150)' }}>Entrar</span></>
              )}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Reset modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'oklch(0.05 0.005 150 / 0.75)', backdropFilter: 'blur(12px)' }}
          >
            <motion.form
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 35, stiffness: 320 }}
              onSubmit={handleResetPassword}
              className="glass-strong w-full rounded-t-[28px] border-t border-white/10 p-6 pb-10"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Redefinir senha</h3>
                <button type="button" onClick={() => setShowResetModal(false)} className="text-sm text-muted-foreground">Fechar</button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Seu email"
                    className="glass-card w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password" value={resetPasswordValue} onChange={e => setResetPasswordValue(e.target.value)} placeholder="Nova senha"
                    className="glass-card w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password" value={resetConfirmPassword} onChange={e => setResetConfirmPassword(e.target.value)} placeholder="Confirmar nova senha"
                    className="glass-card w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
              </div>

              <AnimatePresence>
                {resetError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="glass-card mt-3 rounded-xl px-3 py-2.5 text-xs"
                    style={{ color: 'oklch(0.68 0.16 25)' }}
                  >{resetError}</motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {resetSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="glass-card mt-3 rounded-xl px-3 py-2.5 text-xs"
                    style={{ color: 'oklch(0.52 0.14 150)' }}
                  >{resetSuccess}</motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit" disabled={resetLoading} whileTap={{ scale: 0.98 }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, oklch(0.38 0.14 150), oklch(0.30 0.12 152))', boxShadow: '0 4px 20px oklch(0.38 0.14 150 / 0.30)' }}
              >
                {resetLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white" />
                ) : 'Redefinir senha'}
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}