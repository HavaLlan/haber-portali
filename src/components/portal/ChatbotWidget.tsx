'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'

interface Mesaj {
  rol: 'kullanici' | 'asistan'
  metin: string
}

interface Props {
  haberler: Array<{ title: string; description: string; pubDate: Date | string | null }>
}

export default function ChatbotWidget({ haberler }: Props) {
  const [acik, setAcik] = useState(false)
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([
    { rol: 'asistan', metin: 'Merhaba! Ben Beyaz Belge AI asistaniyim. Bugunun haberleri hakkinda sorularinizi yanıtlayabilirim.' }
  ])
  const [girdi, setGirdi] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const mesajlarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mesajlarRef.current) {
      mesajlarRef.current.scrollTop = mesajlarRef.current.scrollHeight
    }
  }, [mesajlar])

  async function gonder(e: React.FormEvent) {
    e.preventDefault()
    if (!girdi.trim() || yukleniyor) return

    const soru = girdi.trim()
    setGirdi('')
    setMesajlar(prev => [...prev, { rol: 'kullanici', metin: soru }])
    setYukleniyor(true)

    try {
      const res = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soru, haberler }),
      })
      const data = await res.json()
      setMesajlar(prev => [...prev, {
        rol: 'asistan',
        metin: data.yanit || 'Uzgunum, bir hata olustu.'
      }])
    } catch {
      setMesajlar(prev => [...prev, {
        rol: 'asistan',
        metin: 'Baglanti hatasi. Lutfen tekrar deneyin.'
      }])
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <div className="chatbot-bubble">
      <div className={`chatbot-window ${!acik ? 'closed' : ''}`}>
        <div className="chatbot-header">
          <Bot size={24} />
          <div>
            <div style={{ font: 'var(--md-title-small)' }}>BB Haber Asistani</div>
            <div style={{ font: 'var(--md-body-small)', opacity: .8 }}>AI Destekli</div>
          </div>
          <button
            onClick={() => setAcik(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="chatbot-messages" ref={mesajlarRef}>
          {mesajlar.map((m, i) => (
            <div key={i} className={`chat-msg ${m.rol === 'kullanici' ? 'chat-msg-user' : 'chat-msg-bot'}`}>
              {m.metin}
            </div>
          ))}
          {yukleniyor && (
            <div className="chat-msg chat-msg-bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={14} className="animate-spin" />
              Dusunuyor...
            </div>
          )}
        </div>

        <form className="chatbot-input-row" onSubmit={gonder}>
          <input
            className="chatbot-input"
            type="text"
            placeholder="Soru sorun..."
            value={girdi}
            onChange={(e) => setGirdi(e.target.value)}
            disabled={yukleniyor}
          />
          <button
            type="submit"
            disabled={yukleniyor || !girdi.trim()}
            style={{
              background: 'var(--md-primary)',
              color: 'var(--md-on-primary)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              opacity: (!girdi.trim() || yukleniyor) ? 0.5 : 1,
              transition: 'opacity .2s',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      <button className="chatbot-toggle" onClick={() => setAcik(!acik)}>
        {acik ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
