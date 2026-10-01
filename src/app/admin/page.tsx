import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Newspaper, CheckCircle, XCircle, Rss, ArrowRight } from 'lucide-react'
import RssGuncelleButonu from '@/components/admin/RssGuncelleButonu'

async function getIstatistikler() {
  try {
    const [toplam, aktif, pasif] = await Promise.all([
      prisma.haber.count(),
      prisma.haber.count({ where: { status: 'aktif' } }),
      prisma.haber.count({ where: { status: 'pasif' } }),
    ])
    const sonHaberler = await prisma.haber.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    return { toplam, aktif, pasif, sonHaberler }
  } catch {
    return { toplam: 0, aktif: 0, pasif: 0, sonHaberler: [] }
  }
}

export default async function AdminDashboard() {
  const { toplam, aktif, pasif, sonHaberler } = await getIstatistikler()

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ font: 'var(--md-headline-medium)', color: 'var(--md-on-surface)' }}>
            Genel Bakis
          </h1>
          <p style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface-variant)', marginTop: '4px' }}>
            Haber portalinizin durumu
          </p>
        </div>
        <RssGuncelleButonu />
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { icon: Newspaper, label: 'Toplam Haber', deger: toplam, renk: 'var(--md-primary)', bg: 'var(--md-primary-container)' },
          { icon: CheckCircle, label: 'Aktif Haber', deger: aktif, renk: '#0A5C33', bg: '#CCEFDE' },
          { icon: XCircle, label: 'Pasif Haber', deger: pasif, renk: 'var(--md-error)', bg: 'var(--md-error-container)' },
        ].map(({ icon: Icon, label, deger, renk, bg }) => (
          <div key={label} className="m3-card" style={{ padding: '24px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--md-radius-md)',
              background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Icon size={24} color={renk} />
            </div>
            <div style={{ font: 'var(--md-display-small)', color: 'var(--md-on-surface)', fontWeight: 700 }}>
              {deger}
            </div>
            <div style={{ font: 'var(--md-label-large)', color: 'var(--md-on-surface-variant)', marginTop: '4px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Son Haberler */}
      <div className="m3-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ font: 'var(--md-title-large)', color: 'var(--md-on-surface)' }}>
            Son Eklenen Haberler
          </h2>
          <Link href="/admin/haberler" className="m3-btn m3-btn-tonal" style={{ padding: '8px 16px', gap: '6px' }}>
            Tumunu Gor <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sonHaberler.map((h) => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 16px',
              background: 'var(--md-surface-container)',
              borderRadius: 'var(--md-radius-md)',
            }}>
              <span className={`m3-badge m3-badge-${h.status}`}>{h.status}</span>
              <span style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface)', flex: 1 }}>
                {h.title}
              </span>
              <Link href={`/admin/haberler?edit=${h.id}`} className="m3-btn m3-btn-outlined" style={{ padding: '4px 14px', fontSize: '13px' }}>
                Duzenle
              </Link>
            </div>
          ))}
          {sonHaberler.length === 0 && (
            <p style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface-variant)', textAlign: 'center', padding: '24px' }}>
              Henuz haber yok. RSS ile guncelleyin.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}