import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import './Preloader.css'

/** Экран загрузки: хамелеон меняет цвет, счётчик, затем «шторки» уезжают вверх */
export function Preloader({ onDone }: { onDone: () => void }) {
  const progress = useMotionValue(0)
  const rounded = useTransform(progress, (v) => `${Math.round(v)}%`)
  const width = useTransform(progress, (v) => `${v}%`)

  useEffect(() => {
    const controls = animate(progress, 100, { duration: 1.6, ease: [0.65, 0, 0.35, 1], onComplete: () => setTimeout(onDone, 150) })
    return () => controls.stop()
  }, [progress, onDone])

  return (
    <motion.div className="preloader" exit={{ pointerEvents: 'none' }}>
      {['var(--orange)', 'var(--lime)', 'var(--bg)'].map((c, i) => (
        <motion.div
          key={c}
          className="preloader__curtain"
          style={{ background: c, zIndex: i }}
          exit={{ y: '-105%', borderBottomLeftRadius: '50% 18%', borderBottomRightRadius: '50% 18%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: (2 - i) * 0.12 }}
        />
      ))}
      <motion.div className="preloader__inner" exit={{ opacity: 0, scale: 0.8, y: -40 }} transition={{ duration: 0.4 }}>
        <motion.div
          className="preloader__logo"
          role="img"
          aria-label="Chameleon"
          style={{ ['--logo' as string]: `url(${import.meta.env.BASE_URL}img/logo.svg)` }}
          initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 13 }}
        />
        <div className="preloader__bar clay-inset">
          <motion.span style={{ width }} />
        </div>
        <motion.div className="preloader__num">{rounded}</motion.div>
      </motion.div>
    </motion.div>
  )
}
