import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf';

export async function middleware(request: NextRequest) {
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
    // Supabaseのセッション情報を取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // 保護されたルートへのアクセス制御
    // '/dashboard' で始まるパスにアクセスしようとしていて、かつセッションがない（未ログイン）場合
    if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
      // ログインページへリダイレクト
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // --- 認証チェックとリダイレクトここまで ---

  } catch (error) {
    // Supabase関連の処理でエラーが発生した場合のフォールバック
    // CSRFトークンの検証で問題があった場合は、既にレスポンスが返されているため、ここは実行されない
    console.error("Error in Supabase session handling:", error);
    // エラーが発生しても、基本的なレスポンス処理は継続させる
    // (例えば、CSRFクッキーのセットは上の処理で行われているため、それを返す)
  }

  // 全ての処理が完了したら、最終的なレスポンスを返す
  return response
}

// ミドルウェアが適用されるパスのパターン
export const config = {
  matcher: [
    // APIルート、Next.jsの内部ルート、静的ファイル（画像など）を除外する正規表現
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
