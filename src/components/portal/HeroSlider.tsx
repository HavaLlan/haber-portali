'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatTarih } from '@/lib/utils'
import type { Haber } from '@/types'

interface Props {
  haberler: Haber[]
}

export default function HeroSlider({ haberler }: Props) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % haberler.length)
  }, [haberler.length])

  const prev = () => {
    setCurrent((c) => (c - 1 + haberler.length) % haberler.length)
  }

  useEffect(() => {
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [next])

  if (!haberler.length) return null

  const haber = haberler[current]

  return (
    <div className="hero-slider">
      {haberler.map((h, i) => (
        <div key={h.id} className={`hero-slide ${i === current ? 'active' : ''}`}>
          {h.image ? (
            <img src={h.image} alt={h.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--md-primary-container) 0%, var(--md-tertiary-container) 100%)',
            }} />
          )}
        </div>
      ))}

      <div className="hero-overlay">
        <span className="hero-category">Manset</span>
        <Link href={`/haber/${haber.id}`}>
          <h1 className="hero-title">{haber.title}</h1>
        </Link>
        <p className="hero-meta">{formatTarih(haber.pubDate)}</p>
      </div>

      {/* Navigation arrows */}
      {haberler.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(8px)',
              color: '#fff', border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,.7)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,.4)')}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            style={{
              position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(8px)',
              color: '#fff', border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,.7)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,.4)')}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Indicator dots */}
      <div className="hero-dots">
        {haberler.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  )
}
