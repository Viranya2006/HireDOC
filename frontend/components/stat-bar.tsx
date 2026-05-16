'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const stats = [
  { value: 73, suffix: '%', label: 'of recruiters say CV screening is their biggest time drain' },
  { value: 8, suffix: ' min', label: 'spent reading one CV manually on average' },
  { value: 3, suffix: 'x faster', label: 'hiring decisions with AI-assisted screening' },
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let start = 0
    const duration = 1500
    const increment = target / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span ref={ref} className="font-data font-bold text-4xl sm:text-5xl lg:text-[56px] text-[#C8F135]">
      {count}{suffix}
    </span>
  )
}

export function StatBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="bg-[#0F0F0F] py-12 lg:py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-[rgba(245,240,232,0.15)]">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center px-4 lg:px-8"
            >
              <CountUp target={stat.value} suffix={stat.suffix} />
              <p className="font-body text-sm text-[rgba(245,240,232,0.6)] mt-2 max-w-[280px] mx-auto leading-relaxed">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
