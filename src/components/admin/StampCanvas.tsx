'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Download, RefreshCw } from 'lucide-react'

interface Props {
  image?: string
  baslik?: string
  altyazi?: string
  format?: 'kare' | 'dikey'
  onBaslikChange?: (v: string) => void
  onAltyaziChange?: (v: string) => void
}

const FORMATS = {
  kare: { width: 1080, height: 1080, label: '1080×1080 (Kare)' },
  dikey: { width: 1080, height: 1350, label: '1080×1350 (Dikey)' },
}

export default function StampCanvas({
  image = '',
  baslik = '',
  altyazi = '',
  format = 'kare',
  onBaslikChange,
  onAltyaziChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [yerelBaslik, setYerelBaslik] = useState(baslik)
  const [yerelAltyazi, setYerelAltyazi] = useState(altyazi)
  const [yerelFormat, setYerelFormat] = useState<'kare' | 'dikey'>(format)
  const [vurguRengi, setVurguRengi] = useState('#FFD600')

  const ciz = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = FORMATS[yerelFormat]
    canvas.width = width
    canvas.height = height

    // Arka plan
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, width, height)

    // Görsel
    if (image) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((res, rej) => {
          img.onload = () => res()
          img.onerror = () => rej()
          img.src = image
        })
        const imgRatio = img.width / img.height
        const canvasRatio = width / height
        let sx = 0, sy = 0, sw = img.width, sh = img.height
        if (imgRatio > canvasRatio) {
          sw = img.height * canvasRatio
          sx = (img.width - sw) / 2
        } else {
          sh = img.width / canvasRatio
          sy = (img.height - sh) / 2
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height)
      } catch {
        ctx.fillStyle = '#1a2830'
        ctx.fillRect(0, 0, width, height)
      }
    }

    // Gradient overlay (sağ+alt)
    const grad = ctx.createLinearGradient(0, height * 0.3, 0, height)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(0.5, 'rgba(0,0,0,0.6)')
    grad.addColorStop(1, 'rgba(0,0,0,0.92)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Sağ üst logo kutusu
    const logoPad = 28
    const logoH = 60
    ctx.fillStyle = '#006A68'
    const logoW = 240
    const logoX = width - logoW - logoPad
    ctx.beginPath()
    ctx.roundRect(logoX, logoPad, logoW, logoH, 10)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 32px Ubuntu Sans, Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText('Beyaz Belge', logoX + logoW / 2, logoPad + logoH / 2)

    // Başlık metni (alt kısım)
    const padX = 52
    const padBottom = 70
    const maxW = width - padX * 2
    const baslikFontSize = yerelFormat === 'kare' ? 72 : 68
    ctx.font = `900 ${baslikFontSize}px Ubuntu Sans, Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    // Kelime sarmalama ve vurgulama ( *metin* )
    const tokens: {text: string, highlight: boolean}[] = []
    const parts = (yerelBaslik || 'Başlık giriniz').split(/\*(.*?)\*/g)
    parts.forEach((p, i) => {
      if (p) tokens.push({ text: p, highlight: i % 2 === 1 })
    })

    const words: {text: string, highlight: boolean}[] = []
    tokens.forEach(t => {
      const split = t.text.split(/(\s+)/)
      split.forEach(s => {
        if (s) words.push({ text: s, highlight: t.highlight })
      })
    })

    const lines: {text: string, highlight: boolean}[][] = []
    let currentLine: {text: string, highlight: boolean}[] = []
    
    function measureLine(line: typeof currentLine, extra = '') {
      return line.reduce((sum, seg) => sum + ctx!.measureText(seg.text).width, 0) + (extra ? ctx!.measureText(extra).width : 0)
    }

    for (const w of words) {
      const isWhitespace = /^\s+$/.test(w.text)
      if (isWhitespace && currentLine.length === 0) continue

      if (!isWhitespace && measureLine(currentLine, w.text) > maxW) {
        lines.push(currentLine)
        currentLine = [{ ...w }]
      } else {
        if (currentLine.length > 0 && currentLine[currentLine.length - 1].highlight === w.highlight) {
          currentLine[currentLine.length - 1].text += w.text
        } else {
          currentLine.push({ ...w })
        }
      }
    }
    if (currentLine.length > 0) lines.push(currentLine)

    const satirYuksekligi = baslikFontSize * 1.2
    const toplamBaslikH = lines.length * satirYuksekligi

    let altyaziH = 0
    if (yerelAltyazi) {
      ctx.font = `500 36px Ubuntu Sans, Arial, sans-serif`
      altyaziH = 50
    }

    let y = height - padBottom - altyaziH - toplamBaslikH

    // Başlık satırları
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      ctx.font = `900 ${baslikFontSize}px Ubuntu Sans, Arial, sans-serif`
      const lineY = y + i * satirYuksekligi

      ctx.strokeStyle = 'rgba(0,0,0,0.95)'
      ctx.lineWidth = 8
      ctx.lineJoin = 'round'
      
      let strokeX = padX
      for (const seg of line) {
        ctx.strokeText(seg.text, strokeX, lineY)
        strokeX += ctx.measureText(seg.text).width
      }

      let fillX = padX
      for (const seg of line) {
        ctx.fillStyle = seg.highlight ? vurguRengi : '#ffffff'
        ctx.fillText(seg.text, fillX, lineY)
        fillX += ctx.measureText(seg.text).width
      }
    }

    // Alt yazı
    if (yerelAltyazi) {
      ctx.font = `500 36px Ubuntu Sans, Arial, sans-serif`
      const altY = height - padBottom
      ctx.strokeStyle = 'rgba(0,0,0,0.9)'
      ctx.lineWidth = 5
      ctx.strokeText(yerelAltyazi, padX, altY)
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText(yerelAltyazi, padX, altY)
    }
  }, [image, yerelBaslik, yerelAltyazi, yerelFormat, vurguRengi])

  useEffect(() => { ciz() }, [ciz])
  useEffect(() => { setYerelBaslik(baslik) }, [baslik])
  useEffect(() => { setYerelAltyazi(altyazi) }, [altyazi])

  function indir() {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `beyaz-belge-damga-${Date.now()}.png`
    a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['kare', 'dikey'] as const).map(f => (
          <button
            key={f}
            onClick={() => setYerelFormat(f)}
            className={`m3-btn ${yerelFormat === f ? 'm3-btn-filled' : 'm3-btn-outlined'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {FORMATS[f].label}
          </button>
        ))}
      </div>

      <div style={{
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 'var(--md-radius-lg)',
        overflow: 'hidden',
        maxWidth: '540px',
        alignSelf: 'flex-start',
      }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '540px' }}>
        <div className="m3-field">
          <label>Manşet (Başlık) - Vurgulanacak kelimeleri *yıldız* içine alın</label>
          <textarea
            value={yerelBaslik}
            onChange={e => {
              setYerelBaslik(e.target.value)
              onBaslikChange?.(e.target.value)
            }}
            rows={3}
            placeholder="Örn: Önemli bir *haber* gelişmesi..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className="m3-field">
          <label>Alt Yazı (isteğe bağlı)</label>
          <input
            type="text"
            value={yerelAltyazi}
            onChange={e => {
              setYerelAltyazi(e.target.value)
              onAltyaziChange?.(e.target.value)
            }}
            placeholder="Örn: beyazbelge.com.tr"
          />
        </div>
        <div className="m3-field">
          <label>Damga Rengi</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={vurguRengi}
              onChange={e => setVurguRengi(e.target.value)}
              style={{
                width: '40px',
                height: '40px',
                padding: '0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: 'transparent'
              }}
            />
            <span style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface-variant)' }}>
              {vurguRengi.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={ciz} className="m3-btn m3-btn-tonal" style={{ gap: '8px' }}>
          <RefreshCw size={16} /> Önizlemeyi Yenile
        </button>
        <button onClick={indir} className="m3-btn m3-btn-filled" style={{ gap: '8px' }}>
          <Download size={16} /> PNG Olarak İndir
        </button>
      </div>
    </div>
  )
}

