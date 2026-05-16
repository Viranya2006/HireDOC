'use client'

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { easeOut } from '@/components/motion/landing-motion'

const navLinks = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'For Recruiters', href: '#cta' },
]

export function Navbar() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const lastY = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = lastY.current
    lastY.current = y
    setScrolled(y > 24)
    if (y < 80) {
      setHidden(false)
      return
    }
    setHidden(y > prev && y > 120)
  })

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{
          y: hidden ? -72 : 0,
          opacity: 1,
        }}
        transition={{ duration: 0.35, ease: easeOut }}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
          scrolled
            ? 'bg-[#F5F0E8]/90 backdrop-blur-md border-[rgba(15,15,15,0.12)] shadow-[0_4px_24px_rgba(15,15,15,0.06)]'
            : 'bg-[#F5F0E8] border-[rgba(15,15,15,0.10)]'
        }`}
      >
        <motion.div
          className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between"
          animate={{ height: scrolled ? 56 : 64 }}
          transition={{ duration: 0.25, ease: easeOut }}
        >
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="w-6 h-6 bg-[#C8F135] rounded-sm"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            />
            <span className="font-display font-bold text-[#0F0F0F] text-lg">HireDoc AI</span>
          </Link>

          <motion.div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-body font-medium text-[#0F0F0F] text-sm transition-colors hover:text-[#0057FF]"
                onMouseEnter={() => setHoveredLink(link.href)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {link.label}
                <motion.span
                  className="absolute -bottom-1 left-0 h-[2px] bg-[#0057FF]"
                  initial={{ width: 0 }}
                  animate={{ width: hoveredLink === link.href ? '100%' : 0 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                />
              </Link>
            ))}
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#C8F135] text-[#0F0F0F] font-display font-semibold text-sm rounded-full transition-shadow hover:shadow-[0_8px_32px_rgba(200,241,53,0.5)]"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </motion.nav>
    </AnimatePresence>
  )
}
