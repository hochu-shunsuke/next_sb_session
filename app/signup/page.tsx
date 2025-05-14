'use client'

import Link from 'next/link'
import { FormEvent, useState, useEffect } from 'react' // useEffect をインポート
import { getCookie } from 'cookies-next'; // cookies-next をインポート

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined); // CSRFトークン用のstate

  // コンポーネントマウント時にCookieからCSRFトークンを取得
  useEffect(() => {
    const token = getCookie('csrf-token');
    if (typeof token === 'string') {
      setCsrfToken(token);
    }
  }, []);

  // サインアップ処理
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault() // フォームのデフォルト送信をキャンセル
    setError(null)     // エラーメッセージをリセット
    setIsLoading(true) // ローディング状態を開始
    setIsSuccess(false)  // 成功状態をリセット

    // CSRFトークンが取得できているか確認
    if (!csrfToken) {
      setError('CSRFトークンが見つかりません。ページをリロードして再度お試しください。');
      setIsLoading(false);
      return;
    }

    try {
      // バックエンドのサインアップAPIルートを呼び出し
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken, // CSRFトークンをヘッダーに含める
        },
        body: JSON.stringify({
          email,
          password,
          options: {
            // メール認証後のリダイレクト先をクライアントのオリジンに設定
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
          // ミドルウェアはヘッダーの X-CSRF-Token を優先的にチェックするため、
          // ボディに csrf_token を含める必要は通常ありません。
          // もしミドルウェアがボディもチェックするように拡張されている場合は、
          // csrf_token: csrfToken, のように追加することも可能です。
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // APIからのエラーレスポンスを処理
        setError(responseData.error || 'アカウント作成に失敗しました。');
        return;
      }

      // サインアップ成功（メール認証待ちの場合も含む）
      setIsSuccess(true);
      // responseData.message があれば表示することも検討
      // alert(responseData.message || 'アカウント作成処理を受け付けました。');

    } catch (_fetchError: unknown) {
      // fetch自体が失敗した場合 (ネットワークエラーなど)
      console.error('Fetch error during signup:', _fetchError);
      setError('サインアップ処理中にエラーが発生しました。ネットワーク接続を確認してください。');
    } finally {
      setIsLoading(false); // ローディング状態を終了
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              サインアップ完了
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              認証メールを送信しました．ご登録いただいたアドレスの受信ボックスをご確認ください．
            </p>
          </div>
          <div>
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ログインページへ移動
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウント作成
          </h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <p className='text-black'>読み込み中です</p>
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
            <div className="text-sm text-center text-red-600">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? '処理中...' : 'アカウント作成'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              すでにアカウントをお持ちの方はこちら
            </Link>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
