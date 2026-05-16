'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, MouseEvent } from 'react'
import { ScoreRing } from './score-ring'
import { SkillChip } from './skill-chip'

export function HeroCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return
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
      initial={{ opacity: 0, x: 40 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        y: [0, -6, 0],
      }}
      transition={{
        opacity: { duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] },
        x: { duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '800px',
      }}
      className="w-full max-w-[420px] lg:max-w-[400px] xl:max-w-[440px] bg-white rounded-[20px] shadow-[0_8px_40px_rgba(15,15,15,0.10)] border border-[rgba(15,15,15,0.06)] p-5 lg:p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#0F0F0F] flex items-center justify-center">
          <span className="text-[#F5F0E8] font-display font-bold text-sm">AK</span>
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-[#0F0F0F] text-base">Alex Kim</h3>
          <p className="font-body text-[#6B6560] text-sm">Frontend Engineer</p>
        </div>
        <span className="font-data text-xs text-[#6B6560]">Applied 2h ago</span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[rgba(15,15,15,0.08)]">
        <ScoreRing score={87} size={64} />
        <div>
          <p className="font-body text-[#6B6560] text-sm">Fit Score</p>
          <p className="font-data font-bold text-[#0F0F0F] text-base">87/100 Match</p>
        </div>
      </div>

      {/* Matching Skills */}
      <div className="mb-3">
        <p className="font-body font-semibold text-[11px] uppercase tracking-wide text-[#00C896] mb-2 flex items-center gap-1">
          <span>✓</span> Matching Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {matchingSkills.map((skill, i) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.3 }}
            >
              <SkillChip label={skill} variant="mint" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gaps */}
      <div className="mb-3">
        <p className="font-body font-semibold text-[11px] uppercase tracking-wide text-[#FF4D2E] mb-2 flex items-center gap-1">
          <span>⚠</span> Gaps
        </p>
        <div className="flex flex-wrap gap-2">
          {gapSkills.map((skill, i) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 + i * 0.1, duration: 0.3 }}
            >
              <SkillChip label={skill} variant="coral" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="font-body text-sm text-[#6B6560] italic leading-relaxed"
      >
        &ldquo;Strong frontend match. Missing backend depth but high overall alignment with the role.&rdquo;
      </motion.p>
    </motion.div>
  )
}
