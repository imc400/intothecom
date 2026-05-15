/* api/seo/quickwins.js — GET: detecta oportunidades de alto ROI:
   1. Queries en posición 8-20 (en página 2-3 de Google, una bajada de 10 mejora CTR 5x)
   2. Páginas con position OK pero CTR sub-óptimo (problema title/description)
   3. Sugiere acción específica por cada item */

const { parseCookies, verify } = require('../_lib/jwt.js');
const { query } = require('../_lib/gsc.js');
const { loadArticles } = require('../_lib/quality.js');

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

// CTR esperado por posición (estudio Advanced Web Ranking 2024)
const EXPECTED_CTR_BY_POSITION = {
  1: 0.279, 2: 0.158, 3: 0.111, 4: 0.083, 5: 0.063,
  6: 0.049, 7: 0.040, 8: 0.034, 9: 0.029, 10: 0.025
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const startDate = isoDaysAgo(28);
  const endDate = isoDaysAgo(1);

  try {
    const [queriesResult, pagesQueriesResult] = await Promise.all([
      query({ startDate, endDate, dimensions: ['query'], rowLimit: 100 }),
      query({ startDate, endDate, dimensions: ['page', 'query'], rowLimit: 150 })
    ]);

    const articles = loadArticles();
    const articleBySlug = new Map(articles.map(a => [a.slug, a]));

    // === Quick win 1: queries con position 8-20 e impressions > 10 ===
    const stripeQueries = (queriesResult.body?.rows || [])
      .filter(r => r.position >= 8 && r.position <= 20 && r.impressions >= 10)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)
      .map(r => ({
        query: r.keys[0],
        position: r.position,
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: r.ctr,
        type: 'striking-distance',
        suggestion: `Posición ${r.position.toFixed(1)}. Si subes a posición 5, ganarías ~${Math.round(r.impressions * 0.063 - r.clicks)} clicks/mes adicionales. Acción: revisá si el contenido del pillar coincide con la intención de búsqueda + agregá esta query en H2/FAQ.`
      }));

    // === Quick win 2: páginas con CTR sub-óptimo (real < 50% del expected) ===
    const pageCtrMap = new Map();
    (pagesQueriesResult.body?.rows || []).forEach(r => {
      const url = r.keys[0];
      const item = pageCtrMap.get(url) || { url, clicks: 0, impressions: 0, weightedPos: 0 };
      item.clicks += r.clicks;
      item.impressions += r.impressions;
      item.weightedPos += r.position * r.impressions;
      pageCtrMap.set(url, item);
    });
    const lowCtrPages = Array.from(pageCtrMap.values())
      .filter(p => p.impressions >= 50)
      .map(p => {
        const avgPos = p.weightedPos / p.impressions;
        const realCtr = p.clicks / p.impressions;
        const pos = Math.round(avgPos);
        const expectedCtr = EXPECTED_CTR_BY_POSITION[pos] || 0.02;
        return { ...p, avgPos, realCtr, expectedCtr, ctrGap: expectedCtr - realCtr };
      })
      .filter(p => p.realCtr < p.expectedCtr * 0.5 && p.avgPos <= 10)
      .sort((a, b) => b.ctrGap * b.impressions - a.ctrGap * a.impressions)
      .slice(0, 5)
      .map(p => {
        const slug = p.url.split('/recursos/')[1]?.replace(/\/$/, '');
        const article = articleBySlug.get(slug);
        return {
          page: p.url,
          slug,
          hasArticle: !!article,
          impressions: p.impressions,
          clicks: p.clicks,
          realCtr: p.realCtr,
          expectedCtr: p.expectedCtr,
          avgPosition: p.avgPos,
          type: 'low-ctr',
          suggestion: `CTR ${(p.realCtr * 100).toFixed(2)}% vs. esperado ${(p.expectedCtr * 100).toFixed(2)}% en posición ${p.avgPos.toFixed(1)}. Acción: reescribí title (más concreto, con número) y meta description (con call-to-action).`
        };
      });

    const all = [...stripeQueries, ...lowCtrPages];
    const totalCritical = all.length;

    res.status(200).json({
      range: { startDate, endDate, days: 28 },
      totalOpportunities: totalCritical,
      strikingDistance: stripeQueries,
      lowCtr: lowCtrPages
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
