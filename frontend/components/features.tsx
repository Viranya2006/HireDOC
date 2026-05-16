'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    title: 'JD Understanding',
    description: 'AI extracts must-haves, nice-to-haves, and role expectations from any job description.',
    borderColor: '#C8F135',
    iconBg: 'rgba(200, 241, 53, 0.1)',
    iconColor: '#9AC020',
    textColor: '#0F0F0F',
    mutedTextColor: 'rgba(15, 15, 15, 0.72)',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Question Generator',
    description: 'Smart screening questions crafted from your JD — technical, behavioral, and situational.',
    borderColor: '#0057FF',
    iconBg: 'rgba(0, 87, 255, 0.1)',
    iconColor: '#0057FF',
    textColor: '#FFFFFF',
    mutedTextColor: 'rgba(255, 255, 255, 0.78)',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'CV + Answer Analysis',
    description: 'Every CV and response parsed, compared to requirements, and scored for relevance.',
    borderColor: '#FF4D2E',
    iconBg: 'rgba(255, 77, 46, 0.1)',
    iconColor: '#FF4D2E',
    textColor: '#FFFFFF',
    mutedTextColor: 'rgba(255, 255, 255, 0.78)',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Fit Score Ranking',
    description: 'Candidates ranked by fit. See who matches best at a glance — no more guessing.',
    borderColor: '#00C896',
    iconBg: 'rgba(0, 200, 150, 0.1)',
    iconColor: '#00C896',
    textColor: '#0F0F0F',
    mutedTextColor: 'rgba(15, 15, 15, 0.72)',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'Recruiter Hiring Brief',
    description: 'A one-page AI summary per candidate: strengths, gaps, red flags, and hiring recommendation.',
    borderColor: '#C8F135',
    iconBg: 'rgba(200, 241, 53, 0.1)',
    iconColor: '#9AC020',
    textColor: '#0F0F0F',
    mutedTextColor: 'rgba(15, 15, 15, 0.72)',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'One Shareable Link',
    description: 'Post your job, get a link. Share anywhere — social, email, job boards. Done.',
    borderColor: '#0057FF',
    iconBg: 'rgba(0, 87, 255, 0.1)',
    iconColor: '#0057FF',
    textColor: '#FFFFFF',
    mutedTextColor: 'rgba(255, 255, 255, 0.78)',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
]

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="features" ref={ref} className="py-20 lg:py-28 bg-[#EDE8DC]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-[#0F0F0F] rounded-full mb-6">
            <span className="font-body font-semibold text-[11px] uppercase tracking-wide text-[#F5F0E8]">
              Features
            </span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[48px] text-[#0F0F0F] leading-tight text-balance">
            Everything recruiters need
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl p-6 border border-[rgba(15,15,15,0.06)] shadow-[0_2px_12px_rgba(15,15,15,0.06)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,15,15,0.12)]"
              style={{ backgroundColor: feature.borderColor }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.28)', color: feature.textColor }}
              >
                {feature.icon}
              </div>
              <h3 className="font-display font-bold text-lg mb-2" style={{ color: feature.textColor }}>
                {feature.title}
              </h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: feature.mutedTextColor }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
