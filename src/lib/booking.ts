export type BookingPrefill = { program: string; duration?: string }

const EVENT = 'chameleon:prefill'

export function requestBooking(detail: BookingPrefill) {
  window.dispatchEvent(new CustomEvent<BookingPrefill>(EVENT, { detail }))
}

export function onBookingRequest(cb: (d: BookingPrefill) => void) {
  const h = (e: Event) => cb((e as CustomEvent<BookingPrefill>).detail)
  window.addEventListener(EVENT, h)
  return () => window.removeEventListener(EVENT, h)
}
