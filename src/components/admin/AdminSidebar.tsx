'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Newspaper, Stamp, Home, Bot } from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Genel Bakış' },
  { href: '/admin/haberler', icon: Newspaper, label: 'Haber Yönetimi' },
  { href: '/admin/ai-uretici', icon: Bot, label: 'AI Haber Üretici' },
  { href: '/admin/damga', icon: Stamp, label: 'Damga & Sosyal Medya' },
]

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="admin-sidebar">
      <div style={{ padding: '8px 16px 24px', borderBottom: '1px solid var(--md-outline-variant)', marginBottom: '12px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ font: 'var(--md-title-large)', color: 'var(--md-primary)', fontWeight: 700 }}>
            Beyaz<span style={{ color: 'var(--md-on-surface-variant)', fontWeight: 300 }}>Belge</span>
          </div>
          <div style={{ font: 'var(--md-label-small)', color: 'var(--md-on-surface-variant)', marginTop: '2px' }}>
            Admin Paneli
          </div>
        </Link>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/admin' ? path === '/admin' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--md-outline-variant)', marginLeft: '4px' }}>
        <Link href="/" className="admin-nav-item" style={{ color: 'var(--md-on-surface-variant)' }}>
          <Home size={18} />
          Siteye Dön
        </Link>
      </div>
    </aside>
  )
}