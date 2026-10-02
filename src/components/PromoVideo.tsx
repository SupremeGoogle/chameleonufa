import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { icons } from '../data'
import { Reveal } from './ui/Reveal'
import { SplitTitle } from './ui/SplitTitle'
import './PromoVideo.css'

/** Промо-ролик: без звука играет сам, по кнопке — со звуком с начала */
export function PromoVideo() {
  const base = import.meta.env.BASE_URL
  const section = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'center center'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1])
  const rotate = useTransform(scrollYProgress, [0, 1], [-3, 0])

  // автозапуск без звука, когда блок на экране
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const withSound = () => {
    const v = video.current
    if (!v) return
    v.muted = false
    v.currentTime = 0
    setMuted(false)
    v.play().catch(() => {})
  }

  const toggleMute = () => {
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const togglePlay = () => {
    const v = video.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const v = video.current
    if (!v || !v.duration) return
    const r = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - r.left) / r.width) * v.duration
  }

  return (
    <section ref={section} className="section promo" aria-label="Промо-ролик">
      <div className="container">
        <div className="promo__head">
          <Reveal>
            <span className="eyebrow clay clay--butter">
              <img src={icons.starstruck} alt="" /> Видео
            </span>
          </Reveal>
          <SplitTitle className="section-title" text="Хамелеон за 30 секунд" />
        </div>

        <motion.div className="promo__frame clay" style={{ scale, rotate }}>
          <video
            ref={video}
            className="promo__video"
            poster={`${base}video/promo-poster.webp`}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
            onClick={togglePlay}
          >
            <source src={`${base}video/promo.mp4`} type="video/mp4" />
          </video>

          <AnimatePresence>
            {muted && (
              <motion.button
                className="promo__sound btn"
                onClick={withSound}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scaleX: 1.1, scaleY: 0.88 }}
                transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              >
                <span className="promo__pulse" />
                <Volume2 size={20} /> Смотреть со звуком
              </motion.button>
            )}
          </AnimatePresence>

          <div className="promo__bar">
            <button className="promo__ctl" onClick={togglePlay} aria-label={playing ? 'Пауза' : 'Воспроизвести'}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="promo__track" onClick={seek} role="slider" aria-label="Перемотка" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              <span style={{ width: `${progress * 100}%` }} />
            </div>
            <button className="promo__ctl" onClick={toggleMute} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
