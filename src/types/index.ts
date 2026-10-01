export type KategoriKey = 'tumu' | 'afyon' | 'gundem' | 'siyaset' | 'ekonomi' | 'spor' | 'diger'

export interface Haber {
  id: number
  rssId: string | null
  title: string
  description: string | null
  content: string | null
  pubDate: Date | string | null
  link: string | null
  image: string | null
  socialImage: string | null
  kategori: string
  status: string
  kaynak: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface HaberForm {
  title: string
  description: string
  content: string
  image: string
  link: string
  kategori: string
  status: string
}

export interface ChatMesaj {
  rol: 'kullanici' | 'asistan'
  metin: string
  zaman: Date
}
