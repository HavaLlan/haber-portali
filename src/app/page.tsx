import { prisma } from '@/lib/prisma'
import PortalTopbar from '@/components/portal/PortalTopbar'
import HeroSlider from '@/components/portal/HeroSlider'
import NewsGrid from '@/components/portal/NewsGrid'
import ChatbotWidget from '@/components/portal/ChatbotWidget'

export const revalidate = 60

interface Props {
  searchParams: { kategori?: string }
}

async function getHaberler(kategori?: string) {
  try {
    const where: { status: string; kategori?: string } = { status: 'aktif' }
    if (kategori && kategori !== 'tumu') {
      where.kategori = kategori
    }
    return await prisma.haber.findMany({
      where,
      orderBy: { pubDate: 'desc' },
      take: 24,
    })
  } catch {
    return []
  }
}

const KATEGORI_LABELS: Record<string, string> = {
  afyon: 'Afyon Haberleri',
  gundem: 'Gündem',
  siyaset: 'Siyaset',
  ekonomi: 'Ekonomi',
  spor: 'Spor',
  diger: 'Diğer',
}

export default async function AnaSayfa({ searchParams }: Props) {
  const kategori = searchParams.kategori
  const haberler = await getHaberler(kategori)
  const mansetler = !kategori ? haberler.slice(0, 5) : []
  const listeHaberler = !kategori ? (haberler.length > 5 ? haberler.slice(5) : haberler) : haberler

  const baslik = kategori ? (KATEGORI_LABELS[kategori] || 'Haberler') : 'Son Haberler'

  return (
    <>
      <PortalTopbar />
      <main>
        {mansetler.length > 0 && (
          <section style={{ padding: '24px 0', background: 'var(--md-surface-container-lowest)' }}>
            <div className="page-container">
              <HeroSlider haberler={mansetler} />
            </div>
          </section>
        )}

        <section style={{ padding: '40px 0' }}>
          <div className="page-container">
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ font: 'var(--md-headline-medium)', color: 'var(--md-on-surface)' }}>
                {baslik}
              </h2>
              <span style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface-variant)' }}>
                {haberler.length} haber
              </span>
            </div>
            {haberler.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 24px',
                background: 'var(--md-surface-container-low)',
                borderRadius: 'var(--md-radius-xl)',
              }}>
                <p style={{ font: 'var(--md-headline-small)', color: 'var(--md-on-surface-variant)', marginBottom: '12px' }}>
                  Bu kategoride henüz haber yok
                </p>
                <p style={{ font: 'var(--md-body-medium)', color: 'var(--md-outline)' }}>
                  Admin panelinden RSS güncellemesi yapın.
                </p>
              </div>
            ) : (
              <NewsGrid haberler={listeHaberler} />
            )}
          </div>
        </section>
      </main>

      <ChatbotWidget haberler={haberler.slice(0, 20).map(h => ({
        title: h.title,
        description: h.description || '',
        pubDate: h.pubDate,
      }))} />

      <footer style={{
        background: 'var(--md-surface-container-low)',
        borderTop: '1px solid var(--md-outline-variant)',
        padding: '32px 24px',
        textAlign: 'center',
        font: 'var(--md-body-medium)',
        color: 'var(--md-on-surface-variant)',
      }}>
        <div className="page-container">
          <p>© 2024 Beyaz Belge. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </>
  )
}
