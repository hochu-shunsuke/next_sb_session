'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormEvent, useState } from 'react' // useEffectは不要になったため削除
import { getCookie } from 'cookies-next';

// ログインページコンポーネント
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  // CSRFトークンはhandleSubmit内で直接Cookieから取得するため、state管理は不要
  // const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
  // useEffectも不要

  // ログイン処理
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault() // フォームのデフォルト送信をキャンセル
    setError(null)     // エラーメッセージをリセット
    setIsLoading(true) // ローディング状態を開始

    // CookieからCSRFトークンを直接取得
    const currentCsrfToken = getCookie('csrf-token');

    // CSRFトークンが存在し、かつ文字列型であることを確認
    if (!currentCsrfToken || typeof currentCsrfToken !== 'string') {
      setError('ログイン処理に失敗しました。ページをリロードして再度お試しください。');
      setIsLoading(false);
      return;
    }

    try {
      // バックエンドのサインインAPIルートを呼び出し
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': currentCsrfToken, // CSRFトークンをヘッダーに含める
        },
        body: JSON.stringify({
          email,
          password,
          // ミドルウェアがヘッダーとボディの両方をチェックする場合があるため、ボディにもCSRFトークンを含める
          csrf_token: currentCsrfToken,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // APIからのエラーレスポンスを処理
        setError(responseData.error || 'メールアドレスまたはパスワードが正しくありません。');
        return;
      }

      // ログイン成功後、ダッシュボードページにリダイレクト
      router.push('/dashboard');
      router.refresh(); // サーバーコンポーネントの状態を更新 (例: Navbarのユーザー情報)

    } catch (_fetchError: unknown) {
      // fetch自体が失敗した場合 (ネットワークエラーなど)
      console.error('Fetch error during signin:', _fetchError); // エラーをコンソールに出力
      setError('ログイン処理中にエラーが発生しました。ネットワーク接続を確認してください。');
    } finally {
      setIsLoading(false); // ローディング状態を終了
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ログイン
          </h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <p className="text-black">読み込み中です</p>
            <div className="loader"></div>
          </div>
        ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? '処理中...' : 'ログイン'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              アカウントをお持ちでない方はこちら
            </Link>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
