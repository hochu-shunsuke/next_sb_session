import { NextResponse } from 'next/server'
import { handleAuthCode } from '@/lib/supabase'
import { NextRequest } from 'next/server' // NextRequestをインポート

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.next()
  const { user, error } = await handleAuthCode(request, response, code)

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.redirect(new URL('/login', request.url))
}
