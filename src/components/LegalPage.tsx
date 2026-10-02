import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import { icons } from '../data'
import { legalPages } from '../legal'
import { goHome } from '../lib/route'
import { ClayButton } from './ui/ClayButton'
import './LegalPage.css'

export function LegalPage({ slug }: { slug: string }) {
  const page = legalPages[slug]
  const other = slug === 'politika' ? 'soglasie' : 'politika'
  return (
    <div className="legal">
      <div className="blob" style={{ width: 460, height: 460, background: 'var(--c-lime)', top: -120, right: -140 }} />
      <div className="container legal__inner">
        <motion.div className="legal__top" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ClayButton variant="white" size="sm" onClick={goHome}>
            <ArrowLeft size={16} /> На главную
          </ClayButton>
          <img src={`${import.meta.env.BASE_URL}img/logo.svg`} alt="Chameleon" className="legal__logo" />
        </motion.div>

        <motion.article
          className="legal__card clay"
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
        >
          <div className="legal__head">
            <motion.img src={icons.check} alt="" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.5 }} />
            <h1>{page.title}</h1>
          </div>
          {page.blocks.map((b, i) =>
            b.t === 'h' ? (
              <h2 key={i}>{b.text}</h2>
            ) : b.t === 'list' ? (
              <ul key={i}>
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            ) : (
              <p key={i}>{b.text}</p>
            ),
          )}
        </motion.article>

        <div className="legal__foot">
          <a href={`#/${other}`} className="legal__other clay clay--lime">
            <FileText size={18} /> {legalPages[other].title}
          </a>
        </div>
      </div>
    </div>
  )
}
