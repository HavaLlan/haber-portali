/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', 'rss-parser']
  }
}

module.exports = nextConfig