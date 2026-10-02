import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { faq, icons } from '../data'
import { Reveal } from './ui/Reveal'
import { SplitTitle } from './ui/SplitTitle'
import './Faq.css'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="section faq">
      <div className="container faq__grid">
        <div className="faq__intro">
          <Reveal>
            <span className="eyebrow clay clay--butter">
              <img src={icons.speech} alt="" /> Вопросы
            </span>
          </Reveal>
          <SplitTitle className="section-title" text={faq.title} />
          <motion.img
            src={icons.chameleon}
            alt=""
            className="faq__mascot"
            initial={{ x: -120, opacity: 0, rotate: -30 }}
            whileInView={{ x: 0, opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80, damping: 12 }}
          />
        </div>

        <div className="faq__list">
          {faq.items.map((f, i) => {
            const isOpen = open === i
            return (
              <Reveal key={f.q} delay={i * 0.06} y={30}>
                <motion.div className={`faq__item clay ${isOpen ? 'clay--lime' : ''}`} layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                  <button className="faq__q" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                    <img src={f.icon} alt="" loading="lazy" />
                    <span>{f.q}</span>
                    <motion.span className="faq__plus" animate={{ rotate: isOpen ? 135 : 0, backgroundColor: isOpen ? '#405d3a' : '#ff955f' }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                      <Plus size={20} color="#fff" strokeWidth={3} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="faq__a"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                      >
                        <motion.p initial={{ y: -10 }} animate={{ y: 0 }}>
                          {f.a}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
