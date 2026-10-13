import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === 'ADMIN';
  const isAuthPage = pathname.startsWith('/auth');
  const isPublicPage = pathname === '/terms' || pathname === '/privacy';

  if (isAuthPage) {
    if (isLoggedIn && pathname !== '/auth/forgot-password') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (isPublicPage) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const url = new URL('/auth/login', req.url);
    url.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (pathname === '/' && isAdmin) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
