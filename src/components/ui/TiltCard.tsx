import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { useIsTouch } from '../../lib/useIsTouch'

type Props = Omit<HTMLMotionProps<'div'>, 'children'> & { max?: number; glare?: boolean; children?: ReactNode }

/** Карточка с 3D-наклоном за курсором и мягким бликом */
export function TiltCard({ max = 10, glare = true, children, style, onPointerMove, onPointerLeave, ...rest }: Props) {
  const touch = useIsTouch()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 180, damping: 18 })
  const sy = useSpring(py, { stiffness: 180, damping: 18 })
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max, -max])
  const gx = useTransform(sx, (v) => `${v * 100}%`)
  const gy = useTransform(sy, (v) => `${v * 100}%`)
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.55), transparent 55%)`

  const move = (e: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e)
    if (touch) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const leave = (e: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e)
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ ...style, rotateX: touch ? 0 : rotateX, rotateY: touch ? 0 : rotateY, transformPerspective: 900 }}
      {...rest}
    >
      {children}
      {glare && !touch && (
        <motion.span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: glareBg,
            pointerEvents: 'none',
            mixBlendMode: 'soft-light',
          }}
        />
      )}
    </motion.div>
  )
}
