/* api/seo/dashboard.js — GET: agregado de métricas SEO para el admin dashboard.
   Sólo usuarios admin autenticados.

   Devuelve:
   - GSC Search Performance (impressions, clicks, CTR, position) — últimos 28 días
   - Top 10 queries
   - Top 10 pages
   - Sitemaps status
   - Errors si alguna fuente falla (degradación graceful)

   Query params:
   - days: 7 | 28 | 90 (default 28)
*/

const { parseCookies, verify } = require('../_lib/jwt.js');
const { query: gscQuery, getSitemaps } = require('../_lib/gsc.js');

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

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const daysParam = url.searchParams.get('days');
  const days = [7, 28, 90].includes(+daysParam) ? +daysParam : 28;
  const startDate = isoDaysAgo(days);
  const endDate = isoDaysAgo(1);

  const result = {
    range: { days, startDate, endDate },
    fetchedAt: new Date().toISOString(),
    sources: {},
    summary: null,
    topQueries: [],
    topPages: [],
    byDevice: [],
    byCountry: [],
    sitemaps: null,
    errors: []
  };

  // === GSC Summary ===
  try {
    const r = await gscQuery({
      startDate, endDate,
      dimensions: [],
      rowLimit: 1
    });
    if (r.status === 200 && Array.isArray(r.body.rows) && r.body.rows.length > 0) {
      const row = r.body.rows[0];
      result.summary = {
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      };
      result.sources.gsc = 'ok';
    } else if (r.status === 200) {
      result.summary = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
      result.sources.gsc = 'no_data';
    } else {
      result.sources.gsc = `error_${r.status}`;
      result.errors.push({ source: 'gsc-summary', status: r.status, body: r.body });
    }
  } catch (e) {
    result.sources.gsc = 'auth_error';
    result.errors.push({ source: 'gsc-summary', error: e.message });
  }

  // === Top Queries (solo si summary funcionó) ===
  if (result.sources.gsc === 'ok' || result.sources.gsc === 'no_data') {
    try {
      const r = await gscQuery({
        startDate, endDate,
        dimensions: ['query'],
        rowLimit: 15
      });
      if (r.status === 200 && Array.isArray(r.body.rows)) {
        result.topQueries = r.body.rows.map(row => ({
          query: row.keys[0],
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr || 0,
          position: row.position || 0
        }));
      }
    } catch (e) {
      result.errors.push({ source: 'gsc-queries', error: e.message });
    }

    // === Top Pages ===
    try {
      const r = await gscQuery({
        startDate, endDate,
        dimensions: ['page'],
        rowLimit: 15
      });
      if (r.status === 200 && Array.isArray(r.body.rows)) {
        result.topPages = r.body.rows.map(row => ({
          page: row.keys[0],
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr || 0,
          position: row.position || 0
        }));
      }
    } catch (e) {
      result.errors.push({ source: 'gsc-pages', error: e.message });
    }

    // === By Device ===
    try {
      const r = await gscQuery({
        startDate, endDate,
        dimensions: ['device'],
        rowLimit: 5
      });
      if (r.status === 200 && Array.isArray(r.body.rows)) {
        result.byDevice = r.body.rows.map(row => ({
          device: row.keys[0],
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr || 0
        }));
      }
    } catch (e) {
      result.errors.push({ source: 'gsc-device', error: e.message });
    }

    // === By Country (top 10) ===
    try {
      const r = await gscQuery({
        startDate, endDate,
        dimensions: ['country'],
        rowLimit: 10
      });
      if (r.status === 200 && Array.isArray(r.body.rows)) {
        result.byCountry = r.body.rows.map(row => ({
          country: row.keys[0],
          clicks: row.clicks || 0,
          impressions: row.impressions || 0
        }));
      }
    } catch (e) {
      result.errors.push({ source: 'gsc-country', error: e.message });
    }

    // === Sitemaps status ===
    try {
      const r = await getSitemaps();
      if (r.status === 200 && Array.isArray(r.body.sitemap)) {
        result.sitemaps = r.body.sitemap.map(s => ({
          path: s.path,
          lastSubmitted: s.lastSubmitted,
          lastDownloaded: s.lastDownloaded,
          warnings: s.warnings,
          errors: s.errors,
          isPending: s.isPending,
          isSitemapsIndex: s.isSitemapsIndex,
          contents: s.contents
        }));
      }
    } catch (e) {
      result.errors.push({ source: 'gsc-sitemaps', error: e.message });
    }
  }

  res.status(200).json(result);
};
