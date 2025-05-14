'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import { getCookie } from 'cookies-next'; // cookies-next をインポート

export default function Navbar({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const isLoggedIn = !!user;
  const router = useRouter()


  const handleLogout = async () => {
    const csrfToken = getCookie('csrf-token'); // CSRFトークンを取得

    if (!csrfToken || typeof csrfToken !== 'string') {
      console.error('CSRF token not found or is not a string for logout');
      // ここでユーザーにエラーを通知するか、何らかのフォールバック処理を検討
      alert('ログアウト処理に失敗しました。ページをリロードして再度お試しください。');
      return;
    }

    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          // Content-Typeはボディがない場合は不要なこともありますが、
          // ミドルウェアがJSONボディを期待する可能性があるため、
          // CSRFトークンのみのJSONボディを送る場合は指定します。
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        // APIがボディを期待していなくても、ミドルウェアがチェックするため送信
        body: JSON.stringify({ csrf_token: csrfToken }),
      });

      if (!response.ok) {
        // サーバーからのエラーレスポンスを処理
        const errorData = await response.json().catch(() => ({})) // JSONパース失敗時のフォールバック
        console.error('Logout failed with status:', response.status, errorData);
        alert(`ログアウトに失敗しました: ${errorData.error || response.statusText}`);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Logout fetch error:', error);
      alert('ログアウト中にエラーが発生しました。ネットワーク接続を確認してください。');
    }
  }

  return (
    <nav className="bg-white fixed w-full z-20 top-0 start-0 border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto w-full flex flex-wrap items-center justify-between p-4">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/site/orcareer.webp" alt="オルキャリ" width={120} height={32} className="object-contain"/>

        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-700 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <span className="sr-only">メニューを開く</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div className={`${isOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`}>
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-white md:flex-row md:space-x-8 md:mt-0 md:border-0">
            {isLoggedIn ? (
              <>
                <li>
                  <Link href="/dashboard" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0">
                    ダッシュボード
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
                  >
                    ログアウト
                  </button>
                </li>
                <li>
                  <span className="text-gray-700">{user.email}</span>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0">
                    登録
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}