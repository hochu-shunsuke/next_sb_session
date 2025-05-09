'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-black font-semibold">ダッシュボード</h1>
            </div>
            <p className="text-black">ここは今app/dashboardで直接書いてるけど，ナビゲーションバーのcomponentは作成します．</p>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div>
          <h2 style={{ color: '#000000' }}>ユーザー情報</h2>
          {user && (
            <div style={{ color: '#000000' }}>
              <p>メールアドレス: {user.email}</p>
              <p>ユーザーID: {user.id}</p>
              <p>最終ログイン: {new Date(user.last_sign_in_at).toLocaleString('ja-JP')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
