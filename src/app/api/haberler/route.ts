import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sadecAktif = searchParams.get('status') === 'aktif'
  const sayfa = parseInt(searchParams.get('sayfa') || '1')
  const limitSayisi = parseInt(searchParams.get('limit') || '20')

  try {
    const where = sadecAktif ? { status: 'aktif' } : {}
    const [haberler, toplam] = await Promise.all([
      prisma.haber.findMany({
        where,
        orderBy: { pubDate: 'desc' },
        skip: (sayfa - 1) * limitSayisi,
        take: limitSayisi,
      }),
      prisma.haber.count({ where }),
    ])

    return NextResponse.json({ haberler, toplam, sayfa, limit: limitSayisi })
  } catch (error) {
    return NextResponse.json({ hata: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const haber = await prisma.haber.create({
      data: {
        title: body.title,
        description: body.description || null,
        content: body.content || null,
        image: body.image || null,
        link: body.link || null,
        kategori: body.kategori || 'diger',
        status: body.status || 'aktif',
        kaynak: body.kaynak || 'manuel',
        pubDate: new Date(),
      }
    })
    return NextResponse.json({ haber }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ hata: (error as Error).message }, { status: 500 })
  }
}