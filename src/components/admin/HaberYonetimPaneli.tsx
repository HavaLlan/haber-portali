'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  Bot, Instagram, Music2, Loader2, Save, X, Eye, EyeOff,
  CheckCircle, AlertCircle, Stamp
} from 'lucide-react'
import Link from 'next/link'
import type { Haber } from '@/types'
import { formatTarih, stripHtml } from '@/lib/utils'

type Toast = { tip: 'basari' | 'hata'; metin: string } | null

interface Props {
  initialHaberler: Haber[]
}

const BOSH_FORM = {
  title: '',
  description: '',
  content: '',
  image: '',
  link: '',
  status: 'aktif',
}

export default function HaberYonetimPaneli({ initialHaberler }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [haberler, setHaberler] = useState<Haber[]>(initialHaberler)
  const [arama, setArama] = useState('')
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu')
  const [secili, setSecili] = useState<Haber | null>(null)
  const [form, setForm] = useState(BOSH_FORM)
  const [toast, setToast] = useState<Toast>(null)
  
  // AI states
  const [aiKonu, setAiKonu] = useState('')
  const [aiYukleniyor, setAiYukleniyor] = useState(false)
  const [sosyalYukleniyor, setSosyalYukleniyor] = useState(false)
  const [sosyalMetinler, setSosyalMetinler] = useState<{ instagram?: string; tiktok?: string } | null>(null)
  
  // Panel states
  const [panel, setPanel] = useState<'liste' | 'duzenle' | 'yeni'>('liste')

  function showToast(tip: 'basari' | 'hata', metin: string) {
    setToast({ tip, metin })
    setTimeout(() => setToast(null), 4000)
  }

  const filtreliHaberler = haberler.filter(h => {
    const aramaEslesmesi = h.title.toLowerCase().includes(arama.toLowerCase())
    const filtreEslesmesi = filtre === 'tumu' || h.status === filtre
    return aramaEslesmesi && filtreEslesmesi
  })

  async function toggleStatus(haber: Haber) {
    const yeniStatus = haber.status === 'aktif' ? 'pasif' : 'aktif'
    try {
      const res = await fetch(`/api/haberler/${haber.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: yeniStatus }),
      })
      if (res.ok) {
        setHaberler(prev => prev.map(h => h.id === haber.id ? { ...h, status: yeniStatus } : h))
        showToast('basari', `Haber ${yeniStatus === 'aktif' ? 'aktif' : 'pasif'} yapildi`)
        startTransition(() => router.refresh())
      }
    } catch {
      showToast('hata', 'Durum degistirilemedi')
    }
  }

  async function haberSil(id: number) {
    if (!confirm('Bu haberi silmek istediginizden emin misiniz?')) return
    try {
      const res = await fetch(`/api/haberler/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setHaberler(prev => prev.filter(h => h.id !== id))
        showToast('basari', 'Haber silindi')
        if (secili?.id === id) { setSecili(null); setPanel('liste') }
        startTransition(() => router.refresh())
      }
    } catch {
      showToast('hata', 'Haber silinemedi')
    }
  }

  function haberDuzenle(haber: Haber) {
    setSecili(haber)
    setForm({
      title: haber.title,
      description: haber.description || '',
      content: haber.content || '',
      image: haber.image || '',
      link: haber.link || '',
      status: haber.status,
    })
    setSosyalMetinler(null)
    setPanel('duzenle')
  }

  function yeniHaberAc() {
    setSecili(null)
    setForm(BOSH_FORM)
    setSosyalMetinler(null)
    setPanel('yeni')
  }

  async function haberKaydet() {
    if (!form.title.trim()) {
      showToast('hata', 'Baslik gerekli')
      return
    }
    try {
      let res: Response
      if (panel === 'duzenle' && secili) {
        res = await fetch(`/api/haberler/${secili.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        res = await fetch('/api/haberler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      const data = await res.json()
      if (res.ok && data.haber) {
        if (panel === 'duzenle') {
          setHaberler(prev => prev.map(h => h.id === data.haber.id ? data.haber : h))
        } else {
          setHaberler(prev => [data.haber, ...prev])
        }
        showToast('basari', panel === 'duzenle' ? 'Haber guncellendi' : 'Haber eklendi')
        setPanel('liste')
        startTransition(() => router.refresh())
      }
    } catch {
      showToast('hata', 'Kaydetme basarisiz')
    }
  }

  async function aiHaberYaz() {
    if (!aiKonu.trim()) {
      showToast('hata', 'Konu girin')
      return
    }
    setAiYukleniyor(true)
    try {
      const res = await fetch('/api/ai/yaz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konu: aiKonu, mevcutMetin: form.content }),
      })
      const data = await res.json()
      if (data.title) {
        setForm(prev => ({ ...prev, title: data.title, description: data.description, content: data.content }))
        showToast('basari', 'AI haberi olusturdu!')
      } else {
        showToast('hata', data.hata || 'AI yanit vermedi')
      }
    } catch {
      showToast('hata', 'AI servisi kullanilamadi')
    } finally {
      setAiYukleniyor(false)
    }
  }

  async function sosyalMedyaCikar() {
    if (!form.title) {
      showToast('hata', 'Once haberi kaydedin veya baslik girin')
      return
    }
    setSosyalYukleniyor(true)
    try {
      const res = await fetch('/api/ai/sosyal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, description: form.description }),
      })
      const data = await res.json()
      if (data.instagram) {
        setSosyalMetinler(data)
        showToast('basari', 'Sosyal medya metinleri olusturuldu!')
      } else {
        showToast('hata', data.hata || 'Olusturulamadi')
      }
    } catch {
      showToast('hata', 'Servis hatasi')
    } finally {
      setSosyalYukleniyor(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 20px', borderRadius: 'var(--md-radius-lg)',
          background: toast.tip === 'basari' ? '#CCEFDE' : 'var(--md-error-container)',
          color: toast.tip === 'basari' ? '#0A5C33' : 'var(--md-on-error-container)',
          boxShadow: 'var(--md-elevation-3)',
          font: 'var(--md-label-large)',
          animation: 'fadeIn .3s ease',
        }}>
          {toast.tip === 'basari' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.metin}
        </div>
      )}

      {panel === 'liste' && (
        <div>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ font: 'var(--md-headline-medium)', color: 'var(--md-on-surface)' }}>
              Haber Yonetimi
            </h1>
            <button onClick={yeniHaberAc} className="m3-btn m3-btn-filled">
              <Plus size={18} /> Yeni Haber
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--md-on-surface-variant)' }} />
              <input
                type="text"
                placeholder="Haber ara..."
                value={arama}
                onChange={e => setArama(e.target.value)}
                style={{
                  width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px',
                  background: 'var(--md-surface-container)', border: '1px solid var(--md-outline-variant)',
                  borderRadius: 'var(--md-radius-full)', font: 'var(--md-body-medium)',
                  color: 'var(--md-on-surface)', outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['tumu', 'aktif', 'pasif'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltre(f)}
                  className={`m3-chip ${filtre === f ? 'active' : ''}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {' '}({f === 'tumu' ? haberler.length : haberler.filter(h => h.status === f).length})
                </button>
              ))}
            </div>
          </div>

          {/* News list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtreliHaberler.map(haber => (
              <div key={haber.id} className="m3-card" style={{
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
                border: 'none',
              }}>
                {haber.image && (
                  <img src={haber.image} alt="" style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: 'var(--md-radius-sm)', flexShrink: 0 }} />
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: 'var(--md-title-small)', color: 'var(--md-on-surface)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {haber.title}
                  </div>
                  <div style={{ font: 'var(--md-label-medium)', color: 'var(--md-on-surface-variant)' }}>
                    {formatTarih(haber.pubDate)} · {haber.kaynak.toUpperCase()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span className={`m3-badge m3-badge-${haber.status}`}>{haber.status}</span>
                  
                  {/* Toggle */}
                  <button
                    onClick={() => toggleStatus(haber)}
                    title={haber.status === 'aktif' ? 'Pasif yap' : 'Aktif yap'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: haber.status === 'aktif' ? 'var(--md-primary)' : 'var(--md-outline)', padding: '4px' }}
                  >
                    {haber.status === 'aktif' ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>

                  <button onClick={() => haberDuzenle(haber)} className="m3-btn m3-btn-tonal" style={{ padding: '6px 14px' }}>
                    <Edit2 size={14} /> Duzenle
                  </button>
                  
                  <Link href={`/admin/damga?title=${encodeURIComponent(haber.title)}&image=${encodeURIComponent(haber.image || '')}`} className="m3-btn m3-btn-outlined" style={{ padding: '6px 14px' }}>
                    <Stamp size={14} /> Damga
                  </Link>

                  <button onClick={() => haberSil(haber.id)} className="m3-btn m3-btn-danger" style={{ padding: '6px 12px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {filtreliHaberler.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--md-on-surface-variant)' }}>
                Haber bulunamadi
              </div>
            )}
          </div>
        </div>
      )}

      {(panel === 'duzenle' || panel === 'yeni') && (
        <div>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setPanel('liste')} className="m3-btn m3-btn-outlined" style={{ padding: '8px 16px' }}>
              <X size={16} /> Iptal
            </button>
            <h1 style={{ font: 'var(--md-headline-small)', color: 'var(--md-on-surface)' }}>
              {panel === 'duzenle' ? 'Haberi Duzenle' : 'Yeni Haber Ekle'}
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* AI Section */}
              <div className="m3-card" style={{ padding: '20px' }}>
                <div style={{ font: 'var(--md-title-medium)', color: 'var(--md-on-surface)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={18} color="var(--md-primary)" />
                  AI Haber Olusturucu
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder='Konu girin (orn: "Afyonda kaza oldu")'
                    value={aiKonu}
                    onChange={e => setAiKonu(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && aiHaberYaz()}
                    style={{
                      flex: 1, padding: '10px 16px',
                      background: 'var(--md-surface-container)', border: '1px solid var(--md-outline-variant)',
                      borderRadius: 'var(--md-radius-full)', font: 'var(--md-body-medium)',
                      color: 'var(--md-on-surface)', outline: 'none',
                    }}
                  />
                  <button
                    onClick={aiHaberYaz}
                    disabled={aiYukleniyor}
                    className="m3-btn m3-btn-filled"
                    style={{ gap: '6px', flexShrink: 0 }}
                  >
                    {aiYukleniyor ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
                    {aiYukleniyor ? 'Yaziliyor...' : 'Yaz'}
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="m3-field">
                <label>Baslik *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Haber basligi"
                />
              </div>

              {/* Description */}
              <div className="m3-field">
                <label>Spot Metin / Ozet</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Haberin kisaca ozeti..."
                />
              </div>

              {/* Content */}
              <div className="m3-field">
                <label>Haber Icerik</label>
                <textarea
                  rows={10}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Haber metni..."
                />
              </div>

              {/* Image URL */}
              <div className="m3-field">
                <label>Gorsel URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              {/* Source link */}
              <div className="m3-field">
                <label>Kaynak Linki</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--md-surface-container)', borderRadius: 'var(--md-radius-md)' }}>
                <span style={{ font: 'var(--md-label-large)', color: 'var(--md-on-surface)' }}>Durum</span>
                <label className="m3-switch" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.status === 'aktif'}
                    onChange={e => setForm(f => ({ ...f, status: e.target.checked ? 'aktif' : 'pasif' }))}
                  />
                  <div className="m3-switch-track" />
                  <div className="m3-switch-thumb" />
                </label>
                <span className={`m3-badge m3-badge-${form.status}`}>{form.status}</span>
              </div>

              {/* Save Button */}
              <button onClick={haberKaydet} className="m3-btn m3-btn-filled" style={{ padding: '14px 32px', justifyContent: 'center' }}>
                <Save size={18} />
                {panel === 'duzenle' ? 'Guncelle' : 'Kaydet'}
              </button>
            </div>

            {/* Right panel: Preview + Social Media */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Image preview */}
              {form.image && (
                <div className="m3-card" style={{ overflow: 'hidden' }}>
                  <img src={form.image} alt="Onizleme" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                </div>
              )}

              {/* Social media */}
              <div className="m3-card" style={{ padding: '20px' }}>
                <div style={{ font: 'var(--md-title-medium)', color: 'var(--md-on-surface)', marginBottom: '12px' }}>
                  Sosyal Medya Asistani
                </div>
                <button
                  onClick={sosyalMedyaCikar}
                  disabled={sosyalYukleniyor}
                  className="m3-btn m3-btn-tonal"
                  style={{ width: '100%', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}
                >
                  {sosyalYukleniyor ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
                  {sosyalYukleniyor ? 'Olusturuluyor...' : 'Sosyal Medya Metni Olustur'}
                </button>

                {sosyalMetinler && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sosyalMetinler.instagram && (
                      <div style={{ background: 'var(--md-surface-container)', borderRadius: 'var(--md-radius-md)', padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', font: 'var(--md-label-medium)', color: '#E1306C', marginBottom: '8px' }}>
                          <Instagram size={14} /> Instagram
                        </div>
                        <div style={{ font: 'var(--md-body-small)', lineHeight: 1.6, color: 'var(--md-on-surface)', whiteSpace: 'pre-wrap' }}>
                          {sosyalMetinler.instagram}
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(sosyalMetinler.instagram!)}
                          className="m3-btn m3-btn-outlined"
                          style={{ marginTop: '8px', padding: '4px 12px', fontSize: '12px' }}
                        >
                          Kopyala
                        </button>
                      </div>
                    )}
                    {sosyalMetinler.tiktok && (
                      <div style={{ background: 'var(--md-surface-container)', borderRadius: 'var(--md-radius-md)', padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', font: 'var(--md-label-medium)', color: '#010101', marginBottom: '8px' }}>
                          <Music2 size={14} /> TikTok
                        </div>
                        <div style={{ font: 'var(--md-body-small)', lineHeight: 1.6, color: 'var(--md-on-surface)', whiteSpace: 'pre-wrap' }}>
                          {sosyalMetinler.tiktok}
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(sosyalMetinler.tiktok!)}
                          className="m3-btn m3-btn-outlined"
                          style={{ marginTop: '8px', padding: '4px 12px', fontSize: '12px' }}
                        >
                          Kopyala
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}