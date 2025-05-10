'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useUser } from '@/context/UserContext'

export default function Navbar() {
  const { user } = useUser()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav className="fixed top-0 w-full z-20 bg-white border-b dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
          オルキャリ
        </Link>

        <button
          className="md:hidden text-gray-500 dark:text-gray-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        <div className={`flex-col md:flex-row md:flex items-center space-y-2 md:space-y-0 md:space-x-6 ${isOpen ? 'flex' : 'hidden'} md:!flex`}>
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-100 hover:underline">
                ダッシュボード
              </Link>
              <button onClick={handleLogout} className="text-gray-700 dark:text-gray-100 hover:underline">
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 dark:text-gray-100 hover:underline">
                ログイン
              </Link>
              <Link href="/signup" className="text-gray-700 dark:text-gray-100 hover:underline">
                登録
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
