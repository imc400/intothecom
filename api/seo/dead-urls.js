/* api/seo/dead-urls.js — GET: detecta URLs que tienen impressions/clicks en GSC
   pero devuelven 404 actualmente. Combina:
   1. Search Analytics: páginas con impressions últimos 90 días
   2. Probe HEAD a cada URL: ¿da 200, 301/308, o 404?
   3. Reporta las que dan 404 con sugerencia de redirect

   Permite identificar link equity perdido y agregar redirects al vercel.json. */

const https = require('https');
const { parseCookies, verify } = require('../_lib/jwt.js');
const { query } = require('../_lib/gsc.js');

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const payload = verify(cookies.admin_session, process.env.SESSION_SECRET);
  if (!payload || !payload.email) return null;
  const allowlist = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase());
  if (!allowlist.includes(payload.email.toLowerCase())) return null;
  return payload;
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split('T')[0];
}

function probeUrl(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = https.request({
        hostname: u.hostname,
        path: u.pathname + (u.search || ''),
        method: 'HEAD',
        timeout: 5000,
        headers: { 'User-Agent': 'Intothecom-SEO-Health-Check/1.0' }
      }, (resp) => {
        let location = resp.headers.location || null;
        // Resolver location relativa
        if (location && !location.startsWith('http')) {
          location = `https://${u.hostname}${location.startsWith('/') ? '' : '/'}${location}`;
        }
        resolve({ url, status: resp.statusCode, location });
        req.destroy();
      });
      req.on('error', () => resolve({ url, status: 0, error: 'request_error' }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, error: 'timeout' }); });
      req.end();
    } catch (e) {
      resolve({ url, status: 0, error: e.message });
    }
  });
}

function suggestRedirect(deadUrl) {
  // Heurísticas para sugerir destino de redirect
  const pathname = new URL(deadUrl).pathname;
  if (pathname.startsWith('/blog/')) return '/recursos';
  if (pathname.includes('marketing-digital')) return '/recursos/marketing-digital-b2b-latam-2026';
  if (pathname.includes('crm')) return '/recursos/crm-b2b-que-es-como-elegir-2026';
  if (pathname.includes('community') || pathname.includes('redes-sociales')) return '/community-management';
  if (pathname.includes('desarrollo-web') || pathname.includes('diseno')) return '/desarrollo-web';
  if (pathname.includes('paid-media') || pathname.includes('publicidad')) return '/paid-media';
  if (pathname.includes('email') || pathname.includes('klaviyo') || pathname.includes('hubspot')) return '/email-marketing';
  if (pathname.includes('ia') || pathname.includes('inteligencia-artificial') || pathname.includes('agentes')) return '/software-ia';
  if (pathname.includes('agencia') || pathname.includes('nosotros') || pathname.includes('equipo')) return '/nosotros';
  if (pathname.includes('contacto')) return '/contacto';
  if (pathname.includes('casos') || pathname.includes('portfolio') || pathname.includes('clientes')) return '/casos';
  if (pathname.includes('servicio')) return '/servicios';
  if (pathname.includes('seo') || pathname.includes('posicionamiento')) return '/recursos/marketing-digital-b2b-latam-2026';
  return '/recursos';
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const startDate = isoDaysAgo(90);
  const endDate = isoDaysAgo(1);

  try {
    // 1. Obtener URLs con impressions en GSC últimos 90 días
    const result = await query({
      startDate, endDate,
      dimensions: ['page'],
      rowLimit: 200
    });

    const allPages = (result.body?.rows || []).map(r => ({
      url: r.keys[0],
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      position: r.position || 0
    }));

    // 2. Probe HEAD a cada URL para detectar 404s
    const concurrency = 10;
    const probed = [];
    for (let i = 0; i < allPages.length; i += concurrency) {
      const batch = allPages.slice(i, i + concurrency);
      const results = await Promise.all(batch.map(p => probeUrl(p.url)));
      results.forEach((r, j) => {
        probed.push({ ...batch[j], httpStatus: r.status, redirectLocation: r.location });
      });
    }

    // 3. Filtrar las que dan 404 (status 404 o 0/timeout)
    const deadUrls = probed.filter(p => p.httpStatus === 404 || p.httpStatus === 410);
    const slowOrError = probed.filter(p => p.httpStatus === 0);

    // Ordenar por impresiones desc (más impacto primero)
    deadUrls.sort((a, b) => b.impressions - a.impressions);

    const totalLostImpressions = deadUrls.reduce((s, d) => s + d.impressions, 0);
    const totalLostClicks = deadUrls.reduce((s, d) => s + d.clicks, 0);

    res.status(200).json({
      range: { startDate, endDate, days: 90 },
      totalPagesAnalyzed: allPages.length,
      deadCount: deadUrls.length,
      errorCount: slowOrError.length,
      totalLostImpressions,
      totalLostClicks,
      deadUrls: deadUrls.map(d => ({
        url: d.url,
        path: new URL(d.url).pathname,
        impressions: d.impressions,
        clicks: d.clicks,
        avgPosition: d.position,
        suggestedRedirect: suggestRedirect(d.url),
        vercelJsonEntry: {
          source: new URL(d.url).pathname,
          destination: suggestRedirect(d.url),
          permanent: true
        }
      })),
      errors: slowOrError.map(e => ({ url: e.url, status: e.httpStatus }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
