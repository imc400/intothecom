/* api/seo/snapshot.js — GET: snapshot público read-only de GSC para auditoría rápida.
   Sin auth admin (solo lee data agregada de GSC, no acciones).

   Query params:
   - days=7|28|90  (default 28)
   - property=apex|www  (default www — la nueva property)

   Devuelve: top pages, top queries, indexation status de nuestros 13 artículos pillar,
   /blog/* legacy URLs todavía con tráfico (para detectar rescate efectivo).

   Usado por agente Claude para verificar deploys de SEO rescue. NO exponer
   en navegación pública — endpoint interno.
*/

const { query, getAccessToken, urlInspect } = require('../_lib/gsc.js');

const PILLAR_SLUGS = [
  'agentes-ia-para-empresas-2026',
  'asistente-ia-atencion-cliente-2026',
  'crm-b2b-que-es-como-elegir-2026',
  'marketing-digital-b2b-latam-2026',
  'paid-media-b2b-2026',
  'klaviyo-hubspot-email-automation-2026',
  'community-management-b2b-2026',
  'desarrollo-web-headless-nextjs-shopify-2026',
  'tech-stack-minimo-growth-b2b-latam-2026',
  'funnel-aarrr-pirate-b2b-latam-2026',
  'buyer-personas-b2b-chile-2026',
  'kick-off-proyecto-guia-completa-2026',
  'ranking-agencias-marketing-digital-b2b-chile-2026'
];

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const days = Math.min(parseInt(url.searchParams.get('days') || '28', 10), 90);
  const propertyOverride = url.searchParams.get('property');

  // Property selection (default = apex que tiene la data histórica)
  const propertyUrl = propertyOverride === 'www'
    ? 'https://www.intothecom.com/'
    : propertyOverride === 'apex'
      ? 'sc-domain:intothecom.com'
      : process.env.GSC_PROPERTY_URL || 'sc-domain:intothecom.com';

  const endDate = new Date();
  endDate.setUTCDate(endDate.getUTCDate() - 1);
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - days);
  const dates = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };

  const result = {
    property: propertyUrl,
    period: { ...dates, days },
    timestamp: new Date().toISOString(),
    summary: null,
    topPages: [],
    topQueries: [],
    legacyBlogStatus: [],
    pillarIndexation: [],
    errors: []
  };

  // Helper para query con propertyOverride
  async function gscQuery(body) {
    const https = require('https');
    const token = await getAccessToken();
    const payload = JSON.stringify(body);
    const encodedProperty = encodeURIComponent(propertyUrl);
    return new Promise((resolve, reject) => {
      const r = https.request({
        hostname: 'searchconsole.googleapis.com',
        path: `/webmasters/v3/sites/${encodedProperty}/searchAnalytics/query`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 15000
      }, (resp) => {
        let chunks = '';
        resp.on('data', (c) => chunks += c);
        resp.on('end', () => {
          try { resolve({ status: resp.statusCode, body: JSON.parse(chunks) }); }
          catch { resolve({ status: resp.statusCode, body: chunks }); }
        });
      });
      r.on('error', reject);
      r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
      r.write(payload);
      r.end();
    });
  }

  // 1. Summary global
  try {
    const r = await gscQuery({ ...dates, dimensions: [], rowLimit: 1 });
    result.summary = (r.body.rows && r.body.rows[0]) || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  } catch (e) { result.errors.push({ task: 'summary', error: e.message }); }

  // 2. Top pages
  try {
    const r = await gscQuery({ ...dates, dimensions: ['page'], rowLimit: 30 });
    result.topPages = (r.body.rows || []).map(row => ({
      url: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: +(row.ctr * 100).toFixed(2),
      position: +row.position.toFixed(1)
    }));
  } catch (e) { result.errors.push({ task: 'topPages', error: e.message }); }

  // 3. Top queries
  try {
    const r = await gscQuery({ ...dates, dimensions: ['query'], rowLimit: 30 });
    result.topQueries = (r.body.rows || []).map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: +(row.ctr * 100).toFixed(2),
      position: +row.position.toFixed(1)
    }));
  } catch (e) { result.errors.push({ task: 'topQueries', error: e.message }); }

  // 4. Legacy /blog/* status (medida de éxito del rescate)
  try {
    const r = await gscQuery({
      ...dates,
      dimensions: ['page'],
      rowLimit: 100,
      dimensionFilterGroups: [{
        filters: [{ dimension: 'page', operator: 'contains', expression: '/blog/' }]
      }]
    });
    result.legacyBlogStatus = (r.body.rows || []).map(row => ({
      url: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      position: +row.position.toFixed(1)
    }));
    result.legacyBlogStatus.totals = {
      urls: result.legacyBlogStatus.length,
      impressions: result.legacyBlogStatus.reduce((s, p) => s + p.impressions, 0),
      clicks: result.legacyBlogStatus.reduce((s, p) => s + p.clicks, 0)
    };
  } catch (e) { result.errors.push({ task: 'legacyBlog', error: e.message }); }

  // 5. Indexación de nuestros 13 pillars (combina: GSC SERP appearance + URL Inspection API)
  try {
    const inspect = url.searchParams.get('inspect') === '1';
    const pillarChecks = await Promise.all(PILLAR_SLUGS.map(async slug => {
      const pageUrl = `https://www.intothecom.com/recursos/${slug}`;
      const r = await gscQuery({
        ...dates,
        dimensions: ['page'],
        rowLimit: 1,
        dimensionFilterGroups: [{
          filters: [{ dimension: 'page', operator: 'contains', expression: `/recursos/${slug}` }]
        }]
      });
      const row = (r.body.rows && r.body.rows[0]) || null;
      const base = {
        slug,
        url: pageUrl,
        serpAppearances: !!row,
        impressions: row ? row.impressions : 0,
        clicks: row ? row.clicks : 0,
        position: row ? +row.position.toFixed(1) : null
      };
      if (!inspect) return base;
      // URL Inspection API (más costoso, llama solo si ?inspect=1)
      try {
        const ins = await urlInspect(pageUrl);
        const idx = ins.body && ins.body.inspectionResult && ins.body.inspectionResult.indexStatusResult;
        return {
          ...base,
          inspection: idx ? {
            verdict: idx.verdict,
            coverageState: idx.coverageState,
            robotsTxtState: idx.robotsTxtState,
            indexingState: idx.indexingState,
            lastCrawlTime: idx.lastCrawlTime,
            pageFetchState: idx.pageFetchState,
            googleCanonical: idx.googleCanonical,
            userCanonical: idx.userCanonical
          } : { error: 'no inspection data', raw: ins.body }
        };
      } catch (e) { return { ...base, inspection: { error: e.message } }; }
    }));
    result.pillarIndexation = pillarChecks;
  } catch (e) { result.errors.push({ task: 'pillarIndexation', error: e.message }); }

  res.status(200).json(result);
};
