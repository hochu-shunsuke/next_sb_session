import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Signout error:', error);
    return NextResponse.json({ error: 'ログアウトに失敗しました。' }, { status: 500 });
  }

  // セッションCookieの削除はmiddlewareが行う
  return NextResponse.json({ message: 'ログアウトしました。' }, { status: 200 });
}
