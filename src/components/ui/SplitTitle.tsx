import { motion } from 'framer-motion'
import type { ElementType } from 'react'

type Props = {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  /** анимировать сразу при монтировании, а не при попадании в viewport */
  immediate?: boolean
}

/** Заголовок, слова которого «выпрыгивают» снизу по очереди */
export function SplitTitle({ text, as: Tag = 'h2', className, delay = 0, immediate }: Props) {
  const words = text.split(' ')
  const trigger = immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '-10% 0px' } }
  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden
        style={{ display: 'inline' }}
        initial="hidden"
        {...trigger}
        transition={{ staggerChildren: 0.07, delayChildren: delay }}
      >
        {words.map((w, i) => (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em', verticalAlign: 'top' }}>
            <motion.span
              style={{ display: 'inline-block', transformOrigin: '0% 100%' }}
              variants={{
                hidden: { y: '110%', rotate: 8 },
                show: { y: '0%', rotate: 0, transition: { type: 'spring', stiffness: 170, damping: 18 } },
              }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
