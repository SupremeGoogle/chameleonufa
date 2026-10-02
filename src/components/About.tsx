import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { about, icons } from '../data'
import { Reveal } from './ui/Reveal'
import { popItem, stagger } from './ui/variants'
import { SplitTitle } from './ui/SplitTitle'
import './About.css'

const fan = [
  { rotate: -9, y: 40, from: -18 },
  { rotate: 3, y: -10, from: 14 },
  { rotate: 11, y: 50, from: -10 },
]

function FanPhoto({ src, i, progress }: { src: string; i: number; progress: MotionValue<number> }) {
  const f = fan[i]
  const rotate = useTransform(progress, [0, 1], [f.from, f.rotate])
  const y = useTransform(progress, [0, 1], [f.y + 120, f.y])
  return (
    <motion.figure className="about__photo clay" style={{ rotate, y, zIndex: i === 1 ? 2 : 1 }} whileHover={{ rotate: 0, scale: 1.06, zIndex: 5, transition: { type: 'spring', stiffness: 300, damping: 16 } }}>
      <img src={src} alt="Детский праздник Хамелеон" loading="lazy" />
    </motion.figure>
  )
}

export function About() {
  const fanRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: fanRef, offset: ['start end', 'center center'] })

  const teamRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: teamProgress } = useScroll({ target: teamRef, offset: ['start end', 'center center'] })
  const clip = useTransform(teamProgress, [0, 1], ['inset(18% 22% 18% 22% round 60px)', 'inset(0% 0% 0% 0% round 40px)'])
  const imgScale = useTransform(teamProgress, [0, 1], [1.35, 1])

  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="about__head">
          <Reveal>
            <span className="eyebrow clay clay--peach">
              <img src={icons.heart} alt="" /> О нас
            </span>
          </Reveal>
          <SplitTitle className="section-title" text="Сотни историй, где ребёнок — главный герой" />
          <Reveal delay={0.15}>
            <p className="lead">{about.text}</p>
          </Reveal>
        </div>

        <div className="about__fan" ref={fanRef}>
          {about.photos.map((p, i) => (
            <FanPhoto key={p} src={p} i={i} progress={scrollYProgress} />
          ))}
        </div>

        <div className="about__team">
          <div className="about__team-text">
            <SplitTitle className="about__team-title" text={about.team.title} />
            <motion.ul className="about__points" variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-15% 0px' }}>
              {about.team.points.map((p) => (
                <motion.li key={p.text} className="clay about__point" variants={popItem} whileHover={{ x: 8 }}>
                  <img src={p.icon} alt="" loading="lazy" />
                  <span>{p.text}</span>
                </motion.li>
              ))}
            </motion.ul>
            <Reveal delay={0.2}>
              <p className="about__outro">{about.team.outro}</p>
            </Reveal>
          </div>

          <div className="about__team-visual" ref={teamRef}>
            <motion.div className="about__team-frame" style={{ clipPath: clip }}>
              <motion.img src={about.team.photo} alt="Команда агентства Хамелеон" loading="lazy" style={{ scale: imgScale }} />
            </motion.div>
            <motion.div
              className="about__badge clay clay--butter"
              initial={{ scale: 0, rotate: -30 }}
              whileInView={{ scale: 1, rotate: -8 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
            >
              <img src={icons.star} alt="" />
              <span>
                Праздник
                <br />
                под ключ
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
