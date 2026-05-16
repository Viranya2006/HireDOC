'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { HeroCard } from './hero-card'
import { ROUTES } from '@/lib/constants/routes'

const headlineLines = ['Hire Smarter.', 'Screen Faster.']

export function Hero() {
  return (
    <section className="h-[calc(100dvh-4rem)] max-h-[920px] flex items-center overflow-hidden bg-[#F5F0E8]">
      <div className="max-w-[1200px] mx-auto px-6 w-full py-6 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-5 lg:gap-6 xl:gap-8 items-center">
          {/* Left Column */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F0F0F] rounded-full mb-4"
            >
              <span className="w-2 h-2 bg-[#C8F135] rounded-full animate-pulse" />
              <span className="font-body font-semibold text-[11px] uppercase tracking-wide text-[#F5F0E8]">
                AI-Powered Hiring
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="mb-3">
              {headlineLines.map((line, i) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.4 + i * 0.09,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="block font-display font-black text-[#0F0F0F] text-4xl sm:text-5xl lg:text-[52px] xl:text-[58px] leading-[1.05]"
                >
                  {line}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: 0.58,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="block font-display font-black text-[#0F0F0F] text-4xl sm:text-5xl lg:text-[52px] xl:text-[58px] leading-[1.05]"
              >
                Never Miss{' '}
                <span className="text-[#C8F135]">The Right Fit.</span>
              </motion.span>
            </h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-[#6B6560] text-base lg:text-lg max-w-[460px] mb-5 leading-relaxed"
            >
              Create smart job pages, share one link. MiniMax AI screens, scores, and summarizes every applicant — so you see the best fits first.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href={ROUTES.jobs}
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#C8F135] text-[#0F0F0F] font-display font-semibold text-sm lg:text-base rounded-full transition-shadow hover:shadow-[0_8px_32px_rgba(200,241,53,0.5)]"
                >
                  Start Hiring Free →
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#0F0F0F] font-display font-semibold text-sm lg:text-base rounded-full border border-[rgba(15,15,15,0.15)] transition-all hover:border-[rgba(15,15,15,0.3)]"
                >
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="flex justify-center lg:justify-end">
            <HeroCard />
          </div>
        </div>
      </div>
    </section>
  )
}
