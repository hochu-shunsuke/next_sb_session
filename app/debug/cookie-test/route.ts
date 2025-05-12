// filepath: app/debug/cookie-test/route.ts
import { NextResponse, type NextRequest } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const response = NextResponse.json({ message: 'Cookie test' })

  // HttpOnly クッキーを設定
  response.cookies.set({
    name: 'test-http-only-cookie',
    value: 'test-value-http-only',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV !== 'development', // 開発環境以外では Secure フラグも付与
    sameSite: 'lax',
  })

  // HttpOnly なしの比較用クッキーを設定
  response.cookies.set({
    name: 'test-normal-cookie',
    value: 'test-value-normal',
    httpOnly: false, // 明示的に false
    path: '/',
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
  })

  return response
}
