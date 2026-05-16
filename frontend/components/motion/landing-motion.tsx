'use client'

import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
  type Transition,
} from 'framer-motion'
import { useRef, type ReactNode } from 'react'

export const easeOut = [0.16, 1, 0.3, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
}

export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
}

export function useMotionVariants() {
  const reduced = useReducedMotion()
  return {
    reduced: !!reduced,
    fadeUp: reduced ? fadeUpReduced : fadeUp,
    staggerItem: reduced
      ? ({ hidden: { opacity: 0 }, visible: { opacity: 1 } } as Variants)
      : staggerItem,
    transition: (delay = 0): Transition =>
      reduced
        ? { duration: 0.01 }
        : { duration: 0.55, delay, ease: easeOut },
  }
}

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  amount?: number
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.2,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount })
  const { reduced, fadeUp: variants } = useMotionVariants()

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={
        reduced ? { duration: 0.01 } : { duration: 0.55, delay, ease: easeOut }
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}
