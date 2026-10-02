import { motion, type HTMLMotionProps } from 'framer-motion'

type Props = HTMLMotionProps<'div'> & { delay?: number; y?: number; blur?: boolean }

export function Reveal({ delay = 0, y = 48, blur = true, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: blur ? 'blur(10px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
