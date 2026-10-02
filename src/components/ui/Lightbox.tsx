import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect } from 'react'
import { lockScroll } from '../../lib/scroll'
import './Lightbox.css'

type Item = { src: string; alt: string }
type Props = { items: Item[]; index: number | null; onChange: (i: number | null) => void; layoutPrefix: string }

/** Полноэкранный просмотр с общим layoutId — фото «вылетает» из карточки */
export function Lightbox({ items, index, onChange, layoutPrefix }: Props) {
  const open = index !== null

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null)
      if (e.key === 'ArrowRight') onChange((index + 1) % items.length)
      if (e.key === 'ArrowLeft') onChange((index - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, items.length, onChange])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onChange(null)} role="dialog" aria-modal="true" aria-label={items[index].alt}>
          <motion.img
            key={index}
            layoutId={`${layoutPrefix}-${index}`}
            src={items[index].src}
            alt={items[index].alt}
            className="lightbox__img"
            onClick={(e) => e.stopPropagation()}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) onChange((index + 1) % items.length)
              else if (info.offset.x > 80) onChange((index - 1 + items.length) % items.length)
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          />
          <motion.p className="lightbox__caption" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} key={`c${index}`}>
            {items[index].alt}
          </motion.p>
          <button className="icon-btn lightbox__close" onClick={() => onChange(null)} aria-label="Закрыть">
            <X />
          </button>
          <button
            className="icon-btn lightbox__nav lightbox__nav--prev"
            onClick={(e) => {
              e.stopPropagation()
              onChange((index - 1 + items.length) % items.length)
            }}
            aria-label="Предыдущее фото"
          >
            <ChevronLeft />
          </button>
          <button
            className="icon-btn lightbox__nav lightbox__nav--next"
            onClick={(e) => {
              e.stopPropagation()
              onChange((index + 1) % items.length)
            }}
            aria-label="Следующее фото"
          >
            <ChevronRight />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
