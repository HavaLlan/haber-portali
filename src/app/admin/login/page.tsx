'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, LogIn, Loader2 } from 'lucide-react'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (res.ok) {
        // Yönlendir (Middleware cookie'yi görüp izin verecek)
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Giriş başarısız')
      }
    } catch {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--md-surface-container-lowest)',
      padding: '24px'
    }}>
      <div className="m3-card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'var(--md-primary-container)',
            color: 'var(--md-on-primary-container)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={24} />
          </div>
          <h1 style={{ font: 'var(--md-headline-small)', color: 'var(--md-on-surface)', marginBottom: '8px' }}>
            Yönetici Girişi
          </h1>
          <p style={{ font: 'var(--md-body-medium)', color: 'var(--md-on-surface-variant)' }}>
            Lütfen yönetici bilgilerinizi girin.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="m3-field">
            <label>Kullanıcı Adı</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          
          <div className="m3-field">
            <label>Şifre</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ 
              color: 'var(--md-error)', 
              font: 'var(--md-body-small)', 
              textAlign: 'center',
              padding: '8px',
              background: 'var(--md-error-container)',
              borderRadius: 'var(--md-radius-sm)'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="m3-btn m3-btn-filled" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  )
}
