import type { Metadata } from 'next'
import { Unbounded, DM_Sans, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/providers/auth-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const unbounded = Unbounded({ 
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-unbounded',
  display: 'swap',
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const spaceMono = Space_Mono({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HireDoc AI — Hire Smarter. Screen Faster.',
  description: 'AI-powered hiring workspace. Create smart job pages, let MiniMax AI screen, score, and summarize every applicant automatically.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-square.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/icon-32x32.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${unbounded.variable} ${dmSans.variable} ${spaceMono.variable} bg-[#F6F7F9]`}>
      <body className="font-body antialiased bg-[#F6F7F9] text-[#0F0F0F]">
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
        {process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true' && (
          <Analytics />
        )}
      </body>
    </html>
  )
}
