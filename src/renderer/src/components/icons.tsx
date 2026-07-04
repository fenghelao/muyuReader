import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

// Project mark placeholder.
export function Sparkle(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
      <path d="M12 2.6l2.3 5.9 5.9 2.3-5.9 2.3L12 19l-2.3-5.9L3.8 10.8l5.9-2.3z" />
    </svg>
  )
}
export function Plus(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
export function SearchIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  )
}
export function Chevron(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
export function SendArrow(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}
export function Share(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v13" />
    </svg>
  )
}
export function Star(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z" />
    </svg>
  )
}
export function Dots(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </svg>
  )
}
