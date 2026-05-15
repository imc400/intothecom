/* api/_lib/psi.js — Helper para PageSpeed Insights API.
   No requiere API key (free tier). Con PSI_API_KEY en env obtiene rate limit mayor.

   Public:
   - getPsi(url, strategy='mobile'): devuelve LCP, INP, CLS, FCP, TBT, score */

const https = require('https');

// Cache simple en memoria del Lambda (15 min)
const _cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function httpGet(hostname, path, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path, method: 'GET', timeout: timeoutMs
    }, (resp) => {
      let chunks = '';
      resp.on('data', (c) => chunks += c);
      resp.on('end', () => {
        try { resolve({ status: resp.statusCode, body: JSON.parse(chunks) }); }
        catch { resolve({ status: resp.statusCode, body: chunks }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('PSI timeout')); });
    req.end();
  });
}

async function getPsi(url, strategy = 'mobile') {
  const cacheKey = `${url}|${strategy}`;
  const cached = _cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const params = new URLSearchParams({
    url, strategy, category: 'performance'
  });
  if (process.env.PSI_API_KEY) params.set('key', process.env.PSI_API_KEY);

  const result = await httpGet(
    'www.googleapis.com',
    `/pagespeedonline/v5/runPagespeed?${params.toString()}`
  );

  if (result.status !== 200) {
    return { error: `PSI error ${result.status}`, raw: result.body };
  }

  const lh = result.body.lighthouseResult || {};
  const cwv = (result.body.loadingExperience && result.body.loadingExperience.metrics) || {};
  const audits = lh.audits || {};
  const data = {
    url, strategy,
    score: lh.categories?.performance?.score
      ? Math.round(lh.categories.performance.score * 100)
      : null,
    lab: {
      lcp: audits['largest-contentful-paint']?.numericValue ?? null,
      fcp: audits['first-contentful-paint']?.numericValue ?? null,
      cls: audits['cumulative-layout-shift']?.numericValue ?? null,
      tbt: audits['total-blocking-time']?.numericValue ?? null,
      si: audits['speed-index']?.numericValue ?? null,
      tti: audits['interactive']?.numericValue ?? null
    },
    field: {
      lcp_p75: cwv['LARGEST_CONTENTFUL_PAINT_MS']?.percentile ?? null,
      inp_p75: cwv['INTERACTION_TO_NEXT_PAINT']?.percentile ?? null,
      cls_p75: cwv['CUMULATIVE_LAYOUT_SHIFT_SCORE']?.percentile ?? null,
      fcp_p75: cwv['FIRST_CONTENTFUL_PAINT_MS']?.percentile ?? null,
      ttfb_p75: cwv['EXPERIMENTAL_TIME_TO_FIRST_BYTE']?.percentile ?? null
    },
    fetchedAt: new Date().toISOString()
  };

  _cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

module.exports = { getPsi };
