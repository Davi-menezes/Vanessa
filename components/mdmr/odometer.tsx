'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Odometer — efeito "odômetro": cada dígito desliza por uma fita 0-9
 * até parar no número certo, um depois do outro (efeito 18 do Não Codei).
 */

function RollingDigit({ digit, delay }: { digit: string; delay: number }) {
  const [rolling, setRolling] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRolling(true), delay)
    return () => clearTimeout(t)
  }, [delay, digit])

  return (
    <span className="inline-block overflow-hidden leading-[1.05] h-[1.05em]">
      <span
        className="flex flex-col transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: rolling ? `translateY(-${parseInt(digit, 10) * 10}%)` : 'translateY(0%)' }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="leading-[1.05] h-[1.05em]">
            {n}
          </span>
        ))}
      </span>
    </span>
  )
}

interface OdometerProps {
  value: number
  prefix?: string
  className?: string
  /** ms base antes do primeiro dígito */
  startDelay?: number
  /** intervalo entre dígitos */
  step?: number
}

export function Odometer({ value, prefix = 'R$ ', className, startDelay = 120, step = 110 }: OdometerProps) {
  const text = useMemo(() => {
    const sign = value < 0 ? '-' : ''
    return `${sign}${prefix}${Math.abs(value).toFixed(2)}`
  }, [value, prefix])

  let digitIndex = 0

  return (
    <p
      key={text}
      aria-label={text}
      className={cn('flex items-baseline font-semibold tracking-tight tabular-nums', className)}
    >
      {text.split('').map((ch, i) => {
        if (/\d/.test(ch)) {
          const delay = startDelay + digitIndex++ * step
          return <RollingDigit key={`${i}-${text}`} digit={ch} delay={delay} />
        }
        return (
          <span key={`${i}-${text}`} className="leading-[1.05]">
            {ch}
          </span>
        )
      })}
    </p>
  )
}
