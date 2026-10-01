import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { formatTarih, truncateText, stripHtml } from '@/lib/utils'
import type { Haber } from '@/types'

interface Props {
  haberler: Haber[]
}

export default function NewsGrid({ haberler }: Props) {
  return (
    <div className="news-grid">
      {haberler.map((haber, i) => (
        <Link
          key={haber.id}
          href={`/haber/${haber.id}`}
          style={{ textDecoration: 'none', display: 'block' }}
          className="animate-fade-in"
        >
          <article className="m3-card" style={{ animationDelay: `${i * 50}ms`, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {haber.image ? (
              <div style={{ overflow: 'hidden', aspectRatio: '16/9', flexShrink: 0 }}>
                <img
                  src={haber.image}
                  alt={haber.title}
                  className="news-card-img"
                  loading="lazy"
                />
              </div>
            ) : (
              <div style={{
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, var(--md-primary-container) 0%, var(--md-tertiary-container) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ font: 'var(--md-title-large)', color: 'var(--md-on-primary-container)', opacity: .6 }}>
                  BB
                </span>
              </div>
            )}

            <div className="news-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className="news-card-title">{haber.title}</h3>
              {haber.description && (
                <p className="news-card-desc">
                  {truncateText(stripHtml(haber.description), 120)}
                </p>
              )}
              <div className="news-card-meta" style={{ marginTop: 'auto' }}>
                <Calendar size={12} />
                {formatTarih(haber.pubDate)}
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
