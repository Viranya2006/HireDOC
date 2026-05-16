'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { easeOut } from '@/components/motion/landing-motion'

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <footer ref={ref} className="bg-[#0F0F0F] py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: easeOut }}
        className="max-w-[1200px] mx-auto px-6"
      >
        <motion.div
          className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(200,241,53,0.35)] to-transparent mb-8"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.7, ease: easeOut }}
        />

        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-6"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="flex items-center gap-2"
          >
            <motion.div
              className="w-5 h-5 bg-[#C8F135] rounded-sm"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.25 }}
            />
            <span className="font-display font-bold text-[#F5F0E8] text-base">HireDoc AI</span>
            <span className="font-body text-sm text-[rgba(245,240,232,0.5)] ml-2">© 2025</span>
          </motion.div>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="font-body text-sm text-[rgba(245,240,232,0.6)]"
          >
            Built with MiniMax AI
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="flex items-center gap-6"
          >
            {['Privacy', 'Terms', 'Contact'].map((label) => (
              <motion.div key={label} whileHover={{ y: -2 }}>
                <Link
                  href="/login"
                  className="font-body text-sm text-[rgba(245,240,232,0.6)] hover:text-[#F5F0E8] transition-colors"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
