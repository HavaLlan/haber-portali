'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download, RefreshCw, Image as ImageIcon, Type, AlignLeft } from 'lucide-react'

type Format = 'kare' | 'dikey'

const DIMENSIONS = {
  kare: { w: 1080, h: 1080, label: '1080x1080 (Kare)' },
  dikey: { w: 1080, h: 1350, label: '1080x1350 (Dikey)' },
}

const PREVIEW_SCALE = 0.37

export default function DamgaSistemi() {
  const searchParams = useSearchParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [format, setFormat] = useState<Format>('kare')
  const [baslik, setBaslik] = useState('Buraya manset yazisini yazin')
  const [altyazi, setAltyazi] = useState('beyazbelge.com')
  const [bgUrl, setBgUrl] = useState('')
  const [logo, setLogo] = useState('Beyaz Belge')
  const [fontBoyutu, setFontBoyutu] = useState(72)
  const [gradientYogunluk, setGradientYogunluk] = useState(0.85)
  const [renk, setRenk] = useState('#ffffff')

  const { w, h } = DIMENSIONS[format]

  const ciz = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = w
    canvas.height = h
    ctx.clearRect(0, 0, w, h)

    // Background
    if (bgUrl) {
      try {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject()
          img.src = bgUrl
        })
        // Cover fit
        const scale = Math.max(w / img.width, h / img.height)
        const sw = img.width * scale
        const sh = img.height * scale
        const sx = (w - sw) / 2
        const sy = (h - sh) / 2
        ctx.drawImage(img, sx, sy, sw, sh)
      } catch {
        ctx.fillStyle = '#1a2a2a'
        ctx.fillRect(0, 0, w, h)
      }
    } else {
      // Default gradient background
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, '#006A68')
      grad.addColorStop(1, '#003736')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }

    // Gradient overlay
    const overlay = ctx.createLinearGradient(0, h * 0.3, 0, h)
    overlay.addColorStop(0, `rgba(0,0,0,0)`)
    overlay.addColorStop(1, `rgba(0,0,0,${gradientYogunluk})`)
    ctx.fillStyle = overlay
    ctx.fillRect(0, 0, w, h)

    // Logo badge
    const badgePad = 20
    const badgeH = 60
    const badgeW = logo.length * 22 + 40
    ctx.fillStyle = '#006A68'
    ctx.beginPath()
    ctx.roundRect(40, 40, badgeW, badgeH, 12)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 28px 'Ubuntu Sans', sans-serif`
    ctx.fillText(logo, 40 + 20, 40 + 38)

    // Title text
    ctx.fillStyle = renk
    ctx.font = `700 ${fontBoyutu}px 'Ubuntu Sans', sans-serif`
    
    // Word wrap
    const maxWidth = w - 80
    const words = baslik.split(' ')
    const lines: string[] = []
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      const metrics = ctx.measureText(test)
      if (metrics.width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)

    const lineH = fontBoyutu * 1.25
    const totalTextH = lines.length * lineH
    const textY = h - 120 - totalTextH
    
    lines.forEach((l, i) => {
      ctx.fillText(l, 40, textY + i * lineH)
    })

    // Altyazi
    if (altyazi) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = `400 36px 'Ubuntu Sans', sans-serif`
      ctx.fillText(altyazi, 40, h - 60)
    }
  }, [w, h, bgUrl, baslik, altyazi, logo, fontBoyutu, gradientYogunluk, renk, format])

  useEffect(() => {
    ciz()
  }, [ciz])

  // Load from URL param
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      fetch(`/api/haberler/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.haber) {
            setBaslik(data.haber.title)
            if (data.haber.image) setBgUrl(data.haber.image)
            if (data.haber.description) setAltyazi(data.haber.description.slice(0, 80))
          }
        })
        .catch(() => {})
    }
  }, [searchParams])

  function indir() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `damga-${format}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  }

  const pw = Math.round(w * PREVIEW_SCALE)
  const ph = Math.round(h * PREVIEW_SCALE)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ font: 'var(--md-headline-medium)', color: 'var(--md-on-surface)' }}>
          Damga Sistemi
        </h1>
        <p style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface-variant)', marginTop: '4px' }}>
          Sosyal medya paylasim gorseli olusturun ve indirin
        </p>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          {/* Format selector */}
          <div className="m3-card" style={{ padding: '20px' }}>
            <div style={{ font: 'var(--md-title-medium)', color: 'var(--md-on-surface)', marginBottom: '12px' }}>Format</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(Object.keys(DIMENSIONS) as Format[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`m3-chip ${format === f ? 'active' : ''}`}
                >
                  {DIMENSIONS[f].label}
                </button>
              ))}
            </div>
          </div>

          {/* Gorsel URL */}
          <div className="m3-card" style={{ padding: '20px' }}>
            <div style={{ font: 'var(--md-title-medium)', color: 'var(--md-on-surface)', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ImageIcon size={16} /> Arka Plan Gorseli
            </div>
            <div className="m3-field">
              <input
                type="url"
                value={bgUrl}
                onChange={e => setBgUrl(e.target.value)}
                placeholder="Gorsel URL'si veya bos birakın (varsayilan arkaplan)"
              />
            </div>
          </div>

          {/* Metin Ayarlari */}
          <div className="m3-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ font: 'var(--md-title-medium)', color: 'var(--md-on-surface)', marginBottom: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Type size={16} /> Metin Ayarlari
            </div>
            
            <div className="m3-field">
              <label>Logo / Marka Adi</label>
              <input type="text" value={logo} onChange={e => setLogo(e.target.value)} />
            </div>

            <div className="m3-field">
              <label>Manset / Baslik</label>
              <textarea rows={3} value={baslik} onChange={e => setBaslik(e.target.value)} />
            </div>

            <div className="m3-field">
              <label>Alt Yazi / Kaynak</label>
              <input type="text" value={altyazi} onChange={e => setAltyazi(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="m3-field">
                <label>Font Boyutu: {fontBoyutu}px</label>
                <input type="range" min="36" max="120" value={fontBoyutu} onChange={e => setFontBoyutu(+e.target.value)} style={{ padding: '8px 0' }} />
              </div>
              <div className="m3-field">
                <label>Gradient: {Math.round(gradientYogunluk * 100)}%</label>
                <input type="range" min="0.3" max="1" step="0.05" value={gradientYogunluk} onChange={e => setGradientYogunluk(+e.target.value)} style={{ padding: '8px 0' }} />
              </div>
              <div className="m3-field">
                <label>Yazi Rengi</label>
                <input type="color" value={renk} onChange={e => setRenk(e.target.value)} style={{ height: '42px', cursor: 'pointer' }} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={ciz} className="m3-btn m3-btn-outlined" style={{ flex: 1, justifyContent: 'center' }}>
              <RefreshCw size={16} /> Yenile
            </button>
            <button onClick={indir} className="m3-btn m3-btn-filled" style={{ flex: 2, justifyContent: 'center' }}>
              <Download size={18} /> PNG Indir ({DIMENSIONS[format].label})
            </button>
          </div>
        </div>

        {/* Canvas Preview */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            background: 'var(--md-surface-container)',
            borderRadius: 'var(--md-radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{ font: 'var(--md-label-medium)', color: 'var(--md-on-surface-variant)' }}>
              Canli Onizleme
            </div>
            <div style={{
              borderRadius: 'var(--md-radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--md-elevation-3)',
              width: `${pw}px`,
              height: `${ph}px`,
            }}>
              <canvas
                ref={canvasRef}
                style={{ width: `${pw}px`, height: `${ph}px`, display: 'block' }}
              />
            </div>
            <div style={{ font: 'var(--md-label-small)', color: 'var(--md-outline)' }}>
              {w} x {h} px (PNG)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}