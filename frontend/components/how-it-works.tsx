'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    number: '01',
    title: 'Create Your Job Page',
    description: 'Paste your job description. MiniMax extracts key skills and generates tailored screening questions automatically.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Candidates Apply via Link',
    description: 'Share one link. Candidates fill a clean mobile form, answer questions, and upload their CV — no account needed.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'AI Ranks Every Applicant',
    description: 'MiniMax analyzes each CV and answer. You get a fit score, skill gaps, and a full hiring brief — per candidate.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="how-it-works" ref={ref} className="py-20 lg:py-28 bg-[#F6F7F9]">
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
              How It Works
            </span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[48px] text-[#0F0F0F] leading-tight text-balance">
            From job post to ranked candidates —<br className="hidden sm:block" /> fully automated
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-24 left-[calc(33.33%-12px)] right-[calc(33.33%-12px)] h-[2px] bg-[#C8F135]">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#C8F135] rounded-full" />
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#C8F135] rounded-full" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#C8F135] rounded-full" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-2xl p-6 border border-[rgba(15,15,15,0.06)] border-t-[3px] border-t-[#00C896] shadow-[0_2px_12px_rgba(15,15,15,0.06)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,15,15,0.12)]"
            >
              {/* Large step number */}
              <span className="absolute top-4 right-4 font-display font-black text-[64px] text-[#C8F135] opacity-20 leading-none select-none">
                {step.number}
              </span>
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[rgba(0,200,150,0.1)] flex items-center justify-center text-[#00C896] mb-4">
                  {step.icon}
                </div>
                <h3 className="font-display font-bold text-lg text-[#0F0F0F] mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-[#6B6560] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
