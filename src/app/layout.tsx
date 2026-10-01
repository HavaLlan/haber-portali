import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Beyaz Belge | Haber Portalı',
  description: 'Güncel haberler, son dakika gelişmeleri ve kapsamlı haber içerikleri Beyaz Belge\'de.',
  keywords: 'haber, güncel haber, son dakika, Türkiye haberleri',
  openGraph: {
    title: 'Beyaz Belge | Haber Portalı',
    description: 'Güncel haberler ve son dakika gelişmeleri',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
