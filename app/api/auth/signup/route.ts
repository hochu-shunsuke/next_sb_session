import { createClient } from '@/lib/supabase';
import { NextResponse, type NextRequest } from 'next/server';
import { AuthApiError } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { email, password, options } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'メールアドレスとパスワードは必須です。' }, { status: 400 });
  }

  // メールアドレスの形式を簡易的にチェック (より厳密なバリデーションも検討)
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return NextResponse.json({ error: '有効なメールアドレスを入力してください。' }, { status: 400 });
  }

  // パスワードの強度を簡易的にチェック (より厳密なバリデーションも検討)
  if (password.length < 6) {
    return NextResponse.json({ error: 'パスワードは6文字以上で入力してください。' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // クライアントから emailRedirectTo を受け取るか、ここで固定値を設定
        emailRedirectTo: options?.emailRedirectTo || `${request.nextUrl.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      // ユーザーが既に存在する場合などのエラーハンドリング
      if (error instanceof AuthApiError && error.message.includes('User already registered')) {
          return NextResponse.json({ error: 'このメールアドレスは既に使用されています。' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message || 'アカウント作成に失敗しました。' }, { status: error.status || 500 });
    }

    // サインアップ成功時 (メール認証が必要な場合、ユーザーはまだログイン状態にならない)
    // data.session が null で、data.user が存在する状態
    if (data.user && !data.session) {
        return NextResponse.json({ message: '確認メールを送信しました。メール内のリンクをクリックして認証を完了してください。' }, { status: 200 });
    }
    // 自動でセッションが作成される場合 (例: メール認証が無効)
    if (data.session) {
        return NextResponse.json({ message: 'アカウントを作成し、ログインしました。' }, { status: 200 });
    }

    return NextResponse.json({ message: 'アカウント作成処理が完了しました。' }, { status: 200 });

  } catch (e) {
    console.error('Unexpected error during signup:', e);
    return NextResponse.json({ error: '予期せぬエラーが発生しました。' }, { status: 500 });
  }
}
