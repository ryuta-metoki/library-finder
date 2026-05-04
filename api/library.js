// Vercel Serverless Function
// ブラウザの代わりにサーバーサイドでCALIL APIを叩く
// → APIキーはここだけで使い、フロントには絶対に渡さない

export default async function handler(req, res) {
  // 環境変数からAPIキーを取得（絶対にフロントに返さない）
  const appkey = process.env.CALIL_API_KEY;

  if (!appkey) {
    return res.status(500).json({ error: 'APIキーが設定されていません（Vercel環境変数を確認してください）' });
  }

  const { geocode, limit = 20 } = req.query;

  if (!geocode) {
    return res.status(400).json({ error: 'geocodeパラメータが必要です' });
  }

  try {
    const params = new URLSearchParams({ appkey, geocode, limit, format: 'json' });
    const response = await fetch(`https://api.calil.jp/library?${params}`);

    if (!response.ok) {
      return res.status(502).json({ error: 'CALIL APIエラー' });
    }

    const data = await response.json();

    // CORSヘッダー（同一オリジンのみ許可）
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Cache-Control', 's-maxage=300'); // 5分キャッシュ
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
