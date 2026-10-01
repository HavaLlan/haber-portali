import { NextRequest, NextResponse } from 'next/server'
import { sosyalMedyaMetni } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()
    if (!title) return NextResponse.json({ hata: 'Baslik gerekli' }, { status: 400 })
    const sonuc = await sosyalMedyaMetni({ title, description: description || '' })
    return NextResponse.json(sonuc)
  } catch (error) {
    return NextResponse.json({ hata: (error as Error).message }, { status: 500 })
  }
}