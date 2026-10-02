import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useRef } from 'react'
import { marquee } from '../data'
import './Marquee.css'

const wrap = (min: number, max: number, v: number) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

/** Бегущая лента, которая ускоряется и разворачивается от скорости скролла */
function Row({ baseVelocity, tilt, color }: { baseVelocity: number; tilt: number; color: string }) {
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false })
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`)
  const dir = useRef(1)

  useAnimationFrame((_, delta) => {
    let move = dir.current * baseVelocity * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    move += dir.current * move * Math.abs(f)
    base.set(base.get() + move)
  })

  const items = [...marquee, ...marquee]
  return (
    <div className={`marquee__row clay clay--${color}`} style={{ rotate: `${tilt}deg` }}>
      <motion.div className="marquee__track" style={{ x }}>
        {items.map((m, i) => (
          <span className="marquee__item" key={i}>
            <img src={m.icon} alt="" loading="lazy" />
            {m.text}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function Marquee() {
  return (
    <div className="marquee" aria-label="Наши шоу и услуги">
      <Row baseVelocity={-3} tilt={-2.5} color="lime" />
      <Row baseVelocity={3} tilt={1.5} color="peach" />
    </div>
  )
}
