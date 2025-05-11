import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const response = NextResponse.redirect(new URL('/dashboard', request.url)) // 先にレスポンスオブジェクトを作成

  if (code) {
    // const cookieStore = cookies() // 直接使わない
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value // request オブジェクトから取得
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ // response オブジェクトに設定
              name,
              value,
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV !== 'development',
              sameSite: 'lax',
              path: '/',
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ // response オブジェクトに設定 (値を空に)
              name,
              value: '',
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV !== 'development',
              sameSite: 'lax',
              path: '/',
            })
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  return response // 変更されたクッキーを含むレスポンスを返す
}
