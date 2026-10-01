// AI servis katmanı - Gemini API entegrasyonu
// .env.local dosyasına GEMINI_API_KEY ekleyin

export async function aiGenerate(prompt: string): Promise<string> {
  const openAiKey = process.env.OPENAI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  if (openAiKey && openAiKey !== 'your_openai_api_key_here') {
    // OpenAI Kullan
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(`OpenAI API Hatası: ${err.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } 
  
  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    // Gemini Kullan
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(`Gemini API Hatası: ${err.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  throw new Error('Ne OPENAI_API_KEY ne de GEMINI_API_KEY tanımlanmamış.')
}

export async function haberYeniden(konu: string, mevcutMetin?: string): Promise<{
  title: string
  description: string
  content: string
}> {
  const prompt = `Sen profesyonel bir Türk haber muhabirisin. Aşağıdaki konu veya metni alarak SEO dostu, samimi, akıcı ve doğal bir Türkçe haber metni yaz.

${mevcutMetin ? `Mevcut haber metni:\n${mevcutMetin}\n\n` : ''}Konu: ${konu}

Lütfen şu formatta JSON olarak yanıt ver (başka hiçbir şey ekleme):
{
  "title": "Haber başlığı (dikkat çekici, SEO dostu)",
  "description": "Haberin özeti / spot metni (2-3 cümle, en önemli bilgiler)",
  "content": "Haberin tam metni (paragraflar halinde, insani ve akıcı dil, HTML etiketleri olmadan)"
}`

  const raw = await aiGenerate(prompt)
  
  // JSON bloğunu ayıkla
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI geçerli JSON döndürmedi')
  
  return JSON.parse(jsonMatch[0])
}

export async function sosyalMedyaMetni(haber: {
  title: string
  description: string
}): Promise<{ instagram: string; tiktok: string }> {
  const prompt = `Aşağıdaki haberi sosyal medya formatında yaz.

Haber: ${haber.title}
Özet: ${haber.description}

Şu formatta JSON döndür (başka hiçbir şey ekleme):
{
  "instagram": "Instagram paylaşım metni (hook + emoji + 5 hashtag, max 300 karakter)",
  "tiktok": "TikTok video açıklaması (kısa, dikkat çekici hook + emoji + hashtag)"
}`

  const raw = await aiGenerate(prompt)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI geçerli JSON döndürmedi')
  return JSON.parse(jsonMatch[0])
}

export async function chatbotYanit(soru: string, haberler: Array<{title: string; description: string; pubDate: string | Date | null}>): Promise<string> {
  const haberListesi = haberler.slice(0, 20).map((h, i) =>
    `${i + 1}. ${h.title} (${h.pubDate ? new Date(h.pubDate).toLocaleDateString('tr-TR') : ''}): ${h.description}`
  ).join('\n')

  const prompt = `Sen Beyaz Belge haber portalının AI asistanısın. Kullanıcının sorularını güncel haberlere dayanarak yanıtla.

Güncel haberler:
${haberListesi}

Kullanıcı sorusu: ${soru}

Kısa, nazik ve bilgilendirici Türkçe yanıt ver (max 3 cümle). Eğer soru haberlerle ilgili değilse kibarca yönlendir.`

  return await aiGenerate(prompt)
}
