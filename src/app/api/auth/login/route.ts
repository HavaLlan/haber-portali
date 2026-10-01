import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Basit doğrulama (Gelişmiş projelerde DB kontrolü yapılır)
    if (username === 'admin' && password === 'admin123') {
      
      // Cookie ayarla
      cookies().set('admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 hafta
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Giriş yapılamadı' }, { status: 500 })
  }
}
