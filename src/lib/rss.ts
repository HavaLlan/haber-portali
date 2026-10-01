import Parser from 'rss-parser'

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ]
  }
})

export interface RSSItem {
  id: string
  title: string
  description: string
  content: string
  pubDate: Date
  link: string
  image: string | null
}

function extractImage(item: any): string | null {
  // Attempt to extract image from various RSS fields
  if (item.mediaContent?.$.url) return item.mediaContent.$.url
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url
  if (item.enclosure?.url) return item.enclosure.url
  // Try extracting from content HTML
  const imgMatch = (item.content || item['content:encoded'] || '').match(/<img[^>]+src=["']([^"']+)["']/)
  if (imgMatch) return imgMatch[1]
  return null
}

export async function fetchRSSFeed(): Promise<RSSItem[]> {
  const RSS_URL = 'https://beyazbelge.com/rss'
  
  try {
    const feed = await parser.parseURL(RSS_URL)
    return feed.items.map((item) => ({
      id: item.guid || item.link || item.title || '',
      title: item.title || '',
      description: item.contentSnippet || item.summary || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      link: item.link || '',
      image: extractImage(item),
    }))
  } catch (error) {
    console.error('RSS fetch error:', error)
    throw new Error('RSS feed alınamadı: ' + (error as Error).message)
  }
}
