import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

// Initialize Lenis smooth scroll
const lenis = new Lenis({
  lerp: 0.1,
  smooth: true,
  direction: 'vertical',
})

// Sync GSAP ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update)

// Add to requestAnimationFrame
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

// Prevent FOUC and reset scroll position
gsap.ticker.lagSmoothing(0)

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

// Optional: Add resize listener
window.addEventListener('resize', () => {
  lenis.resize()
  ScrollTrigger.refresh()
})