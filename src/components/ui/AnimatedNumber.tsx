import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

const fmt = new Intl.NumberFormat('ru-RU')

/** Число, которое «докручивается» пружиной до нового значения */
export function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const spring = useSpring(value, { stiffness: 90, damping: 18 })
  const text = useTransform(spring, (v) => `${fmt.format(Math.round(v / 10) * 10)}${suffix}`)
  useEffect(() => spring.set(value), [spring, value])
  return <motion.span>{text}</motion.span>
}
