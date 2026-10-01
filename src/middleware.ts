import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // admin yolları için auth kontrolü
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    const authCookie = req.cookies.get('admin_auth')
    
    // Eğer cookie yoksa veya değeri yanlışsa login sayfasına yönlendir
    if (!authCookie || authCookie.value !== 'true') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
