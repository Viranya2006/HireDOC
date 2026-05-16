'use client'

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { useRef, type MouseEvent } from 'react'
import { ScoreRing } from './score-ring'
import { SkillChip } from './skill-chip'
import { easeOut } from '@/components/motion/landing-motion'

export function HeroCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 20,
  })

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  const matchingSkills = ['React', 'TypeScript', 'Node.js']
  const gapSkills = ['Python', 'AWS']

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: 48, rotateY: -8 }}
      animate={{
        opacity: 1,
        x: 0,
        rotateY: 0,
        y: reduced ? 0 : [0, -12, 0],
      }}
      transition={{
        opacity: { duration: 0.65, delay: 0.9, ease: easeOut },
        x: { duration: 0.65, delay: 0.9, ease: easeOut },
        rotateY: { duration: 0.65, delay: 0.9, ease: easeOut },
        y: reduced
          ? { duration: 0 }
          : { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 },
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        reduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
              perspective: '900px',
            }
      }
      className="relative w-full max-w-[460px] bg-white rounded-[20px] shadow-[0_8px_40px_rgba(15,15,15,0.10)] border border-[rgba(15,15,15,0.06)] p-6"
    >
      <motion.div
        className="absolute -inset-px rounded-[20px] bg-gradient-to-br from-[#C8F135]/20 via-transparent to-[#0057FF]/10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        aria-hidden
      />

      <motion.div
        className="absolute -top-3 -right-3 px-3 py-1 bg-[#C8F135] rounded-full font-body text-[10px] font-bold uppercase text-[#0F0F0F]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.35, ease: easeOut }}
      >
        Top Match
      </motion.div>

      <motion.div
        className="relative z-10"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08, delayChildren: 1.1 } },
        }}
      >
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="flex items-center gap-3 mb-5"
        >
          <motion.div
            className="w-10 h-10 rounded-full bg-[#0F0F0F] flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-[#F5F0E8] font-display font-bold text-sm">AK</span>
          </motion.div>
          <motion.div className="flex-1">
            <h3 className="font-display font-bold text-[#0F0F0F] text-base">Alex Kim</h3>
            <p className="font-body text-[#6B6560] text-sm">Frontend Engineer</p>
          </motion.div>
          <span className="font-data text-xs text-[#6B6560]">Applied 2h ago</span>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          className="flex items-center gap-4 mb-5 pb-5 border-b border-[rgba(15,15,15,0.08)]"
        >
          <ScoreRing score={87} />
          <motion.div>
            <p className="font-body text-[#6B6560] text-sm">Fit Score</p>
            <p className="font-data font-bold text-[#0F0F0F] text-lg">87/100 Match</p>
          </motion.div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mb-4">
          <p className="font-body font-semibold text-[11px] uppercase tracking-wide text-[#00C896] mb-2 flex items-center gap-1">
            <span>✓</span> Matching Skills
          </p>
          <motion.div
            className="flex flex-wrap gap-2"
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {matchingSkills.map((skill) => (
              <motion.div
                key={skill}
                variants={{
                  hidden: { opacity: 0, scale: 0.85 },
                  visible: { opacity: 1, scale: 1 },
                }}
              >
                <SkillChip label={skill} variant="mint" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mb-4">
          <p className="font-body font-semibold text-[11px] uppercase tracking-wide text-[#FF4D2E] mb-2 flex items-center gap-1">
            <span>⚠</span> Gaps
          </p>
          <motion.div
            className="flex flex-wrap gap-2"
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {gapSkills.map((skill) => (
              <motion.div
                key={skill}
                variants={{
                  hidden: { opacity: 0, scale: 0.85 },
                  visible: { opacity: 1, scale: 1 },
                }}
              >
                <SkillChip label={skill} variant="coral" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.p
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="font-body text-sm text-[#6B6560] italic leading-relaxed"
        >
          &ldquo;Strong frontend match. Missing backend depth but high overall alignment with the role.&rdquo;
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
