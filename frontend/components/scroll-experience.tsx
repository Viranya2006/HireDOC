'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

export function ScrollExperience() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  })
  const limeY = useTransform(scrollYProgress, [0, 1], ['0%', '55%'])
  const blueY = useTransform(scrollYProgress, [0, 1], ['0%', '-45%'])
  const coralY = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 z-[70] h-1 origin-left bg-[#C8F135]"
        style={{ scaleX: progress, width: '100%' }}
      />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute -left-16 top-[18vh] h-48 w-48 rounded-full bg-[#C8F135]/30 blur-3xl"
          style={{ y: limeY }}
        />
        <motion.div
          className="absolute -right-20 top-[42vh] h-56 w-56 rounded-full bg-[#0057FF]/15 blur-3xl"
          style={{ y: blueY }}
        />
        <motion.div
          className="absolute left-[45%] top-[78vh] h-44 w-44 rounded-full bg-[#FF4D2E]/15 blur-3xl"
          style={{ y: coralY }}
        />
      </div>
    </>
  )
}
