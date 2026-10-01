'use client'
import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check, Save } from 'lucide-react'

interface UretilmisHaber {
  baslik: string
  spot: string
  icerik: string
}

export default function AiUreticiSayfasi() {
  const [konu, setKonu] = useState('')
  const [yukluyor, setYukluyor] = useState(false)
  const [hata, setHata] = useState('')
  const [sonuc, setSonuc] = useState<UretilmisHaber | null>(null)
  const [kopyalandi, setKopyalandi] = useState(false)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [kayitMesaj, setKayitMesaj] = useState('')

  async function haberUret() {
    if (!konu.trim()) return
    setYukluyor(true)
    setHata('')
    setSonuc(null)

    try {
      const res = await fetch('/api/ai/haber-uret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konu }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.hata || 'Haber üretilemedi.')
      setSonuc(data)
    } catch (err) {
      setHata((err as Error).message)
    } finally {
      setYukluyor(false)
    }
  }

  async function kaydet() {
    if (!sonuc) return
    setKaydediliyor(true)
    try {
      const res = await fetch('/api/haberler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sonuc.baslik,
          description: sonuc.spot,
          content: sonuc.icerik,
          status: 'aktif',
          kaynak: 'manuel',
          kategori: 'gundem',
        }),
      })
      if (!res.ok) throw new Error('Kaydedilemedi')
      setKayitMesaj('✓ Haber başarıyla kaydedildi!')
      setTimeout(() => setKayitMesaj(''), 3000)
    } catch {
      setKayitMesaj('✗ Kaydetme sırasında hata oluştu.')
    } finally {
      setKaydediliyor(false)
    }
  }

  function kopyala(metin: string) {
    navigator.clipboard.writeText(metin)
    setKopyalandi(true)
    setTimeout(() => setKopyalandi(false), 2000)
  }

  return (
    <div>
      {/* Başlık */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ font: 'var(--md-headline-medium)', color: 'var(--md-on-surface)' }}>
          AI Haber Üretici
        </h1>
        <p style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface-variant)', marginTop: '4px' }}>
          Bir konu girin; yapay zeka insani ve akıcı Türkçe ile haber oluştursun.
        </p>
      </div>

      {/* Konu girişi */}
      <div className="m3-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div className="m3-field" style={{ marginBottom: '16px' }}>
          <label>Haber Konusu</label>
          <textarea
            value={konu}
            onChange={e => setKonu(e.target.value)}
            placeholder="Örn: Afyon'da trafik kazası meydana geldi, 2 yaralı var..."
            rows={3}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) haberUret() }}
          />
          <span style={{ font: 'var(--md-label-small)', color: 'var(--md-outline)', marginTop: '4px' }}>
            Ctrl+Enter ile de üretebilirsiniz
          </span>
        </div>

        <button
          onClick={haberUret}
          disabled={yukluyor || !konu.trim()}
          className="m3-btn m3-btn-filled"
          style={{ gap: '8px', minWidth: '180px' }}
        >
          {yukluyor ? (
            <><Loader2 size={18} className="animate-spin" /> Üretiliyor...</>
          ) : (
            <><Sparkles size={18} /> Haber Üret</>
          )}
        </button>

        {hata && (
          <p style={{ marginTop: '12px', color: 'var(--md-error)', font: 'var(--md-body-medium)' }}>
            ⚠ {hata}
          </p>
        )}
      </div>

      {/* Sonuç */}
      {sonuc && (
        <div className="m3-card animate-fade-in" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ font: 'var(--md-title-large)', color: 'var(--md-on-surface)' }}>
              Üretilen Haber
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => kopyala(`${sonuc.baslik}\n\n${sonuc.spot}\n\n${sonuc.icerik}`)}
                className="m3-btn m3-btn-outlined"
                style={{ gap: '6px', padding: '8px 16px' }}
              >
                {kopyalandi ? <><Check size={16} /> Kopyalandı!</> : <><Copy size={16} /> Tümünü Kopyala</>}
              </button>
              <button
                onClick={kaydet}
                disabled={kaydediliyor}
                className="m3-btn m3-btn-tonal"
                style={{ gap: '6px', padding: '8px 16px' }}
              >
                {kaydediliyor ? <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</> : <><Save size={16} /> Kaydet & Yayınla</>}
              </button>
            </div>
          </div>

          {kayitMesaj && (
            <p style={{ marginBottom: '16px', font: 'var(--md-body-medium)', color: kayitMesaj.startsWith('✓') ? '#0A5C33' : 'var(--md-error)' }}>
              {kayitMesaj}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Başlık */}
            <div>
              <div style={{ font: 'var(--md-label-medium)', color: 'var(--md-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Başlık
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => setSonuc(s => s ? { ...s, baslik: e.currentTarget.textContent || '' } : null)}
                style={{
                  font: 'var(--md-headline-small)', color: 'var(--md-on-surface)',
                  padding: '12px', background: 'var(--md-surface-container)',
                  borderRadius: 'var(--md-radius-md)', outline: 'none',
                  cursor: 'text', minHeight: '48px',
                  border: '1px solid transparent',
                  transition: 'border-color .2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--md-primary)')}
              >
                {sonuc.baslik}
              </div>
            </div>

            {/* Spot */}
            <div>
              <div style={{ font: 'var(--md-label-medium)', color: 'var(--md-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Spot (Özet)
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => setSonuc(s => s ? { ...s, spot: e.currentTarget.textContent || '' } : null)}
                style={{
                  font: 'var(--md-body-large)', color: 'var(--md-on-surface)',
                  padding: '12px', background: 'var(--md-surface-container)',
                  borderRadius: 'var(--md-radius-md)', outline: 'none',
                  cursor: 'text', lineHeight: 1.7,
                  border: '1px solid transparent',
                  transition: 'border-color .2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--md-primary)')}
              >
                {sonuc.spot}
              </div>
            </div>

            {/* İçerik */}
            <div>
              <div style={{ font: 'var(--md-label-medium)', color: 'var(--md-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Haber Metni
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => setSonuc(s => s ? { ...s, icerik: e.currentTarget.textContent || '' } : null)}
                style={{
                  font: 'var(--md-body-large)', color: 'var(--md-on-surface)',
                  padding: '16px', background: 'var(--md-surface-container)',
                  borderRadius: 'var(--md-radius-md)', outline: 'none',
                  cursor: 'text', lineHeight: 1.8, minHeight: '200px',
                  border: '1px solid transparent',
                  transition: 'border-color .2s',
                  whiteSpace: 'pre-wrap',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--md-primary)')}
              >
                {sonuc.icerik}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
