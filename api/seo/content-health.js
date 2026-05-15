/* api/seo/content-health.js — GET: salud del contenido del sitio.
   Promedio Quality Score + bottom 3 artículos + freshness (días desde último publish). */

const { parseCookies, verify } = require('../_lib/jwt.js');
const { computeQualityScore, loadArticles } = require('../_lib/quality.js');

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const payload = verify(cookies.admin_session, process.env.SESSION_SECRET);
  if (!payload || !payload.email) return null;
  const allowlist = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase());
  if (!allowlist.includes(payload.email.toLowerCase())) return null;
  return payload;
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
    const articles = loadArticles();
    const scored = articles.map(a => {
      const qs = computeQualityScore(a);
      return {
        slug: a.slug,
        title: a.title,
        type: a.type || 'pillar',
        category: a.category,
        publishedAt: a.publishedAt,
        updatedAt: a.updatedAt,
        wordCount: qs.counts.wordCount,
        score: qs.score,
        criticalCount: qs.counts.criticalCount,
        warnCount: qs.counts.warnCount,
        topIssues: qs.issues.slice(0, 3).map(i => i.msg)
      };
    });

    const avgScore = scored.length === 0 ? 0 : Math.round(scored.reduce((s, a) => s + a.score, 0) / scored.length);
    const articlesUnder80 = scored.filter(a => a.score < 80).length;
    const articlesUnder60 = scored.filter(a => a.score < 60).length;
    const bottomArticles = [...scored].sort((a, b) => a.score - b.score).slice(0, 5);

    // Freshness: días desde el último publish
    const lastPublishDate = articles.reduce((latest, a) => {
      const d = new Date(a.publishedAt);
      return d > latest ? d : latest;
    }, new Date('2000-01-01'));
    const daysSinceLastPublish = Math.floor((Date.now() - lastPublishDate.getTime()) / (1000 * 60 * 60 * 24));

    // Distribución por tipo + categoría
    const byType = {};
    const byCategory = {};
    articles.forEach(a => {
      const t = a.type || 'pillar';
      byType[t] = (byType[t] || 0) + 1;
      const c = a.category || 'Sin categoría';
      byCategory[c] = (byCategory[c] || 0) + 1;
    });

    // Issues globales agregados
    const allCritical = scored.reduce((sum, a) => sum + a.criticalCount, 0);
    const allWarn = scored.reduce((sum, a) => sum + a.warnCount, 0);

    res.status(200).json({
      total: articles.length,
      avgScore,
      articlesUnder80,
      articlesUnder60,
      lastPublishDate: lastPublishDate.toISOString().split('T')[0],
      daysSinceLastPublish,
      totalCriticalIssues: allCritical,
      totalWarnIssues: allWarn,
      byType,
      byCategory,
      bottomArticles
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
