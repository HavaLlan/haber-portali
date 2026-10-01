import { prisma } from '@/lib/prisma'
import HaberYonetimPaneli from '@/components/admin/HaberYonetimPaneli'

export const dynamic = 'force-dynamic'

async function getHaberler() {
  try {
    return await prisma.haber.findMany({
      orderBy: { createdAt: 'desc' },
      take: 150,
    })
  } catch {
    return []
  }
}

export default async function AdminHaberlerSayfasi() {
  const haberler = await getHaberler()
  return <HaberYonetimPaneli initialHaberler={haberler} />
}