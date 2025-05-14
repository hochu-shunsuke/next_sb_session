// Edge Runtimeと互換性のある方法でCSRFトークンを生成するためのユーティリティ

/**
 * ランダムなバイト配列を生成し、それを16進数文字列に変換してCSRFトークンとして返します。
 * Web Crypto API (`crypto.getRandomValues`) を使用しており、Edge Runtimeでも動作します。
 * @returns {string} 生成された32バイトのCSRFトークン（64文字の16進数文字列）。
 */
export function generateCsrfToken(): string {
  // 32バイトのランダムな値を格納するためのUint8Arrayを生成
  const array = new Uint8Array(32);
  // Web Crypto APIを使用してランダムな値で配列を埋める
  crypto.getRandomValues(array);
  // Uint8Arrayを16進数文字列に変換
  // 各バイトを2桁の16進数文字列（例: 0F, A5）に変換し、それらを結合する
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 注意: 以前ここにあった getCsrfTokenFromCookies 関数は、
// クライアントサイドでのトークン取得に cookies-next ライブラリを使用する方針となったため削除されました。
// ミドルウェアが 'csrf-token' クッキーをセットし、クライアントコンポーネントがそれを読み取ります。
