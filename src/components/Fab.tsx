import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { MessageCircle, Phone, X } from 'lucide-react'
import { useState } from 'react'
import { contacts } from '../data'
import './Fab.css'

/** Плавающая кнопка связи — появляется после первого экрана */
export function Fab() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  const [open, setOpen] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > window.innerHeight * 0.8))

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fab" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
          <AnimatePresence>
            {open && (
              <motion.div className="fab__menu" initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: 0.06 } }, hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } } }}>
                {[
                  { href: contacts.whatsappHref, label: 'WhatsApp', icon: <MessageCircle size={20} />, cls: 'fab__item--wa' },
                  { href: contacts.phoneHref, label: 'Позвонить', icon: <Phone size={20} />, cls: 'fab__item--call' },
                ].map((it) => (
                  <motion.a
                    key={it.label}
                    href={it.href}
                    target={it.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={`fab__item ${it.cls}`}
                    variants={{ hidden: { opacity: 0, y: 20, scale: 0.6 }, show: { opacity: 1, y: 0, scale: 1 } }}
                    whileHover={{ x: -6 }}
                  >
                    {it.icon} {it.label}
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button className="fab__btn" onClick={() => setOpen((o) => !o)} whileTap={{ scale: 0.85 }} aria-label={open ? 'Закрыть' : 'Связаться с нами'} aria-expanded={open}>
            {!open && <span className="fab__pulse" />}
            <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ display: 'grid' }}>
              {open ? <X size={26} /> : <Phone size={26} />}
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
