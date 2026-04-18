import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
const cookieName = process.env.COOKIE_NAME || 'market_session';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(cookieName)?.value;
  const pathname = req.nextUrl.pathname;

  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/hesabim') || pathname.startsWith('/sepet') || pathname.startsWith('/favoriler'))) {
    return NextResponse.redirect(new URL('/giris', req.url));
  }

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;
      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch {
      const response = NextResponse.redirect(new URL('/giris', req.url));
      response.cookies.delete(cookieName);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/hesabim/:path*', '/sepet', '/favoriler']
};
