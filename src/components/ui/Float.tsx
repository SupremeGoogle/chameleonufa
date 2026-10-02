import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import type { CSSProperties } from 'react'

type Props = {
  src: string
  size: number | string
  style?: CSSProperties
  className?: string
  /** глубина параллакса за мышью */
  depth?: number
  mx?: MotionValue<number>
  my?: MotionValue<number>
  delay?: number
  duration?: number
  rotate?: number
}

/** Парящая 3D-картинка: появление пружиной, покачивание и параллакс за курсором */
export function Float({ src, size, style, className, depth = 20, mx, my, delay = 0, duration = 6, rotate = 8 }: Props) {
  const fallback = useMotionValue(0)
  const x = useTransform(mx ?? fallback, (v) => v * depth)
  const y = useTransform(my ?? fallback, (v) => v * depth)
  return (
    <motion.div className={className} style={{ position: 'absolute', width: size, height: size, x, y, pointerEvents: 'none', ...style }} aria-hidden>
      <motion.div
        style={{ width: '100%', height: '100%' }}
        animate={{ y: [0, -14, 0], rotate: [0, rotate, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <motion.img
          src={src}
          alt=""
          draggable={false}
          initial={{ scale: 0, rotate: -40, opacity: 0 }}
          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 160, damping: 12, delay }}
          style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 18px 16px rgba(64,93,58,.28))' }}
        />
      </motion.div>
    </motion.div>
  )
}
