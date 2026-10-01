'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import StampCanvas from '@/components/admin/StampCanvas'
import { Image as ImageIcon } from 'lucide-react'

function DamgaIcerik() {
  const searchParams = useSearchParams()
  const initialTitle = searchParams.get('title') || ''
  const initialImage = searchParams.get('image') || ''

  const [gorselUrl, setGorselUrl] = useState(initialImage)
  const [baslik, setBaslik] = useState(initialTitle)
  const [altyazi, setAltyazi] = useState('beyazbelge.com.tr')

  useEffect(() => {
    if (initialTitle) setBaslik(initialTitle)
    if (initialImage) setGorselUrl(initialImage)
  }, [initialTitle, initialImage])

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ font: 'var(--md-headline-medium)', color: 'var(--md-on-surface)' }}>
          Damga & Sosyal Medya Motoru
        </h1>
        <p style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface-variant)', marginTop: '4px' }}>
          Haberin görseli ve başlığı ile profesyonel sosyal medya kapak görseli oluşturun.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Sol: Giriş formu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="m3-card" style={{ padding: '24px' }}>
            <h2 style={{ font: 'var(--md-title-large)', color: 'var(--md-on-surface)', marginBottom: '20px' }}>
              İçerik Ayarları
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="m3-field">
                <label>Haber Görseli URL'si</label>
                <input
                  type="text"
                  value={gorselUrl}
                  onChange={e => setGorselUrl(e.target.value)}
                  placeholder="https://example.com/haber-gorseli.jpg"
                />
              </div>

              <div className="m3-field">
                <label>Manşet Başlık</label>
                <textarea
                  rows={3}
                  value={baslik}
                  onChange={e => setBaslik(e.target.value)}
                  placeholder="Haber başlığını buraya yazın..."
                />
              </div>

              <div className="m3-field">
                <label>Alt Yazı / Kaynak</label>
                <input
                  type="text"
                  value={altyazi}
                  onChange={e => setAltyazi(e.target.value)}
                  placeholder="Örn: beyazbelge.com.tr"
                />
              </div>
            </div>

            {/* Görsel önizleme küçük */}
            {gorselUrl && (
              <div style={{ marginTop: '16px', borderRadius: 'var(--md-radius-md)', overflow: 'hidden', aspectRatio: '16/9' }}>
                <img
                  src={gorselUrl}
                  alt="Önizleme"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>
            )}

            {!gorselUrl && (
              <div style={{
                marginTop: '16px', borderRadius: 'var(--md-radius-md)',
                background: 'var(--md-surface-container-high)',
                aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '8px', color: 'var(--md-on-surface-variant)',
              }}>
                <ImageIcon size={32} strokeWidth={1.5} />
                <span style={{ font: 'var(--md-body-medium)' }}>Görsel URL'si girin</span>
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Canvas önizleme */}
        <div className="m3-card" style={{ padding: '24px' }}>
          <h2 style={{ font: 'var(--md-title-large)', color: 'var(--md-on-surface)', marginBottom: '20px' }}>
            Canlı Önizleme & İndirme
          </h2>
          <StampCanvas
            image={gorselUrl}
            baslik={baslik}
            altyazi={altyazi}
          />
        </div>
      </div>
    </div>
  )
}

export default function DamgaSayfasi() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <DamgaIcerik />
    </Suspense>
  )
}