import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const haber = await prisma.haber.findUnique({ where: { id: parseInt(params.id) } })
    if (!haber) return NextResponse.json({ hata: 'Haber bulunamadi' }, { status: 404 })
    return NextResponse.json({ haber })
  } catch (error) {
    return NextResponse.json({ hata: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const haber = await prisma.haber.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.link !== undefined && { link: body.link }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.socialImage !== undefined && { socialImage: body.socialImage }),
      }
    })
    return NextResponse.json({ haber })
  } catch (error) {
    return NextResponse.json({ hata: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.haber.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ basarili: true })
  } catch (error) {
    return NextResponse.json({ hata: (error as Error).message }, { status: 500 })
  }
}