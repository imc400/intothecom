/* api/_lib/quality.js — Calcula Quality Score (0-100) de un artículo + lista de issues.
   Versión server-side de la función que vive en components/admin.jsx.
   Usado por /api/seo/content-health y /api/seo/quickwins. */

function countWordsInSections(sections) {
  if (!Array.isArray(sections)) return 0;
  let total = 0;
  for (const s of sections) {
    if (s.type === 'p' || s.type === 'h2' || s.type === 'h3') {
      total += (s.text || '').split(/\s+/).filter(Boolean).length;
    } else if (s.type === 'list') {
      total += (s.items || []).reduce((a, it) => a + (it || '').split(/\s+/).filter(Boolean).length, 0);
    } else if (s.type === 'table') {
      total += (s.headers || []).reduce((a, h) => a + (h || '').split(/\s+/).filter(Boolean).length, 0);
      total += (s.rows || []).reduce((a, r) => a + r.reduce((x, c) => x + (c || '').split(/\s+/).filter(Boolean).length, 0), 0);
    }
  }
  return total;
}

function countWords(str) {
  return (str || '').split(/\s+/).filter(Boolean).length;
}

function hasInternalLinks(article) {
  const all = [
    article.tldr || '',
    ...(article.sections || []).map(s => s.text || ''),
    ...(article.sections || []).flatMap(s => s.items || []),
    ...(article.faq || []).flatMap(qa => [qa.q || '', qa.a || ''])
  ].join(' ');
  return /\[[^\]]+\]\(\/recursos\/[^)]+\)/.test(all);
}

function computeQualityScore(article) {
  const issues = [];
  let score = 100;

  const titleLen = (article.title || '').length;
  if (!article.title) { issues.push({sev: 'critical', msg: 'Falta título.'}); score -= 25; }
  else if (titleLen < 40) { issues.push({sev: 'warn', msg: `Título corto (${titleLen} chars).`}); score -= 8; }
  else if (titleLen > 80) { issues.push({sev: 'warn', msg: `Título largo (${titleLen} chars).`}); score -= 5; }

  const descLen = (article.description || '').length;
  if (!article.description) { issues.push({sev: 'critical', msg: 'Falta meta description.'}); score -= 20; }
  else if (descLen < 120) { issues.push({sev: 'warn', msg: `Description corta (${descLen} chars).`}); score -= 5; }
  else if (descLen > 170) { issues.push({sev: 'warn', msg: `Description larga (${descLen} chars).`}); score -= 3; }

  if (!article.slug || !/^[a-z0-9-]+$/.test(article.slug)) { issues.push({sev: 'critical', msg: 'Slug inválido.'}); score -= 15; }

  const tldrWords = countWords(article.tldr);
  if (!article.tldr) { issues.push({sev: 'critical', msg: 'Falta TL;DR.'}); score -= 20; }
  else if (tldrWords < 50) { issues.push({sev: 'warn', msg: `TL;DR corto (${tldrWords} palabras).`}); score -= 8; }
  else if (tldrWords > 100) { issues.push({sev: 'warn', msg: `TL;DR largo (${tldrWords} palabras).`}); score -= 4; }

  const sectionsWords = countWordsInSections(article.sections);
  if (!article.sections || article.sections.length < 4) { issues.push({sev: 'critical', msg: `Solo ${(article.sections || []).length} secciones.`}); score -= 15; }
  if (sectionsWords < 1500) { issues.push({sev: 'warn', msg: `Solo ${sectionsWords} palabras.`}); score -= 10; }

  const h2Count = (article.sections || []).filter(s => s.type === 'h2').length;
  if (h2Count < 4) { issues.push({sev: 'warn', msg: `Solo ${h2Count} H2.`}); score -= 6; }

  const faqCount = (article.faq || []).length;
  if (faqCount === 0) { issues.push({sev: 'critical', msg: 'Sin FAQ.'}); score -= 12; }
  else if (faqCount < 5) { issues.push({sev: 'warn', msg: `Solo ${faqCount} FAQs.`}); score -= 5; }

  const srcCount = (article.sources || []).length;
  if (srcCount === 0) { issues.push({sev: 'critical', msg: 'Sin sources.'}); score -= 10; }
  else if (srcCount < 3) { issues.push({sev: 'warn', msg: `Solo ${srcCount} sources.`}); score -= 4; }

  if (!hasInternalLinks(article)) { issues.push({sev: 'warn', msg: 'Sin internal links.'}); score -= 6; }

  if (!article.keyword) { issues.push({sev: 'warn', msg: 'Falta keyword.'}); score -= 4; }
  if (!article.secondaryKeywords || article.secondaryKeywords.length < 3) {
    issues.push({sev: 'info', msg: 'Pocas secondary keywords.'});
  }

  const hasCta = (article.sections || []).some(s => s.type === 'cta');
  if (!hasCta) { issues.push({sev: 'warn', msg: 'Sin CTA.'}); score -= 4; }

  if (!article.author || !article.authorRole) {
    issues.push({sev: 'warn', msg: 'Author/role faltante.'}); score -= 4;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    counts: {
      criticalCount: issues.filter(i => i.sev === 'critical').length,
      warnCount: issues.filter(i => i.sev === 'warn').length,
      infoCount: issues.filter(i => i.sev === 'info').length,
      wordCount: sectionsWords,
      tldrWords, faqCount, sourcesCount: srcCount, h2Count
    }
  };
}

function loadArticles() {
  const fs = require('fs');
  const path = require('path');
  const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
  const data = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
  return data.articles || [];
}

module.exports = { computeQualityScore, countWordsInSections, countWords, hasInternalLinks, loadArticles };
