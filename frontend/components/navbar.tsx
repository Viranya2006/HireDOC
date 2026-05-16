'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/logo'

const navLinks = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'For Recruiters', href: '#cta' },
]

export function Navbar() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#F5F0E8] border-b border-[rgba(15,15,15,0.10)]"
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo size="sm" priority />
          <span className="font-display font-bold text-[#0F0F0F] text-lg">HireDoc AI</span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
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
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              />
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#C8F135] text-[#0F0F0F] font-display font-semibold text-sm rounded-full transition-shadow hover:shadow-[0_8px_32px_rgba(200,241,53,0.5)]"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </motion.nav>
  )
}
