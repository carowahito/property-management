import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tochi Property — Your Property. Our Pride.',
  description:
    'Full-service property management to RICS standards. 240 vetted Nairobi listings, real-time owner dashboards, and dedicated diaspora support across UK, US, Canada and Gulf time zones.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Open+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
        {/* Noto Sans JP loaded as a 2-glyph subset (土地) with display=block so the huge
            hero/tagline watermarks never flash .notdef boxes during font load. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700&text=%E5%9C%9F%E5%9C%B0&display=block"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
