'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const supabase = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )).current

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getUser()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div>
          <h2 style={{ color: '#000000' }}>ユーザー情報</h2>
          {user && (
            <div style={{ color: '#000000' }}>
              <p>メールアドレス: {user.email}</p>
              <p>ユーザーID: {user.id}</p>
              <p>最終ログイン: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ja-JP') : '未ログイン'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
