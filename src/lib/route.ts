import { useEffect, useState } from 'react'

/** Простой hash-роутер: #/politika, #/soglasie — работает и на GitHub Pages */
export function useHashRoute() {
  const read = () => (window.location.hash.startsWith('#/') ? window.location.hash.slice(2) : '')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function goHome() {
  history.pushState(null, '', window.location.pathname + window.location.search)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}
