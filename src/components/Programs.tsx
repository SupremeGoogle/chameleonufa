import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info } from 'lucide-react'
import { useState } from 'react'
import { icons, nuances, programs, programsIntro } from '../data'
import { requestBooking } from '../lib/booking'
import { scrollToId } from '../lib/scroll'
import { AnimatedNumber } from './ui/AnimatedNumber'
import { ClayButton } from './ui/ClayButton'
import { Reveal } from './ui/Reveal'
import { SplitTitle } from './ui/SplitTitle'
import { TiltCard } from './ui/TiltCard'
import './Programs.css'

export function Programs() {
  const [[index, dir], setState] = useState<[number, number]>([0, 0])
  const [durations, setDurations] = useState<Record<string, number>>({})
  const p = programs[index]
  const d = durations[p.id] ?? 0
  const price = p.prices[Math.min(d, p.prices.length - 1)]

  const select = (i: number) => setState([i, i > index ? 1 : -1])

  const book = () => {
    requestBooking({ program: p.name, duration: price.label })
    scrollToId('contacts')
  }

  return (
    <section id="programs" className="section programs">
      <div className="blob" style={{ width: 480, height: 480, background: 'var(--c-sky)', top: 100, right: -140 }} />
      <div className="container">
        <div className="programs__head">
          <Reveal>
            <span className="eyebrow clay clay--sky">
              <img src={icons.crown} alt="" /> Тарифы
            </span>
          </Reveal>
          <SplitTitle className="section-title" text="Стоимость наших программ" />
          <Reveal delay={0.1}>
            <p className="lead">{programsIntro}</p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="programs__tabs" role="tablist" aria-label="Программы">
            {programs.map((pr, i) => (
              <motion.button
                key={pr.id}
                role="tab"
                aria-selected={i === index}
                className={`programs__tab ${i === index ? 'is-active' : ''}`}
                onClick={() => select(i)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.92 }}
              >
                {i === index && <motion.span layoutId="program-tab" className={`programs__tab-bg clay clay--${pr.color}`} transition={{ type: 'spring', stiffness: 350, damping: 30 }} />}
                <motion.img src={pr.icon} alt="" animate={i === index ? { rotate: [0, -14, 12, 0], scale: [1, 1.25, 1] } : { rotate: 0, scale: 1 }} transition={{ duration: 0.6 }} />
                <span>{pr.name}</span>
              </motion.button>
            ))}
          </div>
        </Reveal>

        <div className="programs__stage">
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.article
              key={p.id}
              custom={dir}
              className={`programs__card clay clay--${p.color}`}
              variants={{
                enter: (dr: number) => ({ x: dr * 140, opacity: 0, rotate: dr * 4, scale: 0.92 }),
                center: { x: 0, opacity: 1, rotate: 0, scale: 1 },
                exit: (dr: number) => ({ x: dr * -140, opacity: 0, rotate: dr * -4, scale: 0.92 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              role="tabpanel"
            >
              <div className="programs__photos">
                {p.photos.map((src, i) => (
                  <TiltCard key={src} className={`programs__photo programs__photo--${i}`} max={12}>
                    <motion.img
                      src={src}
                      alt={`Программа ${p.name}`}
                      initial={{ scale: 0.6, opacity: 0, rotate: i ? 12 : -12 }}
                      animate={{ scale: 1, opacity: 1, rotate: i ? 4 : -5 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 15, delay: 0.1 + i * 0.12 }}
                    />
                  </TiltCard>
                ))}
                <motion.img
                  className="programs__icon"
                  src={p.icon}
                  alt=""
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0, y: [0, -10, 0] }}
                  transition={{ scale: { type: 'spring', stiffness: 200, damping: 10, delay: 0.35 }, rotate: { type: 'spring', stiffness: 200, damping: 10, delay: 0.35 }, y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }}
                />
              </div>

              <div className="programs__info">
                <div className="programs__num">/{p.num}</div>
                <h3 className="programs__name">
                  Программа <span>{p.name}</span>
                </h3>

                <div className="programs__durations clay-inset" role="radiogroup" aria-label="Длительность">
                  {p.prices.map((pr, i) => (
                    <button key={pr.label} role="radio" aria-checked={i === d} className={i === d ? 'is-active' : ''} onClick={() => setDurations((s) => ({ ...s, [p.id]: i }))}>
                      {i === d && <motion.span layoutId={`dur-${p.id}`} className="programs__dur-bg" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                      <span>{pr.label}</span>
                    </button>
                  ))}
                </div>

                <div className="programs__price">
                  <AnimatedNumber value={price.price} suffix=" ₽" />
                  <small>за {price.label}</small>
                </div>

                <h4 className="programs__sub">Что входит:</h4>
                <motion.ul className="programs__list" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.2 } } }}>
                  {p.includes.map((it) => (
                    <motion.li key={it} variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}>
                      <span className="programs__check">
                        <Check size={14} strokeWidth={4} />
                      </span>
                      {it}
                    </motion.li>
                  ))}
                </motion.ul>

                <ClayButton onClick={book} className="programs__book">
                  Забронировать «{p.name}»
                </ClayButton>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <Reveal>
          <div className="programs__nuances clay">
            <div className="programs__nuances-head">
              <Info size={22} />
              <h4>Нюансы для всех программ</h4>
            </div>
            <ul>
              {nuances.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
