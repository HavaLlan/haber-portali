import { NextRequest, NextResponse } from 'next/server'
import { chatbotYanit } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { soru, haberler } = await request.json()
    if (!soru) return NextResponse.json({ hata: 'Soru gerekli' }, { status: 400 })
    const yanit = await chatbotYanit(soru, haberler || [])
    return NextResponse.json({ yanit })
  } catch (error) {
    return NextResponse.json({ 
      yanit: 'Uzgunum, AI servisi su an kullanilabilir degil. API anahtarinizi kontrol edin.',
      hata: (error as Error).message 
    })
  }
}