import { motion } from 'framer-motion'
import { useRef } from 'react'
import { formats, icons } from '../data'
import { Float } from './ui/Float'
import { Reveal } from './ui/Reveal'
import { popItem, stagger } from './ui/variants'
import { SplitTitle } from './ui/SplitTitle'
import './Formats.css'

export function Wave({ flip, color }: { flip?: boolean; color: string }) {
  return (
    <svg className={`wave ${flip ? 'wave--flip' : ''}`} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
      <path fill={color} d="M0,64 C180,120 360,0 540,40 C720,80 900,120 1080,72 C1260,24 1350,40 1440,56 L1440,120 L0,120 Z" />
    </svg>
  )
}

export function Formats() {
  const area = useRef<HTMLDivElement>(null)
  return (
    <section className="formats">
      <Wave color="var(--orange)" />
      <div className="formats__body">
        <Float src={icons.lollipop} size={90} style={{ top: 40, left: '6%' }} depth={0} duration={5} />
        <Float src={icons.rainbow} size={110} style={{ bottom: 30, right: '5%' }} depth={0} duration={7} />
        <div className="container formats__inner">
          <SplitTitle className="section-title formats__title" text={formats.title} />
          <Reveal delay={0.1}>
            <p className="lead formats__lead">{formats.text}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="formats__hint">Где проведём праздник? Потяни карточки 👇</p>
          </Reveal>
          <motion.div ref={area} className="formats__places" variants={stagger(0.07)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-15% 0px' }}>
            {formats.places.map((p, i) => (
              <motion.div
                key={p.text}
                className={`clay formats__place clay--${['lime', 'butter', 'sky', 'pink', 'lilac', 'mint'][i]}`}
                variants={popItem}
                drag
                dragConstraints={area}
                dragElastic={0.35}
                dragSnapToOrigin
                whileDrag={{ scale: 1.12, rotate: i % 2 ? 6 : -6, zIndex: 10, cursor: 'grabbing' }}
                whileHover={{ y: -8, rotate: i % 2 ? 2 : -2 }}
              >
                <img src={p.icon} alt="" draggable={false} />
                <span>{p.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      <Wave color="var(--orange)" flip />
    </section>
  )
}
