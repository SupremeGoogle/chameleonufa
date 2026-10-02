import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Expand } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { gallery, icons } from '../data'
import { Lightbox } from './ui/Lightbox'
import { SplitTitle } from './ui/SplitTitle'
import './Gallery.css'

const tilts = [-3, 2, -1.5, 3, -2.5, 1.5]

/** Горизонтальная галерея, которая едет при вертикальном скролле */
export function Gallery() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)
  const [open, setOpen] = useState<number | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 })
  const x = useTransform(smooth, [0, 1], [0, -distance])
  const bar = useTransform(smooth, [0, 1], ['0%', '100%'])

  return (
    <section ref={section} className="gallery" style={{ height: `calc(100vh + ${distance}px)` }} aria-label={gallery.title}>
      <div className="gallery__sticky">
        <div className="container gallery__head">
          <div>
            <span className="eyebrow clay clay--butter">
              <img src={icons.confetti} alt="" /> Фотоальбом
            </span>
            <SplitTitle className="section-title" text={gallery.title} />
          </div>
          <div className="gallery__progress clay-inset">
            <motion.span style={{ width: bar }} />
          </div>
        </div>

        <motion.div ref={track} className="gallery__track" style={{ x }}>
          {gallery.items.map((g, i) => (
            <motion.button
              key={g.src}
              className="gallery__card clay"
              style={{ rotate: tilts[i % tilts.length] }}
              whileHover={{ rotate: 0, y: -14, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              onClick={() => setOpen(i)}
              aria-label={`Открыть фото: ${g.alt}`}
            >
              <motion.img layoutId={`gal-${i}`} src={g.src} alt={g.alt} loading="lazy" draggable={false} />
              <span className="gallery__zoom">
                <Expand size={18} />
              </span>
              <span className="gallery__caption">{g.alt}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
      <Lightbox items={gallery.items} index={open} onChange={setOpen} layoutPrefix="gal" />
    </section>
  )
}
