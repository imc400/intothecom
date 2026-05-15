/* api/seo/trends.js — GET: compara performance 28d actuales vs 28d previos.
   Devuelve deltas: clicks, impressions, position, CTR + top 3 páginas que más cayeron. */

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

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // 28d actuales: hoy-28 hasta ayer
  const currentStart = isoDaysAgo(28);
  const currentEnd = isoDaysAgo(1);
  // 28d previos: hoy-56 hasta hoy-29
  const prevStart = isoDaysAgo(56);
  const prevEnd = isoDaysAgo(29);

  try {
    const [currentSum, prevSum, currentPages, prevPages] = await Promise.all([
      query({ startDate: currentStart, endDate: currentEnd, dimensions: [], rowLimit: 1 }),
      query({ startDate: prevStart, endDate: prevEnd, dimensions: [], rowLimit: 1 }),
      query({ startDate: currentStart, endDate: currentEnd, dimensions: ['page'], rowLimit: 20 }),
      query({ startDate: prevStart, endDate: prevEnd, dimensions: ['page'], rowLimit: 20 })
    ]);

    const cur = currentSum.body?.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const prev = prevSum.body?.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

    const pctDelta = (a, b) => b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100;

    // Cross-reference por URL para detectar páginas que más cayeron
    const prevByPage = new Map();
    (prevPages.body?.rows || []).forEach(r => prevByPage.set(r.keys[0], r));
    const droppedPages = (currentPages.body?.rows || [])
      .map(r => {
        const url = r.keys[0];
        const p = prevByPage.get(url) || { clicks: 0, impressions: 0, position: 100 };
        return {
          page: url,
          currentClicks: r.clicks, prevClicks: p.clicks,
          deltaClicks: r.clicks - p.clicks,
          currentPosition: r.position, prevPosition: p.position,
          deltaPosition: r.position - p.position
        };
      })
      .filter(p => p.deltaClicks < 0 || p.deltaPosition > 1)
      .sort((a, b) => a.deltaClicks - b.deltaClicks)
      .slice(0, 5);

    res.status(200).json({
      range: { current: { startDate: currentStart, endDate: currentEnd }, prev: { startDate: prevStart, endDate: prevEnd } },
      current: cur,
      prev: prev,
      deltas: {
        clicks: cur.clicks - prev.clicks,
        clicksPct: pctDelta(cur.clicks, prev.clicks),
        impressions: cur.impressions - prev.impressions,
        impressionsPct: pctDelta(cur.impressions, prev.impressions),
        ctr: cur.ctr - prev.ctr,
        position: cur.position - prev.position
      },
      droppedPages
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
