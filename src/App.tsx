import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { About } from './components/About'
import { Addons } from './components/Addons'
import { Contacts } from './components/Contacts'
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
import { PromoVideo } from './components/PromoVideo'
import { Reviews } from './components/Reviews'
import { Safety } from './components/Safety'
import { LegalPage } from './components/LegalPage'
import { useHashRoute } from './lib/route'
import { initLenis, lockScroll, scrollTop } from './lib/scroll'
import { legalPages } from './legal'

// переход между главной и страницами документов: «шторка» снизу вверх
const pageTransition = {
  initial: { opacity: 0, y: 60, clipPath: 'inset(100% 0% 0% 0% round 40px)' },
  animate: { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 0px)', transitionEnd: { clipPath: 'none' }, transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] as const } },
  exit: { opacity: 0, y: -40, scale: 0.97, transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] as const } },
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const done = useCallback(() => setLoading(false), [])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    return initLenis() ?? undefined
  }, [])

  useEffect(() => lockScroll(loading), [loading])

  const route = useHashRoute()
  const legal = route in legalPages ? route : null

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Preloader key="pre" onDone={done} />}</AnimatePresence>
      <AnimatePresence mode="wait" onExitComplete={scrollTop}>
        {legal ? (
          <motion.div key={legal} {...pageTransition}>
            <LegalPage slug={legal} />
          </motion.div>
        ) : (
          <motion.div key="home" {...pageTransition}>
            <Header />
            <main>
              <Hero ready={!loading} />
              <Marquee />
              <About />
              <PromoVideo />
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
          </motion.div>
        )}
      </AnimatePresence>
      <Fab />
    </MotionConfig>
  )
}
