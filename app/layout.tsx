'use client'

import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
