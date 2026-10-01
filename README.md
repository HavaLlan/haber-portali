# Beyaz Belge - Haber Portali

Modern haber portali ve yonetim paneli.

## Kurulum

### 1. Gereksinimleri yukleyin
```bash
npm install
```

### 2. Veritabanini olusturun
```bash
npm run db:push
```

### 3. Cevre degiskenlerini ayarlayin
`.env.local` dosyasini ac ve AI API anahtarini ekle:
```
GEMINI_API_KEY=your_key_here
```

### 4. Gelistirme sunucusunu baslat
```bash
npm run dev
```

Tarayicida acin: [http://localhost:3000](http://localhost:3000)

## Sayfalar

| Sayfa | URL |
|-------|-----|
| Ana Portal | http://localhost:3000 |
| Admin Paneli | http://localhost:3000/admin |
| Haber Yonetimi | http://localhost:3000/admin/haberler |
| Damga Sistemi | http://localhost:3000/admin/damga |

## Ozellikler

- RSS otomatik cekme (beyazbelge.com/rss)
- Aktif/Pasif haber yonetimi
- AI ile haber yazma (Gemini API)
- Sosyal medya metni olusturma
- Damga sistemi (1080x1080 / 1080x1350 PNG)
- AI sohbet asistani (chatbot widget)
- Material Design 3 tasar.m dili
- Ubuntu Sans tipografisi
- Tam TypeScript destegi
- SQLite + Prisma ORM