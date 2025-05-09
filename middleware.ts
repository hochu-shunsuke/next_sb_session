import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // レスポンスオブジェクトを作成（ヘッダーなども含めて返す）
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Supabase クライアントを作成（middleware用）
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // クッキーから値を取得（セッション確認に必要）
        get(name: string) {
          return request.cookies.get(name)?.value
        },

        // クッキーをセット（セッション更新やログイン時など）
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, {
            httpOnly: true,         // JS からアクセス不可
            secure: true,           // HTTPS のみ
            sameSite: 'lax',        // CSRF 対策：同一サイト or リンクからのみ許可
            path: '/',              // サイト全体に適用
            ...options,             // 呼び出し元で渡されたオプションを上書き
          })
        },

        // クッキーを削除（ログアウト時など）
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, '', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            ...options,
          })
        },
      },
    }
  )

  // 現在のセッションを取得（ログイン状態の確認）
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証が必要なパスにアクセスしていて、ログインしていない場合は /login にリダイレクト
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 問題がなければリクエストをそのまま通す
  return response
}

// ミドルウェアを適用するパスを定義（静的ファイルなどは除外）
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
