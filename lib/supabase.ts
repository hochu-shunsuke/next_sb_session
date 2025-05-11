import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { type CookieOptions } from '@supabase/ssr'

/**
 * サーバー用 Supabase クライアントを生成
 * SSR や RSC 環境で使用する
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Cookie の取得（サーバーでセッションを読み取る時に使用）
        async get(name: string) {
          return cookieStore.get(name)?.value
        },

        // Cookie の設定（通常は Server Component では無効、middlewareなどが代行）
        async set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options } as ResponseCookie)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_error) {
            // Server Component でこのメソッドを使うと無視されるため例外を握り潰す
            // セッションの更新は middleware 等で行う前提
          }
        },

        // Cookie の削除（値を空にして上書き）
        async remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options } as ResponseCookie)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_error) {
            // Server Component では削除も無効なので例外を無視
          }
        },
      },
    }
  )
}
