import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Next.js + Supabase認証デモ
        </h1>
        <p className="text-xl text-gray-600">
          シンプルな認証機能を備えたアプリケーションです
        </p>
        <div className="space-x-4">
          <Link
            href="/signup"
            className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            新規登録
          </Link>
          <Link
            href="/login"
            className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            ログイン
          </Link>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            ダッシュボード
          </Link>
        </div>
      </div>
    </div>
  )
}
