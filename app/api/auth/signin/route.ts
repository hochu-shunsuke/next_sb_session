import { NextResponse, type NextRequest } from 'next/server';
import { AuthApiError } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'メールアドレスとパスワードは必須です。' }, { status: 400 });
  }

  const response = NextResponse.json({ message: '処理中です。' });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
            path: '/',
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
            path: '/',
          });
        },
      },
    }
  );

  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error instanceof AuthApiError && error.message.includes('Invalid login credentials')) {
        return NextResponse.json({ error: 'メールアドレスまたはパスワードが間違っています。' }, { status: 401 });
      }
      return NextResponse.json({ error: error.message || 'ログインに失敗しました。' }, { status: error.status || 500 });
    }

    return NextResponse.json(
      { message: 'ログインしました。', userId: data.user?.id },
      { status: 200, headers: response.headers }
    );

  } catch {
    return NextResponse.json({ error: '予期せぬエラーが発生しました。' }, { status: 500 });
  }
}
