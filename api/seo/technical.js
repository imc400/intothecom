/* api/seo/technical.js — GET: salud técnica del sitio.
   CWV (LCP/INP/CLS) vía PSI para URLs prioritarias + sitemaps GSC + score compuesto. */

const { parseCookies, verify } = require('../_lib/jwt.js');
const { getSitemaps } = require('../_lib/gsc.js');
const { getPsi } = require('../_lib/psi.js');

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const payload = verify(cookies.admin_session, process.env.SESSION_SECRET);
  if (!payload || !payload.email) return null;
  const allowlist = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase());
  if (!allowlist.includes(payload.email.toLowerCase())) return null;
  return payload;
}

// URLs prioritarias a auditar (las que más tráfico esperamos)
const PRIORITY_URLS = [
  'https://www.intothecom.com/',
  'https://www.intothecom.com/recursos',
  'https://www.intothecom.com/recursos/marketing-digital-b2b-latam-2026'
];

// Thresholds CWV Google
function cwvVerdict(lcp_p75, inp_p75, cls_p75) {
  const lcpOk = lcp_p75 != null && lcp_p75 <= 2500;
  const lcpPoor = lcp_p75 != null && lcp_p75 > 4000;
  const inpOk = inp_p75 != null && inp_p75 <= 200;
  const inpPoor = inp_p75 != null && inp_p75 > 500;
  const clsOk = cls_p75 != null && cls_p75 <= 0.1;
  const clsPoor = cls_p75 != null && cls_p75 > 0.25;

  if (lcpPoor || inpPoor || clsPoor) return 'poor';
  if (lcpOk && inpOk && clsOk) return 'good';
  return 'needs-improvement';
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

  try {
    // Ejecutar PSI + sitemaps en paralelo. PSI mobile + desktop para home.
    const [psiHomeMobile, psiHomeDesktop, psiRecursos, psiPillar, sitemapsResult] = await Promise.all([
      getPsi(PRIORITY_URLS[0], 'mobile'),
      getPsi(PRIORITY_URLS[0], 'desktop'),
      getPsi(PRIORITY_URLS[1], 'mobile'),
      getPsi(PRIORITY_URLS[2], 'mobile'),
      getSitemaps()
    ]);

    const psiResults = [
      { url: PRIORITY_URLS[0], strategy: 'mobile', data: psiHomeMobile },
      { url: PRIORITY_URLS[0], strategy: 'desktop', data: psiHomeDesktop },
      { url: PRIORITY_URLS[1], strategy: 'mobile', data: psiRecursos },
      { url: PRIORITY_URLS[2], strategy: 'mobile', data: psiPillar }
    ].map(r => ({
      ...r,
      verdict: r.data?.field
        ? cwvVerdict(r.data.field.lcp_p75, r.data.field.inp_p75, r.data.field.cls_p75)
        : 'no-data'
    }));

    // Score técnico compuesto (0-100)
    const validScores = psiResults
      .filter(r => r.data?.score != null)
      .map(r => r.data.score);
    const avgScore = validScores.length === 0 ? null : Math.round(
      validScores.reduce((sum, s) => sum + s, 0) / validScores.length
    );

    // Sitemaps issues
    const sitemaps = sitemapsResult.body?.sitemap || [];
    const sitemapWarnings = sitemaps.reduce((sum, s) => sum + (parseInt(s.warnings) || 0), 0);
    const sitemapErrors = sitemaps.reduce((sum, s) => sum + (parseInt(s.errors) || 0), 0);

    // Detección de patrones críticos
    const issues = [];
    psiResults.forEach(r => {
      if (r.verdict === 'poor') {
        issues.push({
          sev: 'critical',
          msg: `CWV en mal estado: ${r.url} (${r.strategy}). LCP=${r.data.field?.lcp_p75 || 'n/a'}ms, INP=${r.data.field?.inp_p75 || 'n/a'}ms, CLS=${r.data.field?.cls_p75 || 'n/a'}`
        });
      }
    });
    if (sitemapErrors > 0) issues.push({ sev: 'critical', msg: `${sitemapErrors} errores en sitemaps GSC` });
    if (sitemapWarnings > 0) issues.push({ sev: 'warn', msg: `${sitemapWarnings} warnings en sitemaps GSC` });

    res.status(200).json({
      avgScore,
      psiResults,
      sitemaps: { total: sitemaps.length, warnings: sitemapWarnings, errors: sitemapErrors, items: sitemaps },
      issues,
      summary: {
        overallVerdict: issues.some(i => i.sev === 'critical') ? 'critical'
                         : issues.some(i => i.sev === 'warn') ? 'warn'
                         : 'ok'
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
