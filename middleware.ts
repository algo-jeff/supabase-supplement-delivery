import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('auth-session');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // 로그인 페이지가 아닌데 세션이 없으면 로그인 페이지로 리다이렉트
  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 로그인 페이지인데 세션이 있으면 홈으로 리다이렉트
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};