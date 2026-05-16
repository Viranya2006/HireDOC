'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'

export function Footer() {
  return (
    <footer className="bg-[#0F0F0F] py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Logo */}
          <div className="flex items-center gap-2">
            <Logo size="xs" />
            <span className="font-display font-bold text-[#F5F0E8] text-base">HireDoc AI</span>
            <span className="font-body text-sm text-[rgba(245,240,232,0.5)] ml-2">© 2025</span>
          </div>

          {/* Center */}
          <p className="font-body text-sm text-[rgba(245,240,232,0.6)]">
            Built with MiniMax AI
          </p>

          {/* Right - Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="font-body text-sm text-[rgba(245,240,232,0.6)] hover:text-[#F5F0E8] transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/login" 
              className="font-body text-sm text-[rgba(245,240,232,0.6)] hover:text-[#F5F0E8] transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/login" 
              className="font-body text-sm text-[rgba(245,240,232,0.6)] hover:text-[#F5F0E8] transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
