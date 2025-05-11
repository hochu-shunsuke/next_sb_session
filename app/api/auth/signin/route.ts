import { createClient } from '@/lib/supabase';
import { NextResponse, type NextRequest } from 'next/server';
import { AuthApiError } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'メールアドレスとパスワードは必須です。' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error instanceof AuthApiError && error.message.includes('Invalid login credentials')) {
        return NextResponse.json({ error: 'メールアドレスまたはパスワードが間違っています。' }, { status: 401 });
      }
      console.error('Signin error:', error);
      return NextResponse.json({ error: error.message || 'ログインに失敗しました。' }, { status: error.status || 500 });
    }

    // ログイン成功時、セッションは middleware によって Cookie に設定される
    return NextResponse.json({ message: 'ログインしました。' }, { status: 200 });

  } catch (e) {
    console.error('Unexpected error during signin:', e);
    return NextResponse.json({ error: '予期せぬエラーが発生しました。' }, { status: 500 });
  }
}
