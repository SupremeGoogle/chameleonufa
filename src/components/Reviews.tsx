import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Image as ImageIcon, Star } from 'lucide-react'
import { useState } from 'react'
import { icons, reviews } from '../data'
import { Lightbox } from './ui/Lightbox'
import { Reveal } from './ui/Reveal'
import { SplitTitle } from './ui/SplitTitle'
import './Reviews.css'

const items = reviews.items
const shots = items.map((r) => ({ src: r.screenshot, alt: `Отзыв: ${r.name}` }))

/** Колода отзывов: верхнюю карточку можно смахнуть — она уйдёт в конец */
export function Reviews() {
  const [order, setOrder] = useState(items.map((_, i) => i))
  const [exitX, setExitX] = useState(400)
  const [shot, setShot] = useState<number | null>(null)

  const next = (dirX = 1) => {
    setExitX(dirX * 420)
    setOrder((o) => [...o.slice(1), o[0]])
  }
  const prev = () => {
    setExitX(-420)
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)])
  }

  return (
    <section id="reviews" className="section reviews">
      <div className="container reviews__grid">
        <div className="reviews__intro">
          <Reveal>
            <span className="eyebrow clay clay--lilac">
              <img src={icons.heart} alt="" /> Отзывы
            </span>
          </Reveal>
          <SplitTitle className="section-title" text={reviews.title} />
          <Reveal delay={0.1}>
            <p className="lead">{reviews.text}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="reviews__controls">
              <motion.button className="icon-btn" whileTap={{ scale: 0.85 }} onClick={prev} aria-label="Предыдущий отзыв">
                <ArrowLeft />
              </motion.button>
              <motion.button className="icon-btn" whileTap={{ scale: 0.85 }} onClick={() => next()} aria-label="Следующий отзыв">
                <ArrowRight />
              </motion.button>
              <span className="reviews__hint">или смахни карточку</span>
            </div>
          </Reveal>
        </div>

        <div className="reviews__deck">
          <AnimatePresence initial={false} custom={exitX}>
            {order
              .slice(0, 3)
              .reverse()
              .map((idx) => {
                const pos = order.indexOf(idx)
                const r = items[idx]
                const top = pos === 0
                return (
                  <motion.article
                    key={idx}
                    className={`reviews__card clay clay--${r.color}`}
                    custom={exitX}
                    initial={{ scale: 0.8, y: 60, opacity: 0 }}
                    animate={{ scale: 1 - pos * 0.06, y: pos * 26, rotate: pos === 0 ? 0 : pos % 2 ? 4 : -4, opacity: 1, zIndex: 10 - pos }}
                    exit={{ x: exitX, rotate: exitX > 0 ? 18 : -18, opacity: 0, transition: { duration: 0.4 } }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    drag={top ? 'x' : false}
                    dragSnapToOrigin
                    dragElastic={0.8}
                    whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 110) next(Math.sign(info.offset.x))
                    }}
                    aria-hidden={!top}
                  >
                    <div className="reviews__stars" aria-label={`Оценка ${r.rating} из 5`}>
                      {Array.from({ length: r.rating }).map((_, s) => (
                        <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 + s * 0.06, type: 'spring', stiffness: 400, damping: 12 }}>
                          <Star size={22} fill="#ffb800" stroke="#e8a200" />
                        </motion.span>
                      ))}
                    </div>
                    <p className="reviews__text">«{r.text}»</p>
                    <footer>
                      <span className="reviews__avatar">{r.name[0]}</span>
                      <span>
                        <strong>{r.name}</strong>
                        <small>{r.source}</small>
                      </span>
                      <button
                        className="reviews__shot"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setShot(idx)}
                        tabIndex={top ? 0 : -1}
                        aria-label="Смотреть оригинал отзыва"
                      >
                        <motion.img layoutId={`rev-${idx}`} src={r.screenshot} alt="" />
                        <ImageIcon size={14} />
                      </button>
                    </footer>
                  </motion.article>
                )
              })}
          </AnimatePresence>
        </div>
      </div>
      <Lightbox items={shots} index={shot} onChange={setShot} layoutPrefix="rev" />
    </section>
  )
}
