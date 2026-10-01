import { NextRequest, NextResponse } from 'next/server'
import { aiGenerate } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { konu } = await req.json()
    if (!konu?.trim()) {
      return NextResponse.json({ hata: 'Konu boş olamaz.' }, { status: 400 })
    }

    const openAiKey = process.env.OPENAI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY
    
    if ((!openAiKey || openAiKey === 'your_openai_api_key_here') && (!geminiKey || geminiKey === 'buraya-api-anahtarinizi-girin')) {
      // Demo modu: Hiçbir API yoksa örnek haber döndür
      return NextResponse.json({
        baslik: `${konu} — Gelişmeler Takip Ediliyor`,
        spot: `${konu} konusunda yeni gelişmeler yaşandı. Yetkililer konuyla ilgili açıklama yaptı.`,
        icerik: `${konu}\n\nYetkililerden yapılan açıklamaya göre, söz konusu gelişme yakından takip edilmektedir. Vatandaşların dikkatli olması tavsiye edilirken, yetkililerin çalışmalarını sürdürdüğü belirtildi.\n\nAyrıntılı bilgi ilerleyen saatlerde açıklanacak.`,
      })
    }

    const prompt = `Sen Beyaz Belge haber sitesinin editörüsün. Sana verilen konudan yola çıkarak:
1. Türkçe, insani, akıcı ve SEO dostu bir haber metni yaz.
2. Haber gerçekçi ve tarafsız olmalı.
3. Aşağıdaki JSON formatında yanıt ver (başka hiçbir metin ekleme):

{
  "baslik": "Haberin çarpıcı ve kısa başlığı",
  "spot": "Haberin özet cümlesi (1-2 cümle, en önemli bilgiyi içermeli)",
  "icerik": "Haberin tam metni (3-5 paragraf, akıcı Türkçe)"
}

Konu: ${konu}`

    const raw = await aiGenerate(prompt)
    
    // JSON parse et
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI geçerli format döndürmedi')
    
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json(
      { hata: (error as Error).message },
      { status: 500 }
    )
  }
}
