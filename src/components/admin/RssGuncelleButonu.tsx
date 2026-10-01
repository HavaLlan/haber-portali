'use client'
import { useState } from 'react'
import { Rss, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RssGuncelleButonu() {
  const [yukleniyor, setYukleniyor] = useState(false)
  const [mesaj, setMesaj] = useState<{ tip: 'basari' | 'hata'; metin: string } | null>(null)
  const router = useRouter()

  async function guncelle() {
    setYukleniyor(true)
    setMesaj(null)
    try {
      const res = await fetch('/api/rss', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMesaj({ tip: 'basari', metin: data.mesaj })
        router.refresh()
      } else {
        setMesaj({ tip: 'hata', metin: data.hata || 'RSS guncelleme basarisiz' })
      }
    } catch {
      setMesaj({ tip: 'hata', metin: 'Baglanti hatasi' })
    } finally {
      setYukleniyor(false)
      setTimeout(() => setMesaj(null), 5000)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {mesaj && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px',
          borderRadius: 'var(--md-radius-full)',
          background: mesaj.tip === 'basari' ? '#CCEFDE' : 'var(--md-error-container)',
          color: mesaj.tip === 'basari' ? '#0A5C33' : 'var(--md-on-error-container)',
          font: 'var(--md-label-large)',
        }}>
          {mesaj.tip === 'basari' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {mesaj.metin}
        </div>
      )}
      <button
        onClick={guncelle}
        disabled={yukleniyor}
        className="m3-btn m3-btn-filled"
        style={{ gap: '8px', opacity: yukleniyor ? 0.7 : 1 }}
      >
        {yukleniyor ? <Loader2 size={18} className="animate-spin" /> : <Rss size={18} />}
        {yukleniyor ? "Guncelleniyor..." : "RSS'i Simdi Guncelle"}
      </button>
    </div>
  )
}