import { motion } from 'framer-motion'
import { addons, icons } from '../data'
import { Reveal } from './ui/Reveal'
import { popItem, stagger } from './ui/variants'
import { SplitTitle } from './ui/SplitTitle'
import { TiltCard } from './ui/TiltCard'
import './Addons.css'

export function Addons() {
  return (
    <section className="section addons">
      <div className="container">
        <div className="addons__head">
          <Reveal>
            <span className="eyebrow clay clay--pink">
              <img src={icons.gift} alt="" /> Дополнения
            </span>
          </Reveal>
          <SplitTitle className="section-title" text={addons.title} />
          <Reveal delay={0.1}>
            <p className="lead">{addons.text}</p>
          </Reveal>
        </div>

        <motion.div className="addons__grid" variants={stagger(0.09)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10% 0px' }}>
          {addons.items.map((a) => (
            <motion.div key={a.title} variants={popItem}>
              <TiltCard className={`addons__card clay clay--${a.color}`} max={14} whileHover="hover">
                <motion.img
                  src={a.icon}
                  alt=""
                  loading="lazy"
                  className="addons__icon"
                  variants={{ hover: { y: -16, rotate: [0, -12, 10, -6, 0], scale: 1.15, transition: { duration: 0.6 } } }}
                />
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
