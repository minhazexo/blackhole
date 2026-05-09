import { useRef, useEffect } from 'react'

export function useScroll() {
  const scroll = useRef({ current: 0, target: 0 })

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight
      scroll.current.target = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    // Smooth interpolation loop
    let rafId
    const updateScroll = () => {
      scroll.current.current += (scroll.current.target - scroll.current.current) * 0.1
      rafId = requestAnimationFrame(updateScroll)
    }
    rafId = requestAnimationFrame(updateScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return scroll
}
