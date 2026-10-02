import { motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { contacts, icons, nav } from '../data'
import { scrollToId } from '../lib/scroll'
import './Footer.css'

const letters = 'Хамелеон'.split('')

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__card clay clay--lime">
          <div className="footer__top">
            <div className="footer__brand">
              <img src={`${import.meta.env.BASE_URL}img/logo.svg`} alt="Chameleon" className="footer__logo" />
              <p>Детские праздники в Уфе и Башкирии. Аниматоры, шоу и мастер-классы — праздники под ключ.</p>
            </div>
            <nav className="footer__nav" aria-label="Навигация в подвале">
              {nav.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToId(n.id)
                  }}
                >
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="footer__contacts">
              <a href={contacts.phoneHref}>{contacts.phone}</a>
              <a href={contacts.whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp {contacts.whatsapp}
              </a>
              <a href={contacts.vk} target="_blank" rel="noopener noreferrer">
                ВКонтакте
              </a>
              <span>{contacts.address}</span>
            </div>
          </div>

          <motion.div className="footer__word" initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.05 } } }} aria-hidden>
            {letters.map((l, i) => (
              <motion.span
                key={i}
                variants={{ hidden: { y: '100%', rotate: 20 }, show: { y: '0%', rotate: 0, transition: { type: 'spring', stiffness: 160, damping: 14 } } }}
                whileHover={{ y: -20, rotate: i % 2 ? 8 : -8, color: '#ff955f' }}
              >
                {l}
              </motion.span>
            ))}
            <motion.img src={icons.chameleon} alt="" className="footer__mascot" whileHover={{ scale: 1.2, rotate: 20 }} />
          </motion.div>

          <div className="footer__bottom">
            <span>© Хамелеон. Все права защищены</span>
            <a href={contacts.policy} target="_blank" rel="noopener noreferrer">
              Политика конфиденциальности
            </a>
            <a href={contacts.consent} target="_blank" rel="noopener noreferrer">
              Согласие на обработку данных
            </a>
            <motion.button className="icon-btn" onClick={() => scrollToId('top')} whileHover={{ y: -6 }} whileTap={{ scale: 0.85 }} aria-label="Наверх">
              <ArrowUp />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}
