'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

import { ROUTES } from '@/lib/constants/routes'

export function CTABanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="cta" ref={ref} className="py-20 lg:py-28 bg-[#C8F135]">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-black text-3xl sm:text-4xl lg:text-[56px] text-[#0F0F0F] leading-tight mb-6 text-balance"
        >
          Ready to hire without the chaos?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-lg text-[#0F0F0F]/80 max-w-[540px] mx-auto mb-8"
        >
          Post a job, let MiniMax screen. Make your first shortlist today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <Link
              href={ROUTES.jobs}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#0F0F0F] text-[#C8F135] font-display font-semibold text-lg rounded-full transition-all hover:bg-[#1a1a1a]"
            >
              Start Hiring Free →
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-sm text-[#0F0F0F]/60 mt-6"
        >
          No credit card required · Free to start · Powered by MiniMax
        </motion.p>
      </div>
    </section>
  )
}
