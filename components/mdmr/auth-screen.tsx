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
        if (!name.trim()) {
          setError('Informe seu nome.')
          setLoading(false)
          return
        }
        if (!email.trim()) {
          setError('Informe seu email.')
          setLoading(false)
          return
        }
        if (password.length < 4) {
          setError('A senha precisa ter pelo menos 4 caracteres.')
          setLoading(false)
          return
        }
        const result = signup(name, email, password)
        if (result.success && result.user) {
          onAuth(result.user)
        } else {
          setError(result.error || 'Erro ao cadastrar.')
        }
      } else {
        if (!email.trim()) {
          setError('Informe seu email.')
          setLoading(false)
          return
        }
        if (!password) {
          setError('Informe sua senha.')
          setLoading(false)
          return
        }
        const result = login(email, password)
        if (result.success && result.user) {
          onAuth(result.user)
        } else {
          setError(result.error || 'Erro ao entrar.')
        }
      }
      setLoading(false)
    }, 400)
  }

  const switchMode = () => {
    setMode(m => (m === 'login' ? 'signup' : 'login'))
    setError('')
  }

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

    if (!resetEmail.trim()) {
      setResetError('Informe seu email.')
      return
    }

    if (resetPasswordValue.length < 4) {
      setResetError('A nova senha precisa ter pelo menos 4 caracteres.')
      return
    }

    if (resetPasswordValue !== resetConfirmPassword) {
      setResetError('As senhas nao conferem.')
      return
    }

    setResetLoading(true)
    setTimeout(() => {
      const result = resetPassword(resetEmail, resetPasswordValue)
      if (!result.success) {
        setResetError(result.error || 'Nao foi possivel redefinir sua senha.')
        setResetLoading(false)
        return
      }

      setResetSuccess('Senha redefinida com sucesso. Agora faca login.')
      setEmail(resetEmail)
      setPassword('')
      setMode('login')
      setResetLoading(false)

      setTimeout(() => {
        setShowResetModal(false)
      }, 700)
    }, 300)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex w-full max-w-sm flex-col items-center"
      >
        {/* Logo / Brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
          className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-vanessa-lavender/15 border border-vanessa-lavender/20"
        >
          <span className="text-2xl font-bold text-vanessa-lavender">M</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-1 text-2xl font-semibold text-foreground"
        >
          mdmr
         </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-8 text-center text-sm text-muted-foreground leading-relaxed"
        >
          Sua assistente financeira comportamental
        </motion.p>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3"
        >
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="name-field"
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
                    className="w-full rounded-xl border border-border/60 bg-secondary/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-vanessa-lavender/50 focus:outline-none focus:ring-1 focus:ring-vanessa-lavender/30 transition-colors"
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
              className="w-full rounded-xl border border-border/60 bg-secondary/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-vanessa-lavender/50 focus:outline-none focus:ring-1 focus:ring-vanessa-lavender/30 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full rounded-xl border border-border/60 bg-secondary/40 py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-vanessa-lavender/50 focus:outline-none focus:ring-1 focus:ring-vanessa-lavender/30 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="rounded-lg bg-vanessa-danger/10 px-3 py-2 text-xs text-vanessa-danger"
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
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-vanessa-lavender py-3 text-sm font-semibold text-background transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background"
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
          className="mt-6 flex w-full flex-col items-center gap-3 text-center"
        >
          {mode === 'login' && (
            <button
              onClick={openResetModal}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Esqueci minha senha
            </button>
          )}
          <button
            onClick={switchMode}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === 'login' ? (
              <>
                {'Nao tem conta? '}
                <span className="font-medium text-vanessa-lavender">Cadastre-se</span>
              </>
            ) : (
              <>
                {'Ja tem conta? '}
                <span className="font-medium text-vanessa-lavender">Entrar</span>
              </>
            )}
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-background/80 backdrop-blur-sm"
          >
            <motion.form
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onSubmit={handleResetPassword}
              className="w-full rounded-t-3xl border-t border-border bg-card p-6 pb-10"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Redefinir senha</h3>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="text-sm text-muted-foreground"
                >
                  Fechar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="Seu email"
                    className="w-full rounded-xl border border-border/60 bg-secondary/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-vanessa-lavender/50 focus:outline-none focus:ring-1 focus:ring-vanessa-lavender/30 transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={resetPasswordValue}
                    onChange={e => setResetPasswordValue(e.target.value)}
                    placeholder="Nova senha"
                    className="w-full rounded-xl border border-border/60 bg-secondary/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-vanessa-lavender/50 focus:outline-none focus:ring-1 focus:ring-vanessa-lavender/30 transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={e => setResetConfirmPassword(e.target.value)}
                    placeholder="Confirmar nova senha"
                    className="w-full rounded-xl border border-border/60 bg-secondary/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-vanessa-lavender/50 focus:outline-none focus:ring-1 focus:ring-vanessa-lavender/30 transition-colors"
                  />
                </div>
              </div>

              <AnimatePresence>
                {resetError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-3 rounded-lg bg-vanessa-danger/10 px-3 py-2 text-xs text-vanessa-danger"
                  >
                    {resetError}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {resetSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-3 rounded-lg bg-vanessa-success/10 px-3 py-2 text-xs text-vanessa-success"
                  >
                    {resetSuccess}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={resetLoading}
                whileTap={{ scale: 0.97 }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-vanessa-lavender py-3 text-sm font-semibold text-background transition-opacity disabled:opacity-50"
              >
                {resetLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background"
                  />
                ) : (
                  'Redefinir senha'
                )}
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
