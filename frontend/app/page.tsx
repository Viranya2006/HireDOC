'use client'

import { LenisProvider } from '@/components/lenis-provider'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { StatBar } from '@/components/stat-bar'
import { HowItWorks } from '@/components/how-it-works'
import { Features } from '@/components/features'
import { CTABanner } from '@/components/cta-banner'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <LenisProvider>
      <main className="min-h-screen bg-[#F5F0E8]">
        <Navbar />
        <Hero />
        <StatBar />
        <HowItWorks />
        <Features />
        <CTABanner />
        <Footer />
      </main>
    </LenisProvider>
  )
}
