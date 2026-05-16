'use client'

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { HeroCard } from './hero-card'
import { easeOut } from '@/components/motion/landing-motion'

const headlineLines = [
  'Hire Smarter.',
  'Screen Faster.',
  'Never Miss',
  'The Right Fit.',
]

function HeroBackground() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-[#C8F135]/25 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.55, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -left-32 h-[320px] w-[320px] rounded-full bg-[#0057FF]/10 blur-3xl"
        animate={{ scale: [1, 1.12, 1], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 h-[200px] w-[200px] rounded-full bg-[#00C896]/15 blur-2xl"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.45], [0, -48])
  const cardScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.6])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen pt-16 pb-12 flex items-center bg-[#F5F0E8] overflow-hidden"
    >
      <HeroBackground />
      <motion.div
        className="relative z-10 max-w-[1200px] mx-auto px-6 w-full"
        style={
          reduced
            ? undefined
            : { opacity: contentOpacity, y: contentY }
        }
      >
        <motion.div
          className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.15 },
            },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F0F0F] rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-[#C8F135] rounded-full animate-pulse" />
              <span className="font-body font-semibold text-[11px] uppercase tracking-wide text-[#F5F0E8]">
                AI-Powered Hiring
              </span>
            </motion.div>

            <h1 className="mb-4 overflow-hidden">
              {headlineLines.map((line, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 48 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{
                    duration: 0.6,
                    ease: easeOut,
                  }}
                  className="block font-display font-black text-[#0F0F0F] text-5xl sm:text-6xl lg:text-[72px] leading-[1.0]"
                >
                  {i === 3 ? (
                    <>
                      The <span className="text-[#C8F135]">Right Fit.</span>
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="font-body text-[#6B6560] text-lg max-w-[460px] mb-6 leading-relaxed"
            >
              Create smart job pages, share one link. MiniMax AI screens, scores,
              and summarizes every applicant — so you see the best fits first.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="flex flex-wrap gap-4"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-[#C8F135] text-[#0F0F0F] font-display font-semibold text-base rounded-full transition-shadow hover:shadow-[0_8px_32px_rgba(200,241,53,0.5)]"
                >
                  Start Hiring Free →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-[#0F0F0F] font-display font-semibold text-base rounded-full border border-[rgba(15,15,15,0.15)] transition-all hover:border-[rgba(15,15,15,0.3)]"
                >
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, x: 40 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="flex justify-center lg:justify-end"
            style={
              reduced
                ? undefined
                : { scale: cardScale, opacity: cardOpacity }
            }
          >
            <HeroCard />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
