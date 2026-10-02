import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { contacts, icons, nav } from '../data'
import { lockScroll, scrollToId } from '../lib/scroll'
import { ClayButton } from './ui/ClayButton'
import './Header.css'

export function Header() {
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  const [hidden, setHidden] = useState(false)
  const [compact, setCompact] = useState(false)
  const [active, setActive] = useState<string>('')
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 400 && !open)
    setCompact(y > 40)
  })

  // подсветка активного пункта меню: секция, пересекающая середину экрана
  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight / 2
      const hit = nav.find((n) => {
        const r = document.getElementById(n.id)?.getBoundingClientRect()
        return r && r.top <= mid && r.bottom > mid
      })
      setActive(hit?.id ?? '')
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => lockScroll(open), [open])

  const go = (id: string) => {
    setOpen(false)
    setTimeout(() => scrollToId(id), open ? 350 : 0)
  }

  return (
    <>
      <motion.div className="progress" style={{ scaleX: progress }} />
      <motion.header
        className={`header ${compact ? 'header--compact' : ''}`}
        animate={{ y: hidden ? '-140%' : '0%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      >
        <div className="header__bar clay">
          <a
            href="#top"
            className="header__logo"
            onClick={(e) => {
              e.preventDefault()
              go('top')
            }}
            aria-label="Хамелеон — наверх"
          >
            <span className="header__logo-badge">
              <img src={`${import.meta.env.BASE_URL}img/logo.svg`} alt="Chameleon" />
            </span>
          </a>

          <nav className="header__nav" aria-label="Основное меню">
            {nav.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={active === n.id ? 'is-active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  go(n.id)
                }}
              >
                {active === n.id && <motion.span layoutId="nav-pill" className="header__pill" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                <span className="header__label">{n.label}</span>
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <a className="header__phone" href={contacts.phoneHref}>
              <Phone size={18} strokeWidth={2.6} />
              <span>{contacts.phone}</span>
            </a>
            <ClayButton size="sm" onClick={() => go('contacts')} className="header__cta">
              Оставить заявку
            </ClayButton>
            <motion.button className="icon-btn header__burger" onClick={() => setOpen((o) => !o)} whileTap={{ scale: 0.85 }} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={open ? 'x' : 'm'} initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }} style={{ display: 'grid' }}>
                  {open ? <X size={24} /> : <Menu size={24} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 46px) 46px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 46px) 46px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 46px) 46px)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.img src={icons.chameleon} alt="" className="mobile-menu__mascot" animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 4 }} />
            <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}>
              {nav.map((n, i) => (
                <motion.li key={n.id} variants={{ hidden: { opacity: 0, x: 60, rotate: 6 }, show: { opacity: 1, x: 0, rotate: 0, transition: { type: 'spring', stiffness: 220, damping: 18 } } }}>
                  <button onClick={() => go(n.id)}>
                    <span className="mobile-menu__num">0{i + 1}</span>
                    {n.label}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div className="mobile-menu__foot" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}>
              <ClayButton href={contacts.phoneHref} variant="white">
                <Phone size={18} /> {contacts.phone}
              </ClayButton>
              <ClayButton href={contacts.whatsappHref} variant="lime">
                WhatsApp
              </ClayButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
