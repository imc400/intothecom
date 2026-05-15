/* api/seo/penalties.js — GET: detecta manual actions, security issues, errores indexación.
   Combina urlInspection (varias URLs muestra) + heurísticas de detección. */

const { parseCookies, verify } = require('../_lib/jwt.js');
const { urlInspect } = require('../_lib/gsc.js');

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const payload = verify(cookies.admin_session, process.env.SESSION_SECRET);
  if (!payload || !payload.email) return null;
  const allowlist = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase());
  if (!allowlist.includes(payload.email.toLowerCase())) return null;
  return payload;
}

// URLs core para muestreo
const SAMPLE_URLS = [
  'https://www.intothecom.com/',
  'https://www.intothecom.com/recursos',
  'https://www.intothecom.com/recursos/marketing-digital-b2b-latam-2026',
  'https://www.intothecom.com/recursos/crm-b2b-que-es-como-elegir-2026'
];

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
    const results = await Promise.allSettled(
      SAMPLE_URLS.map(u => urlInspect(u))
    );

    const inspections = results.map((r, i) => {
      if (r.status === 'rejected') {
        return { url: SAMPLE_URLS[i], error: r.reason.message };
      }
      const body = r.value.body || {};
      const idx = body.inspectionResult?.indexStatusResult || {};
      return {
        url: SAMPLE_URLS[i],
        coverageState: idx.coverageState || 'unknown',
        verdict: idx.verdict || 'unknown',
        robotsTxtState: idx.robotsTxtState || 'unknown',
        indexingState: idx.indexingState || 'unknown',
        lastCrawlTime: idx.lastCrawlTime || null,
        pageFetchState: idx.pageFetchState || 'unknown'
      };
    });

    // Detección de problemas
    const indexedCount = inspections.filter(i => i.verdict === 'PASS').length;
    const blockedCount = inspections.filter(i => i.coverageState && i.coverageState.includes('Blocked')).length;
    const errorCount = inspections.filter(i => i.error || i.verdict === 'FAIL').length;

    const issues = [];
    inspections.forEach(insp => {
      if (insp.error) return;
      if (insp.verdict === 'FAIL') {
        issues.push({ sev: 'critical', msg: `${insp.url}: ${insp.coverageState}` });
      }
      if (insp.robotsTxtState && insp.robotsTxtState !== 'ALLOWED') {
        issues.push({ sev: 'warn', msg: `${insp.url}: robots.txt = ${insp.robotsTxtState}` });
      }
    });

    // Manual actions: URL Inspection NO devuelve estos. La API oficial de manual actions
    // requiere acceso especial. Por ahora reportamos "unknown" + link a GSC para revisión manual.
    const manualActionsStatus = 'unknown_check_gsc_directly';

    res.status(200).json({
      sampleSize: SAMPLE_URLS.length,
      indexedCount,
      blockedCount,
      errorCount,
      inspections,
      manualActions: {
        status: manualActionsStatus,
        note: 'Manual Actions API requiere acceso especial. Revisá manualmente en GSC → Security & Manual Actions.',
        link: 'https://search.google.com/search-console/manual-actions'
      },
      securityIssues: {
        note: 'Si GSC detecta hacking/malware, recibís email + warning visible en GSC.',
        link: 'https://search.google.com/search-console/security-issues'
      },
      issues,
      summary: {
        overallVerdict: errorCount > 0 ? 'critical' : issues.length > 0 ? 'warn' : 'ok'
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
