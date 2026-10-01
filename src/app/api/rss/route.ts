import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchRSSFeed } from '@/lib/rss'

// Anahtar kelimelere göre otomatik kategori atama
function kategoriTahmin(title: string, description: string, rssKategori?: string): string {
  const metin = (title + ' ' + (description || '') + ' ' + (rssKategori || '')).toLowerCase()

  if (rssKategori) {
    const rssMap: Record<string, string> = {
      'spor': 'spor', 'sport': 'spor',
      'ekonomi': 'ekonomi', 'ekonomik': 'ekonomi', 'piyasa': 'ekonomi',
      'siyaset': 'siyaset', 'politika': 'siyaset', 'seçim': 'siyaset', 'meclis': 'siyaset',
      'gündem': 'gundem', 'güncel': 'gundem',
    }
    for (const [anahtar, kategori] of Object.entries(rssMap)) {
      if (rssKategori.toLowerCase().includes(anahtar)) return kategori
    }
  }

  const afyonKelimeler = ['afyon', 'kütahya', 'afyonkarahisar', 'sandıklı', 'dinar', 'emirdağ', 'çay', 'bolvadin', 'sincanlı', 'ihsaniye']
  if (afyonKelimeler.some(k => metin.includes(k))) return 'afyon'

  const sporKelimeler = ['futbol', 'basketbol', 'maç', 'gol', 'şampiyonat', 'lig', 'spor', 'stadyum', 'kulüp', 'transfer', 'takım', 'galatasaray', 'fenerbahçe', 'beşiktaş']
  if (sporKelimeler.some(k => metin.includes(k))) return 'spor'

  const ekonomiKelimeler = ['ekonomi', 'enflasyon', 'dolar', 'euro', 'faiz', 'borsa', 'piyasa', 'bütçe', 'merkez bankası', 'büyüme', 'ihracat', 'ithalat', 'turizm geliri', 'yatırım']
  if (ekonomiKelimeler.some(k => metin.includes(k))) return 'ekonomi'

  const siyasetKelimeler = ['cumhurbaşkanı', 'erdoğan', 'meclis', 'tbmm', 'seçim', 'siyaset', 'hükümet', 'bakan', 'parti', 'ak parti', 'chp', 'mhp', 'bakanlar kurulu']
  if (siyasetKelimeler.some(k => metin.includes(k))) return 'siyaset'

  const gundemKelimeler = ['deprem', 'yangın', 'kaza', 'trafik', 'mahkeme', 'suç', 'polis', 'jandarma', 'olay', 'mülteci', 'sağlık', 'koronavirüs', 'pandemi']
  if (gundemKelimeler.some(k => metin.includes(k))) return 'gundem'

  return 'diger'
}

export async function POST() {
  try {
    const items = await fetchRSSFeed()
    
    let yeni = 0
    let guncellendi = 0

    for (const item of items) {
      const mevcutHaber = await prisma.haber.findUnique({
        where: { rssId: item.id }
      })

      const kategori = kategoriTahmin(item.title, item.description || '', (item as any).categories?.[0])

      if (!mevcutHaber) {
        await prisma.haber.create({
          data: {
            rssId: item.id,
            title: item.title,
            description: item.description,
            content: item.content,
            pubDate: item.pubDate,
            link: item.link,
            image: item.image,
            kategori,
            status: 'aktif',
            kaynak: 'rss',
          }
        })
        yeni++
      } else {
        guncellendi++
      }
    }

    return NextResponse.json({
      success: true,
      mesaj: `${yeni} yeni haber eklendi, ${guncellendi} haber zaten mevcut.`,
      toplam: items.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, hata: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const items = await fetchRSSFeed()
    return NextResponse.json({ success: true, haberler: items })
  } catch (error) {
    return NextResponse.json(
      { success: false, hata: (error as Error).message },
      { status: 500 }
    )
  }
}