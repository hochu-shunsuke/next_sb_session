import { createClient } from '@/lib/supabase';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();


  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div>
          <h2 style={{ color: '#000000' }}>ユーザー情報</h2>
          {user && (
            <div style={{ color: '#000000' }}>
              <p>メールアドレス: {user.email}</p>
              <p>ユーザーID: {user.id}</p>
              <p>最終ログイン: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ja-JP') : 'N/A'}</p>
            </div>
          )}
          {!user && (
            <p style={{ color: '#000000' }}>ユーザー情報を取得できませんでした。</p>
          )}
        </div>
      </main>
    </div>
  );
}
