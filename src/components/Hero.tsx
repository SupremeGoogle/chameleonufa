import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'
import { useEffect, useRef, type PointerEvent } from 'react'
import { hero, icons } from '../data'
import { scrollToId } from '../lib/scroll'
import { ClayButton } from './ui/ClayButton'
import { Float } from './ui/Float'
import './Hero.css'

const wordColors = ['var(--ink)', 'var(--ink)', 'var(--lime-deep)', 'var(--orange-deep)']

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const base = import.meta.env.BASE_URL
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 })
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.82])
  const visualRotate = useTransform(scrollYProgress, [0, 1], [0, -8])

  const mascotX = useTransform(mx, (v) => v * -24)
  const mascotY = useTransform(my, (v) => v * -16)
  const mascotTilt = useTransform(mx, (v) => v * 14)

  // маскот машет только когда экран открыт и пользователь не просил меньше анимаций
  useEffect(() => {
    const v = video.current
    if (!v || !ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()))
    io.observe(v)
    return () => io.disconnect()
  }, [ready])

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
            className="hero__mascot"
            style={{ x: mascotX, y: mascotY, rotateY: mascotTilt }}
            initial={{ scale: 0.3, opacity: 0, y: 80 }}
            animate={ready ? { scale: 1, opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.35 }}
          >
            <video
              ref={video}
              className="hero__mascot-video"
              poster={`${base}video/mascot-poster.webp`}
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Маскот Хамелеон машет рукой"
            >
              <source src={`${base}video/mascot.webm`} type="video/webm" />
              <source src={`${base}video/mascot.mp4`} type="video/mp4" />
            </video>
          </motion.div>

          {ready && (
            <>
              <Float src={icons.balloon} size="clamp(64px, 7vw, 108px)" style={{ right: '0%', top: '4%' }} mx={mx} my={my} depth={50} delay={1} duration={5} />
              <Float src={icons.sparkles} size="clamp(44px, 4.6vw, 70px)" style={{ left: '4%', top: '10%' }} mx={mx} my={my} depth={-25} delay={1.2} duration={4.5} />
              <Float src={icons.confetti} size="clamp(50px, 5.4vw, 82px)" style={{ right: '2%', bottom: '14%' }} mx={mx} my={my} depth={35} delay={1.35} duration={6.5} />
            </>
          )}
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
