import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * クライアント（ブラウザ）用の Supabase クライアントを生成
 * CSR 環境で使用
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

//サーバサイドで現在のユーザセッションを取得
export const getSession = async (request: NextRequest, response: NextResponse) => {
  const supabase = createSupabaseServerClient(request, response);
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

/**
 * ミドルウェア用 Supabase クライアントを生成
 * ミドルウェア環境で使用
 */
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value || '';
        },
        set(name: string, value: string, options?: { expires?: Date; path?: string; domain?: string; secure?: boolean }) {
          response.cookies.set(name, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            ...options,
          });
        },
        remove(name: string, options?: { path?: string; domain?: string }) {
          response.cookies.set(name, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            ...options,
          });
        },
      },
      cookieOptions: {
        name: 'sb-auth-token',
        domain: process.env.NODE_ENV === 'production' ? '.example.com' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }
  );
}

/**
 * サーバー用 Supabase クライアントを生成
 */
export function createSupabaseServerClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value || '';
        },
        set(name: string, value: string, options?: { expires?: Date; path?: string; domain?: string; secure?: boolean }) {
          response.cookies.set(name, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            ...options,
          });
        },
        remove(name: string, options?: { path?: string; domain?: string }) {
          response.cookies.set(name, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: new Date(0),
            ...options,
          });
        },
      },
    }
  );
}

/**
 * Auth code をセッションに交換するロジックを集中化
 */
export async function handleAuthCode(request: NextRequest, response: NextResponse, code: string) {
  const supabase = createSupabaseServerClient(request, response);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return { error: error.message };
  }

  return { user: data?.user };
}
