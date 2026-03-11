import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { ShortcutsProvider } from '@/lib/shortcuts-context'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
})
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Cumplify',
  description: 'Crea y gestiona modulos de cumplimiento ambiental sin codigo. Matrices de riesgos, monitoreos, residuos, ESG y mas.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <ShortcutsProvider>
            {children}
          </ShortcutsProvider>
        </AuthProvider>
        <Toaster position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
}
