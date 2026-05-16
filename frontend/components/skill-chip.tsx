'use client'

import { motion } from 'framer-motion'

interface SkillChipProps {
  label: string
  variant: 'mint' | 'coral' | 'neutral'
}

const variantStyles = {
  mint: 'bg-[rgba(0,200,150,0.15)] border-[#00C896] text-[#00C896]',
  coral: 'bg-[rgba(255,77,46,0.15)] border-[#FF4D2E] text-[#FF4D2E]',
  neutral: 'bg-[rgba(15,15,15,0.05)] border-[rgba(15,15,15,0.15)] text-[#6B6560]',
}

export function SkillChip({ label, variant }: SkillChipProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium border ${variantStyles[variant]}`}
    >
      {label}
    </motion.span>
  )
}
