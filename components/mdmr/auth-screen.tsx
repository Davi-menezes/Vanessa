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
        if (result.success && result.user) onAuth(result.user)
        else setError(result.error || 'Erro ao cadastrar.')
      } else {
        if (!email.trim()) { setError('Informe seu email.'); setLoading(false); return }
        if (!password) { setError('Informe sua senha.'); setLoading(false); return }
        const result = login(email, password)
        if (result.success && result.user) onAuth(result.user)
        else setError(result.error || 'Erro ao entrar.')
      }
      setLoading(false)
    }, 400)
  }

  const switchMode = () => { setMode(m => (m === 'login' ? 'signup' : 'login')); setError('') }

  const openResetModal = () => {
    setResetEmail(email)
    setResetPasswordValue('')
    setResetConfirmPassword('')
    setResetError('')
    setResetSuccess('')
    setShowResetModal(true)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')
    setResetSuccess('')
    if (!resetEmail.trim()) { setResetError('Informe seu email.'); return }
    if (resetPasswordValue.length < 4) { setResetError('A nova senha precisa ter pelo menos 4 caracteres.'); return }
    if (resetPasswordValue !== resetConfirmPassword) { setResetError('As senhas nao conferem.'); return }
    setResetLoading(true)
    setTimeout(() => {
      const result = resetPassword(resetEmail, resetPasswordValue)
      if (!result.success) { setResetError(result.error || 'Nao foi possivel redefinir.'); setResetLoading(false); return }
      setResetSuccess('Senha redefinida. Faca login.')
      setEmail(resetEmail); setPassword(''); setMode('login'); setResetLoading(false)
      setTimeout(() => setShowResetModal(false), 700)
    }, 300)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5">
      <div className="jungle-scene" aria-hidden />
      {/* Green ambient bloom behind the card — subtle, single source */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[480px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
        style={{ background: 'radial-gradient(closest-side, oklch(0.35 0.12 150 / 0.20), transparent)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Glass card */}
        <div className="glass-strong rounded-3xl p-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 22 }}
            className="mb-6 flex justify-center"
          >
            <div className="glass ring-jungle flex h-14 w-14 items-center justify-center rounded-2xl">
              <span className="text-2xl font-bold text-vanessa-success">M</span>
            </div>
          </motion.div>

          <h1 className="mb-1 text-center text-[22px] font-semibold tracking-tight text-foreground">mdmr</h1>
          <p className="mb-7 text-center text-sm text-muted-foreground">Sua assistente financeira comportamental</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="input-glass relative rounded-2xl">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-glass relative rounded-2xl">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Seu email"
                className="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>

            <div className="input-glass relative rounded-2xl">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full bg-transparent py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-xl border-vanessa-danger/20 bg-vanessa-danger/5 px-3 py-2.5 text-xs text-vanessa-danger"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary mt-2 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2.5 text-center">
            {mode === 'login' && (
              <button
                onClick={openResetModal}
                className="text-xs text-muted-foreground/70 transition hover:text-muted-foreground"
              >
                Esqueci minha senha
              </button>
            )}
            <button onClick={switchMode} className="text-sm text-muted-foreground transition hover:text-foreground">
              {mode === 'login' ? (
                <>Nao tem conta? <span className="font-medium text-vanessa-success">Cadastre-se</span></>
              ) : (
                <>Ja tem conta? <span className="font-medium text-vanessa-success">Entrar</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Reset password sheet */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-md"
          >
            <motion.form
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onSubmit={handleResetPassword}
              className="glass-strong w-full rounded-t-3xl p-6 pb-10"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Redefinir senha</h3>
                <button type="button" onClick={() => setShowResetModal(false)} className="text-sm text-muted-foreground">
                  Fechar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { icon: Mail, value: resetEmail, setter: setResetEmail, ph: 'Seu email', type: 'email' as const },
                  { icon: Lock, value: resetPasswordValue, setter: setResetPasswordValue, ph: 'Nova senha', type: 'password' as const },
                  { icon: Lock, value: resetConfirmPassword, setter: setResetConfirmPassword, ph: 'Confirmar nova senha', type: 'password' as const },
                ].map(({ icon: Icon, value, setter, ph, type }, i) => (
                  <div key={i} className="input-glass relative rounded-2xl">
                    <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={type}
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder={ph}
                      className="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {resetError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card mt-3 rounded-xl border-vanessa-danger/20 bg-vanessa-danger/5 px-3 py-2.5 text-xs text-vanessa-danger"
                  >
                    {resetError}
                  </motion.p>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {resetSuccess && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card mt-3 rounded-xl border-vanessa-success/20 bg-vanessa-success/5 px-3 py-2.5 text-xs text-vanessa-success"
                  >
                    {resetSuccess}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={resetLoading}
                whileTap={{ scale: 0.98 }}
                className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-50"
              >
                {resetLoading
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  : 'Redefinir senha'}
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
