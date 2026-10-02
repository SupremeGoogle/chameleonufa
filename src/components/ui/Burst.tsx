import { motion } from 'framer-motion'
import { useState } from 'react'
import { icons } from '../../data'

const pool = [icons.party, icons.balloon, icons.star, icons.heart, icons.confetti, icons.sparkles, icons.lollipop, icons.gift]

/** Взрыв 3D-конфетти из центра родителя */
export function Burst({ count = 18 }: { count?: number }) {
  const [parts] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + Math.random() * 0.4,
      dist: 160 + Math.random() * 220,
      spin: Math.random() * 540 - 270,
    })),
  )
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 20 }} aria-hidden>
      {parts.map(({ angle, dist, spin }, i) => {
        return (
          <motion.img
            key={i}
            src={pool[i % pool.length]}
            alt=""
            style={{ position: 'absolute', left: '50%', top: '50%', width: 44, height: 44, marginLeft: -22, marginTop: -22 }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 80, scale: [0, 1.3, 1], rotate: spin, opacity: [1, 1, 0] }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
        )
      })}
    </div>
  )
}
