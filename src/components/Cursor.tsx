import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useIsTouch } from '../lib/useIsTouch'

/** Мягкий «пузырь»-курсор, который раздувается над кликабельными элементами */
export function Cursor() {
  const touch = useIsTouch()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40 })
  const sy = useSpring(y, { stiffness: 500, damping: 40 })
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    if (touch) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target as HTMLElement
      setHover(!!t.closest('a, button, [role="tab"], select, input, textarea, .formats__place, .reviews__card'))
    }
    const d = () => setDown(true)
    const u = () => setDown(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', d)
    window.addEventListener('pointerup', u)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', d)
      window.removeEventListener('pointerup', u)
    }
  }, [touch, x, y])

  if (touch) return null
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: sx,
        y: sy,
        width: 40,
        height: 40,
        marginLeft: -20,
        marginTop: -20,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 999,
        background: 'rgba(166, 198, 76, 0.35)',
        border: '2px solid rgba(64, 93, 58, 0.5)',
        backdropFilter: 'blur(2px)',
      }}
      animate={{ scale: down ? 0.7 : hover ? 1.8 : 1, backgroundColor: hover ? 'rgba(255, 149, 95, 0.3)' : 'rgba(166, 198, 76, 0.35)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    />
  )
}
