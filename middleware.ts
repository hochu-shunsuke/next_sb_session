import { createMiddlewareClient } from '@/lib/supabase';
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createMiddlewareClient(request, response);

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('セッション取得に失敗:', error.message);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = data?.session;

  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// ミドルウェアを適用するパスを定義（静的ファイルなどは除外）
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
