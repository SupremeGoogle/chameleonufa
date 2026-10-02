import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { hero, icons } from '../data'
import { scrollToId } from '../lib/scroll'
import { ClayButton } from './ui/ClayButton'
import { Float } from './ui/Float'
import './Hero.css'

const wordColors = ['var(--ink)', 'var(--ink)', 'var(--lime-deep)', 'var(--orange-deep)']

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const [slide, setSlide] = useState(0)
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 })
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.82])
  const visualRotate = useTransform(scrollYProgress, [0, 1], [0, -8])

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % hero.photos.length), 3800)
    return () => clearInterval(t)
  }, [])

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    mx.set(e.clientX / window.innerWidth - 0.5)
    my.set(e.clientY / window.innerHeight - 0.5)
  }

  return (
    <section id="top" ref={ref} className="hero" onPointerMove={onMove}>
      <div className="blob" style={{ width: 520, height: 520, background: 'var(--c-lime)', top: -120, left: -160 }} />
      <div className="blob" style={{ width: 460, height: 460, background: 'var(--c-peach)', bottom: -80, right: -100 }} />

      <div className="container hero__grid">
        <motion.div className="hero__content" style={{ y: contentY, opacity: contentOpacity }}>
          <motion.span
            className="eyebrow clay clay--lime hero__eyebrow"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={ready ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
          >
            <img src={icons.party} alt="" /> Агентство детских праздников
          </motion.span>

          <h1 className="hero__title" aria-label={hero.title.join(' ')}>
            {hero.title.map((w, i) => (
              <span className="hero__line" key={w} aria-hidden>
                <motion.span
                  style={{ color: wordColors[i] }}
                  initial={{ y: '115%', rotate: 10 }}
                  animate={ready ? { y: '0%', rotate: 0 } : {}}
                  transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.2 + i * 0.1 }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {hero.subtitle} Аниматоры, шоу, мастер-классы и праздники под ключ.
          </motion.p>

          <motion.div
            className="hero__cta"
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <ClayButton onClick={() => scrollToId('contacts')}>
              <Sparkles size={18} /> Оставить заявку
            </ClayButton>
            <ClayButton variant="white" onClick={() => scrollToId('programs')}>
              Смотреть тарифы
            </ClayButton>
          </motion.div>

          <motion.ul
            className="hero__chips"
            initial="hidden"
            animate={ready ? 'show' : 'hidden'}
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 1 } } }}
          >
            {hero.chips.map((c) => (
              <motion.li
                key={c.text}
                className="clay hero__chip"
                variants={{ hidden: { opacity: 0, scale: 0.6, y: 20 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 16 } } }}
                whileHover={{ y: -6, rotate: -2 }}
              >
                <img src={c.icon} alt="" />
                {c.text}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div className="hero__visual" style={{ scale: visualScale, rotate: visualRotate }}>
          <motion.div
            className="hero__blob"
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={ready ? { scale: 1, opacity: 1, rotate: 0 } : {}}
            transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.3 }}
          >
            <motion.div
              className="hero__blob-shape"
              animate={{
                borderRadius: [
                  '58% 42% 48% 52% / 46% 54% 46% 54%',
                  '42% 58% 60% 40% / 56% 40% 60% 44%',
                  '50% 50% 38% 62% / 40% 62% 38% 60%',
                  '58% 42% 48% 52% / 46% 54% 46% 54%',
                ],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={slide}
                  src={hero.photos[slide]}
                  alt="Праздник от агентства Хамелеон"
                  initial={{ opacity: 0, scale: 1.25, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, scale: 1.05, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {ready && (
            <>
              <Float src={icons.chameleon} size="clamp(110px, 14vw, 190px)" className="hero__mascot" style={{ left: '-8%', bottom: '2%' }} mx={mx} my={my} depth={-40} delay={0.9} rotate={-6} />
              <Float src={icons.balloon} size="clamp(70px, 8vw, 120px)" style={{ right: '-4%', top: '-4%' }} mx={mx} my={my} depth={50} delay={1} duration={5} />
              <Float src={icons.cake} size="clamp(64px, 7vw, 104px)" style={{ right: '-6%', bottom: '12%' }} mx={mx} my={my} depth={30} delay={1.15} duration={7} />
              <Float src={icons.sparkles} size="clamp(48px, 5vw, 76px)" style={{ left: '6%', top: '2%' }} mx={mx} my={my} depth={-25} delay={1.3} duration={4.5} />
              <Float src={icons.gift} size="clamp(54px, 6vw, 88px)" style={{ left: '38%', bottom: '-6%' }} mx={mx} my={my} depth={60} delay={1.4} duration={6.5} />
            </>
          )}

          <div className="hero__dots" role="tablist" aria-label="Фото">
            {hero.photos.map((_, i) => (
              <button key={i} role="tab" aria-selected={slide === i} aria-label={`Фото ${i + 1}`} onClick={() => setSlide(i)}>
                {slide === i && <motion.span layoutId="hero-dot" className="hero__dot-active" />}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.button
        className="hero__scroll icon-btn"
        onClick={() => scrollToId('about')}
        aria-label="Листать вниз"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      >
        <ArrowDown size={22} />
      </motion.button>
    </section>
  )
}
