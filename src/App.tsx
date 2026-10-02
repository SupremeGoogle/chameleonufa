import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { About } from './components/About'
import { Addons } from './components/Addons'
import { Contacts } from './components/Contacts'
import { Cursor } from './components/Cursor'
import { Fab } from './components/Fab'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Formats } from './components/Formats'
import { Gallery } from './components/Gallery'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Preloader } from './components/Preloader'
import { Programs } from './components/Programs'
import { Reviews } from './components/Reviews'
import { Safety } from './components/Safety'
import { initLenis, lockScroll } from './lib/scroll'

export default function App() {
  const [loading, setLoading] = useState(true)
  const done = useCallback(() => setLoading(false), [])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    return initLenis() ?? undefined
  }, [])

  useEffect(() => lockScroll(loading), [loading])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Preloader key="pre" onDone={done} />}</AnimatePresence>
      <Cursor />
      <Header />
      <main>
        <Hero ready={!loading} />
        <Marquee />
        <About />
        <Formats />
        <Gallery />
        <Programs />
        <Addons />
        <Safety />
        <Reviews />
        <Faq />
        <Contacts />
      </main>
      <Footer />
      <Fab />
    </MotionConfig>
  )
}
