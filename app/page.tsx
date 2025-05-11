import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full text-center space-y-8">
        <Image src="/site/orcareer.webp" alt="オルキャリ" width={839} height={269} className="object-contain"/>
        <p className="text-xl text-gray-600">
          東海地方に特化した新卒就活サービス
        </p>
        <div className="space-x-4">
          <Link
            href="/signup"
            className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-zinc-700"
          >
            新規登録
          </Link>
          <Link
            href="/login"
            className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-zinc-700"
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  )
}
