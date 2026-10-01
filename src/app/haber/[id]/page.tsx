import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PortalTopbar from '@/components/portal/PortalTopbar'
import Link from 'next/link'
import { Calendar, ExternalLink, ArrowLeft } from 'lucide-react'
import { formatTarih, stripHtml } from '@/lib/utils'

interface Props {
  params: { id: string }
}

async function getHaber(id: string) {
  try {
    return await prisma.haber.findUnique({ where: { id: parseInt(id) } })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const haber = await getHaber(params.id)
  if (!haber) return { title: 'Haber bulunamadi' }
  return {
    title: `${haber.title} | Beyaz Belge`,
    description: haber.description ? stripHtml(haber.description).slice(0, 160) : '',
    openGraph: {
      title: haber.title,
      description: haber.description ? stripHtml(haber.description).slice(0, 160) : '',
      images: haber.image ? [haber.image] : [],
    }
  }
}

export default async function HaberDetay({ params }: Props) {
  const haber = await getHaber(params.id)
  if (!haber || haber.status !== 'aktif') notFound()

  const icerik = haber.content || haber.description || ''

  return (
    <>
      <PortalTopbar />
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        <Link href="/" className="m3-btn m3-btn-outlined" style={{ marginBottom: '24px', display: 'inline-flex', padding: '8px 20px' }}>
          <ArrowLeft size={16} />
          Geri Don
        </Link>

        <article>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="m3-badge m3-badge-aktif">Haber</span>
            <span style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {formatTarih(haber.pubDate)}
            </span>
          </div>

          <h1 style={{ font: 'var(--md-headline-large)', color: 'var(--md-on-surface)', marginBottom: '16px', lineHeight: 1.3 }}>
            {haber.title}
          </h1>

          {haber.description && (
            <p style={{
              font: 'var(--md-title-medium)',
              color: 'var(--md-on-surface-variant)',
              lineHeight: 1.7,
              marginBottom: '24px',
              padding: '16px 20px',
              background: 'var(--md-secondary-container)',
              borderRadius: 'var(--md-radius-md)',
              borderLeft: '4px solid var(--md-primary)',
            }}>
              {stripHtml(haber.description)}
            </p>
          )}

          {haber.image && (
            <div className="article-cover">
              <img src={haber.image} alt={haber.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div className="article-content">
            {icerik.includes('<') ? (
              <div dangerouslySetInnerHTML={{ __html: icerik }} />
            ) : (
              icerik.split('\n').filter((p: string) => p.trim()).map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))
            )}
          </div>

          {haber.link && (
            <div style={{ marginTop: '32px', padding: '20px', background: 'var(--md-surface-container)', borderRadius: 'var(--md-radius-md)' }}>
              <p style={{ font: 'var(--md-label-medium)', color: 'var(--md-on-surface-variant)', marginBottom: '8px' }}>
                Kaynak
              </p>
              <a href={haber.link} target="_blank" rel="noopener noreferrer" className="m3-btn m3-btn-outlined" style={{ display: 'inline-flex' }}>
                <ExternalLink size={16} />
                Kaynagi Goruntule
              </a>
            </div>
          )}

          {/* Ilgili Haberler Bolumu */}
          <div style={{ marginTop: '48px', borderTop: '1px solid var(--md-outline-variant)', paddingTop: '32px' }}>
            <h3 style={{ font: 'var(--md-headline-small)', color: 'var(--md-on-surface)', marginBottom: '24px' }}>
              Ilgili Olabilecek Haberler
            </h3>
            <div className="news-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {(await prisma.haber.findMany({
                where: { status: 'aktif', id: { not: haber.id } },
                orderBy: { pubDate: 'desc' },
                take: 3
              })).map((ilgili) => (
                <Link
                  key={ilgili.id}
                  href={`/haber/${ilgili.id}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <article className="m3-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {ilgili.image ? (
                      <div style={{ overflow: 'hidden', aspectRatio: '16/9', flexShrink: 0 }}>
                        <img
                          src={ilgili.image}
                          alt={ilgili.title}
                          className="news-card-img"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div style={{
                        aspectRatio: '16/9',
                        background: 'linear-gradient(135deg, var(--md-primary-container) 0%, var(--md-tertiary-container) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ font: 'var(--md-title-medium)', color: 'var(--md-on-primary-container)', opacity: .6 }}>BB</span>
                      </div>
                    )}
                    <div className="news-card-body" style={{ flex: 1, padding: '12px' }}>
                      <h4 style={{ font: 'var(--md-title-medium)', color: 'var(--md-on-surface)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ilgili.title}
                      </h4>
                      <div className="news-card-meta" style={{ marginTop: 'auto' }}>
                        <Calendar size={12} />
                        {formatTarih(ilgili.pubDate)}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>
    </>
  )
}