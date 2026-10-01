import { NextRequest, NextResponse } from 'next/server'
import { haberYeniden } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { konu, mevcutMetin } = await request.json()
    if (!konu) return NextResponse.json({ hata: 'Konu gerekli' }, { status: 400 })
    const sonuc = await haberYeniden(konu, mevcutMetin)
    return NextResponse.json(sonuc)
  } catch (error) {
    return NextResponse.json({ hata: (error as Error).message }, { status: 500 })
  }
}