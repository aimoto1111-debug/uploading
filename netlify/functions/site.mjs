// こもれびゲーム館：サイトの内容と画像を Netlify Blobs に保存する小さなサーバー機能
import { getStore } from '@netlify/blobs';

// パスワードは Netlify の環境変数 ADMIN_PIN で変えられる（未設定なら 6570）
const PIN = () => process.env.ADMIN_PIN || '6570';
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const wait = ms => new Promise(r => setTimeout(r, ms));
const IMG_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/gif'];

async function authed(req) {
  if (req.headers.get('x-admin-pin') === PIN()) return true;
  await wait(800); // 総当たりを遅くする
  return false;
}

export default async (req) => {
  const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '');
  const site = getStore({ name: 'komorebi-site', consistency: 'strong' });
  const images = getStore({ name: 'komorebi-images', consistency: 'strong' });

  // サイトの内容
  if (path === '/api/site') {
    if (req.method === 'GET') {
      const data = await site.get('data', { type: 'json' });
      return json({ server: 'komorebi', data: data || null });
    }
    if (req.method === 'POST') {
      if (!(await authed(req))) return json({ error: 'bad_pin' }, 401);
      let data;
      try { data = await req.json(); } catch (_) { return json({ error: 'bad_json' }, 400); }
      if (!data || !Array.isArray(data.games) || !data.site || !Array.isArray(data.sections)) return json({ error: 'bad_shape' }, 400);
      await site.setJSON('data', data);
      // 使われなくなった画像を片づける
      const used = JSON.stringify(data);
      const { blobs } = await images.list();
      await Promise.all(blobs.filter(b => !used.includes('/api/image/' + b.key)).map(b => images.delete(b.key)));
      return json({ ok: true });
    }
    return json({ error: 'method' }, 405);
  }

  // パスワードの確認
  if (path === '/api/login') {
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    return (await authed(req)) ? json({ ok: true }) : json({ error: 'bad_pin' }, 401);
  }

  // 画像の保存
  if (path === '/api/image' && req.method === 'POST') {
    if (!(await authed(req))) return json({ error: 'bad_pin' }, 401);
    const type = (req.headers.get('content-type') || '').split(';')[0];
    if (!IMG_TYPES.includes(type)) return json({ error: 'bad_type' }, 415);
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 4 * 1024 * 1024) return json({ error: 'too_large' }, 413);
    const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    await images.set(key, buf, { metadata: { type } });
    return json({ url: '/api/image/' + key });
  }

  // 画像の配信
  const m = /^\/api\/image\/([a-z0-9]+)$/.exec(path);
  if (m && req.method === 'GET') {
    const r = await images.getWithMetadata(m[1], { type: 'arrayBuffer' });
    if (!r) return new Response('not found', { status: 404 });
    return new Response(r.data, { headers: { 'content-type': (r.metadata && r.metadata.type) || 'image/webp', 'cache-control': 'public, max-age=31536000, immutable' } });
  }
  return json({ error: 'not_found' }, 404);
};

export const config = { path: ['/api/site', '/api/login', '/api/image', '/api/image/*'] };
