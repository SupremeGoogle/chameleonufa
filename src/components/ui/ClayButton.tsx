import { motion, useMotionValue, useSpring } from 'framer-motion'
import type { MouseEvent, PointerEvent, ReactNode } from 'react'
import { useIsTouch } from '../../lib/useIsTouch'

type Props = {
  children: ReactNode
  href?: string
  onClick?: (e: MouseEvent) => void
  variant?: 'orange' | 'lime' | 'white'
  size?: 'md' | 'sm'
  className?: string
  type?: 'button' | 'submit'
  target?: string
  magnetic?: boolean
  ariaLabel?: string
}

const jelly = {
  whileHover: { scale: 1.05 },
  whileTap: { scaleX: 1.12, scaleY: 0.86, transition: { type: 'spring' as const, stiffness: 600, damping: 12 } },
  transition: { type: 'spring' as const, stiffness: 400, damping: 14 },
}

/** «Пластилиновая» кнопка: желейное нажатие + магнит к курсору */
export function ClayButton({ children, href, onClick, variant = 'orange', size = 'md', className = '', type = 'button', target, magnetic = true, ariaLabel }: Props) {
  const touch = useIsTouch()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 14 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 14 })
  const cls = `btn ${variant !== 'orange' ? `btn--${variant}` : ''} ${size === 'sm' ? 'btn--sm' : ''} ${className}`

  const move = (e: PointerEvent<HTMLElement>) => {
    if (!magnetic || touch) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.25)
    y.set((e.clientY - r.top - r.height / 2) * 0.35)
  }
  const leave = () => {
    x.set(0)
    y.set(0)
  }
  const common = { className: cls, style: { x, y }, onPointerMove: move, onPointerLeave: leave, 'aria-label': ariaLabel, ...jelly }

  if (href) {
    const external = href.startsWith('http')
    return (
      <motion.a href={href} onClick={onClick} target={target ?? (external ? '_blank' : undefined)} rel={external ? 'noopener noreferrer' : undefined} {...common}>
        {children}
      </motion.a>
    )
  }
  return (
    <motion.button type={type} onClick={onClick} {...common}>
      {children}
    </motion.button>
  )
}
