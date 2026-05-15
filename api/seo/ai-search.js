/* api/seo/ai-search.js — GET: visibilidad en motores AI (ChatGPT, Bing Copilot, Perplexity).
   Combina:
   - Bing Webmaster API (si BING_API_KEY) para grounding queries en Copilot
   - GSC con filtro de tráfico tipo AI Overviews (cuando esté disponible)
   - Recomendaciones de cómo subir citation rate */

const https = require('https');
const { parseCookies, verify } = require('../_lib/jwt.js');

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const payload = verify(cookies.admin_session, process.env.SESSION_SECRET);
  if (!payload || !payload.email) return null;
  const allowlist = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase());
  if (!allowlist.includes(payload.email.toLowerCase())) return null;
  return payload;
}

function bingApiGet(path) {
  const apiKey = process.env.BING_API_KEY;
  if (!apiKey) return Promise.resolve({ status: 0, body: { error: 'BING_API_KEY not set' } });
  return new Promise((resolve, reject) => {
    const sep = path.includes('?') ? '&' : '?';
    const req = https.request({
      hostname: 'ssl.bing.com',
      path: `${path}${sep}apikey=${apiKey}`,
      method: 'GET',
      timeout: 10000
    }, (resp) => {
      let chunks = '';
      resp.on('data', (c) => chunks += c);
      resp.on('end', () => {
        try { resolve({ status: resp.statusCode, body: JSON.parse(chunks) }); }
        catch { resolve({ status: resp.statusCode, body: chunks }); }
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: { error: 'timeout' } }); });
    req.end();
  });
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

  const result = {
    bingApiConfigured: !!process.env.BING_API_KEY,
    sources: {},
    summary: {}
  };

  // === Bing Webmaster: search performance overall ===
  if (process.env.BING_API_KEY) {
    try {
      const siteUrl = 'https://www.intothecom.com';
      const queryResult = await bingApiGet(`/webmaster/api.svc/json/GetQueryStats?siteUrl=${encodeURIComponent(siteUrl)}`);
      if (queryResult.status === 200) {
        result.sources.bingQueries = 'ok';
        const rows = queryResult.body?.d || [];
        result.bingQueries = rows.slice(0, 15).map(r => ({
          query: r.Query,
          clicks: r.Clicks || 0,
          impressions: r.Impressions || 0,
          position: r.AvgImpressionPosition || 0
        }));
      } else {
        result.sources.bingQueries = `error_${queryResult.status}`;
        result.bingError = queryResult.body;
      }

      // Page stats
      const pagesResult = await bingApiGet(`/webmaster/api.svc/json/GetPageStats?siteUrl=${encodeURIComponent(siteUrl)}`);
      if (pagesResult.status === 200) {
        result.sources.bingPages = 'ok';
        const rows = pagesResult.body?.d || [];
        result.bingPages = rows.slice(0, 15).map(r => ({
          page: r.Page,
          clicks: r.Clicks || 0,
          impressions: r.Impressions || 0
        }));
      }
    } catch (e) {
      result.sources.bingQueries = 'error';
      result.bingError = e.message;
    }
  } else {
    result.sources.bingQueries = 'not_configured';
    result.note = 'Agregá BING_API_KEY en Vercel env vars para tracking de Bing Copilot/ChatGPT search citations.';
  }

  // Resumen
  const totalBingClicks = (result.bingQueries || []).reduce((s, q) => s + q.clicks, 0);
  const totalBingImpressions = (result.bingQueries || []).reduce((s, q) => s + q.impressions, 0);

  result.summary = {
    totalBingClicks,
    totalBingImpressions,
    topGroundingQueries: (result.bingQueries || []).slice(0, 5).map(q => q.query),
    verdict: totalBingClicks >= 50 ? 'ok' : totalBingClicks >= 10 ? 'warn' : 'critical',
    recommendations: []
  };

  if (result.summary.verdict !== 'ok') {
    result.summary.recommendations.push('Agregá TL;DR de 60-80 palabras al inicio de cada pillar (ventana de extracción LLM).');
    result.summary.recommendations.push('Asegurá tablas comparativas en pillars de tipo "vs" o "ranking" — AI Overviews privilegia tablas.');
    result.summary.recommendations.push('Sources externas verificables ≥5 por artículo (sube citation rate +115% según paper Princeton 2025).');
  }

  res.status(200).json(result);
};
