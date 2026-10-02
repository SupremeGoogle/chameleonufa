import { motion } from 'framer-motion'
import { icons, safety } from '../data'
import { Wave } from './Formats'
import { Float } from './ui/Float'
import { Reveal } from './ui/Reveal'
import { SplitTitle } from './ui/SplitTitle'
import './Safety.css'

export function Safety() {
  return (
    <section id="safety" className="safety">
      <Wave color="var(--forest)" />
      <div className="safety__body">
        <Float src={icons.dizzy} size={70} style={{ top: 40, right: '8%' }} duration={5} />
        <div className="container">
          <div className="safety__top">
            <div className="safety__intro">
              <Reveal>
                <span className="eyebrow clay clay--lime">
                  <img src={icons.check} alt="" /> Безопасность
                </span>
              </Reveal>
              <SplitTitle className="section-title" text={safety.title} />
              <Reveal delay={0.1}>
                <p className="safety__text">{safety.text}</p>
              </Reveal>
            </div>
            <motion.div
              className="safety__shield"
              initial={{ scale: 0.3, rotate: -40, opacity: 0 }}
              whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 120, damping: 10 }}
            >
              <motion.img src={`${import.meta.env.BASE_URL}img/3d/shield.png`} alt="" animate={{ y: [0, -16, 0], rotate: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} />
              <span className="safety__ring" />
              <span className="safety__ring safety__ring--2" />
            </motion.div>
          </div>

          <motion.ul className="safety__chips" initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
            {safety.chips.map((c) => (
              <motion.li key={c.text} className="clay clay--forest safety__chip" variants={{ hidden: { opacity: 0, y: 30, scale: 0.8 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 16 } } }}>
                <img src={c.icon} alt="" loading="lazy" />
                {c.text}
              </motion.li>
            ))}
          </motion.ul>

          <div className="safety__grid">
            {safety.items.map((s, i) => (
              <motion.article
                key={s.title}
                className="clay safety__card"
                initial={{ opacity: 0, rotateX: -70, y: 60 }}
                whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ type: 'spring', stiffness: 90, damping: 16, delay: i * 0.12 }}
                whileHover={{ y: -10 }}
                style={{ transformPerspective: 1000, transformOrigin: '50% 0%' }}
              >
                <img src={s.icon} alt="" loading="lazy" />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
      <Wave color="var(--forest)" flip />
    </section>
  )
}
