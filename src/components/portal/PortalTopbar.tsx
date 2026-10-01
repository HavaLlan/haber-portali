'use client'
import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect, Suspense } from 'react'

const KATEGORILER = [
  { key: 'tumu', label: 'Ana Sayfa', href: '/' },
  { key: 'afyon', label: 'Afyon Haberleri', href: '/?kategori=afyon' },
  { key: 'gundem', label: 'Gündem', href: '/?kategori=gundem' },
  { key: 'siyaset', label: 'Siyaset', href: '/?kategori=siyaset' },
  { key: 'ekonomi', label: 'Ekonomi', href: '/?kategori=ekonomi' },
  { key: 'spor', label: 'Spor', href: '/?kategori=spor' },
]



function NavContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const aktifKategori = searchParams.get('kategori') || (pathname === '/' ? 'tumu' : '')
  const [digerAcik, setDigerAcik] = useState(false)
  const digerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (digerRef.current && !digerRef.current.contains(e.target as Node)) {
        setDigerAcik(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="portal-topbar">
      <div className="portal-topbar-inner" style={{ flexDirection: 'column', height: 'auto', paddingTop: '12px', paddingBottom: '0' }}>
        {/* Üst satır: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingBottom: '10px' }}>
          <Link href="/" className="portal-logo">
            Beyaz<span>Belge</span>
          </Link>
        </div>

        {/* Alt satır: Kategori sekmeleri */}
        <nav style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '0', width: '100%', alignItems: 'center' }}>
          {KATEGORILER.map(({ key, label, href }) => (
            <Link
              key={key}
              href={href}
              className={`nav-pill ${aktifKategori === key ? 'nav-pill-active' : ''}`}
            >
              {label}
            </Link>
          ))}


        </nav>
      </div>
    </header>
  )
}

export default function PortalTopbar() {
  return (
    <Suspense fallback={
      <header className="portal-topbar">
        <div className="portal-topbar-inner">
          <Link href="/" className="portal-logo">Beyaz<span>Belge</span></Link>
        </div>
      </header>
    }>
      <NavContent />
    </Suspense>
  )
}
