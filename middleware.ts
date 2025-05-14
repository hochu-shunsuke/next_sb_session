import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf';

export async function middleware(request: NextRequest) {
  // --- CORS Preflight Request Handling ---
  if (request.method === 'OPTIONS') {
    // 適切なCORSヘッダーを設定して200 OKで応答
    const corsHeaders = {
      'Access-Control-Allow-Origin': request.headers.get('Origin') || '*', // リクエスト元のオリジンを許可、または '*' ですべて許可
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token, Authorization', // アプリケーションで使用するヘッダーを列挙
      'Access-Control-Max-Age': '86400', // プリフライトレスポンスをキャッシュする時間 (秒)
    };
    return new NextResponse(null, { status: 204, headers: corsHeaders }); // 204 No Content も一般的
  }
  // --- CORS Preflight Request Handling ここまで ---

  // リクエストヘッダーを保持したレスポンスオブジェクトを初期化
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // --- CSRF保護 ---
  if (request.method === 'GET') {
    // GETリクエストの場合、新しいCSRFトークンを生成してクッキーにセット
    const csrfToken = generateCsrfToken();
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // クライアントサイドJSから読み取り可能にする
      secure: process.env.NODE_ENV !== 'development', // 本番環境ではHTTPSのみ
      sameSite: 'strict', // 同一サイトからのリクエストのみ許可
      path: '/', // ルートパスに適用
    });
  } else if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    // 状態変更を伴う可能性のあるメソッドの場合、CSRFトークンを検証
    const requestCsrfTokenHeader = request.headers.get('X-CSRF-Token');
    let requestCsrfTokenBody: string | null = null;

    // リクエストボディからCSRFトークンを抽出する試み
    const contentType = request.headers.get('content-type');
    if (contentType) {
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        try {
          const formData = await request.clone().formData();
          requestCsrfTokenBody = formData.get('csrf_token') as string | null;
        } catch (error) {
          // formDataのパースに失敗した場合は何もしない (トークンはヘッダーから取得されることを期待)
        }
      } else if (contentType.includes('application/json')) {
          try {
              const jsonBody = await request.clone().json();
              requestCsrfTokenBody = jsonBody.csrf_token as string | null;
          } catch (error) {
            // JSONボディのパースに失敗した場合は何もしない
          }
      }
    }

    // ヘッダーまたはボディから取得したCSRFトークン
    const sentCsrfToken = requestCsrfTokenHeader || requestCsrfTokenBody;
    // クッキーに保存されているCSRFトークン
    const cookieCsrfToken = request.cookies.get('csrf-token')?.value;

    // 送信されたトークンとクッキーのトークンを比較
    if (!sentCsrfToken || !cookieCsrfToken || sentCsrfToken !== cookieCsrfToken) {
      console.warn('CSRF token mismatch. Sent:', sentCsrfToken, 'Cookie:', cookieCsrfToken, 'Path:', request.nextUrl.pathname);
      return new NextResponse('CSRF token mismatch', { status: 403 });
    }
  }
  // --- CSRF保護ここまで ---

  // --- Supabaseクライアント初期化とセッション管理 ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // リクエストからクッキーを取得する関数
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // レスポンスにクッキーをセットする関数
        set(name: string, value: string, options: CookieOptions) {
          // response.cookies.set を使用して、レスポンスオブジェクトにクッキーを設定
          response.cookies.set(name, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', // 本番環境ではtrue
            sameSite: 'lax', // CSRF対策としてLaxを推奨 (StrictだとOAuthコールバックで問題が起きる可能性)
            path: '/',
            ...options,
          })
        },
        // レスポンスからクッキーを削除する関数
        remove(name: string, options: CookieOptions) {
          // response.cookies.set を使用して、クッキーを空の値と過去の有効期限で設定し削除
          response.cookies.set(name, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
            path: '/',
            ...options,
          })
        },
      },
    }
  )
  // --- Supabaseクライアント初期化ここまで ---

  try {
    // --- 認証チェックとリダイレクト ---
    // Supabaseのユーザー情報を取得 (getSession() から getUser() に変更)
    const {
      data: { user }, // session から user に変更
    } = await supabase.auth.getUser() // getSession() から getUser() に変更

    // 現在のパスを取得
    const { pathname } = request.nextUrl

    // ログイン状態とアクセスしようとしているパスに基づいてリダイレクト処理
    if (user) {
      // ログイン済みユーザーがアクセスしようとしているパスが /login または /signup の場合
      if (pathname === '/login' || pathname === '/signup') {
        // ダッシュボードページにリダイレクト
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } else {
      // 未ログインユーザーがアクセスしようとしているパスが保護されたルートの場合
      // (例: /dashboard, /settings など、'/', '/login', '/signup', '/auth/callback' 以外)
      if (!['/', '/login', '/signup', '/auth/callback'].includes(pathname) && !pathname.startsWith('/api')) {
        // ログインページにリダイレクト (リダイレクト後の戻り先として現在のパスを保持)
        return NextResponse.redirect(new URL(`/login?redirect_to=${pathname}`, request.url))
      }
    }
    // --- 認証チェックとリダイレクトここまで ---

  } catch (e) {
    // エラーが発生した場合は、エラーメッセージを含むレスポンスを返す
    // (Supabaseクライアントの初期化に失敗した場合など)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  // すべての処理が完了したら、最終的なレスポンスを返す
  return response
}

// configオブジェクトでミドルウェアが適用されるパスを指定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - site (public/site files)
     */
    '/((?!_next/static|_next/image|favicon.ico|site).*)',
  ],
}
