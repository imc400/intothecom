/* api/indexnow/notify.js — POST: pingea IndexNow (Bing/Yandex/Naver/DuckDuckGo)
   con array de URLs. Solo admin autenticado puede llamarlo.

   Body: { urls: ["https://www.intothecom.com/...", ...] }
   Response: { ok: true, submitted: N, indexnowStatus: HTTP code }
*/

const { parseCookies, verify } = require('../_lib/jwt.js');
const { pingIndexNow, isValidUrl } = require('../_lib/indexnow.js');

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const payload = verify(cookies.admin_session, process.env.SESSION_SECRET);
  if (!payload || !payload.email) return null;
  const allowlist = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase());
  if (!allowlist.includes(payload.email.toLowerCase())) return null;
  return payload;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    req.on('data', (c) => chunks += c);
    req.on('end', () => {
      try { resolve(chunks ? JSON.parse(chunks) : {}); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let body;
  try { body = await readJsonBody(req); }
  catch (e) { res.status(400).json({ error: e.message }); return; }

  const urls = (body.urls || []).filter(isValidUrl).slice(0, 10000);
  if (urls.length === 0) {
    res.status(400).json({ error: 'No valid URLs (must be https://www.intothecom.com/...)' });
    return;
  }

  const result = await pingIndexNow(urls);
  res.status(200).json({
    ok: result.status >= 200 && result.status < 300,
    submitted: urls.length,
    indexnowStatus: result.status,
    indexnowMessage: result.body || result.error || '(empty body — success)'
  });
};
