'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { staggerContainer, staggerItem } from '@/components/motion/landing-motion'

export function CTABanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="cta" ref={ref} className="relative py-20 lg:py-28 bg-[#C8F135] overflow-hidden">
      <motion.div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
      >
        <motion.div
          className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/20 blur-2xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-[#0F0F0F]/5 blur-2xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        className="max-w-[1200px] mx-auto px-6 text-center relative z-10"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
      >
        <motion.h2
          variants={staggerItem}
          className="font-display font-black text-3xl sm:text-4xl lg:text-[56px] text-[#0F0F0F] leading-tight mb-6 text-balance"
        >
          Ready to hire without the chaos?
        </motion.h2>

        <motion.p
          variants={staggerItem}
          className="font-body text-lg text-[#0F0F0F]/80 max-w-[540px] mx-auto mb-8"
        >
          Post a job, let MiniMax screen. Make your first shortlist today.
        </motion.p>

        <motion.div variants={staggerItem}>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#0F0F0F] text-[#C8F135] font-display font-semibold text-lg rounded-full transition-all hover:bg-[#1a1a1a] hover:shadow-[0_12px_40px_rgba(15,15,15,0.25)]"
            >
              Start Hiring Free →
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          variants={staggerItem}
          className="font-body text-sm text-[#0F0F0F]/60 mt-6"
        >
          No credit card required · Free to start · Powered by MiniMax
        </motion.p>
      </motion.div>
    </section>
  )
}
