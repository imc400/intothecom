/* api/articles/save.js — POST: commit atómico de articles.json + sitemap.xml + llms.txt
   via GitHub Git Trees API. Vercel detecta el commit y redeploya automáticamente.

   Body: { articles: [...], plannedPillars: [...], sha: 'currentSha (legacy, opcional) ' }
   Response: { ok: true, commitUrl: '...' } */

const https = require('https');
const { parseCookies, verify } = require('../_lib/jwt.js');
const { pingIndexNow } = require('../_lib/indexnow.js');
const { commitMultipleFiles } = require('../_lib/github-tree.js');
const { generateSitemap, generateLlms } = require('../_lib/seo-updates.js');

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const payload = verify(cookies.admin_session, process.env.SESSION_SECRET);
  if (!payload || !payload.email) return null;
  const allowlist = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase());
  if (!allowlist.includes(payload.email.toLowerCase())) return null;
  return payload;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    req.on('data', (c) => chunks += c);
    req.on('end', () => {
      try { resolve(chunks ? JSON.parse(chunks) : {}); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function validateArticle(a) {
  if (!a || typeof a !== 'object') return 'article must be object';
  if (!a.slug || !/^[a-z0-9-]+$/.test(a.slug)) return 'invalid slug';
  if (!a.title) return 'missing title';
  if (!a.description) return 'missing description';
  if (!Array.isArray(a.sections)) return 'sections must be array';
  for (const s of a.sections) {
    if (!s.type || !['h2','h3','p','list','table','cta'].includes(s.type)) {
      return 'invalid section type: ' + s.type;
    }
  }
  if (a.faq && !Array.isArray(a.faq)) return 'faq must be array';
  if (a.sources && !Array.isArray(a.sources)) return 'sources must be array';
  return null;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    res.status(405).json({error: 'Method not allowed'});
    return;
  }

  const user = isAuthenticated(req);
  if (!user) {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }

  const ghToken = process.env.GITHUB_PAT;
  const repo = process.env.GITHUB_REPO || 'imc400/intothecom';
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!ghToken) {
    res.status(500).json({error: 'GITHUB_PAT not configured'});
    return;
  }

  let body;
  try { body = await readJsonBody(req); }
  catch (e) { res.status(400).json({error: e.message}); return; }

  if (!Array.isArray(body.articles)) {
    res.status(400).json({error: 'articles must be array'});
    return;
  }

  // Validar cada article
  for (let i = 0; i < body.articles.length; i++) {
    const err = validateArticle(body.articles[i]);
    if (err) {
      res.status(400).json({error: `Article ${i} (${body.articles[i]?.slug || 'unknown'}): ${err}`});
      return;
    }
  }

  // Verificar no duplicate slugs
  const slugs = body.articles.map(a => a.slug);
  if (new Set(slugs).size !== slugs.length) {
    res.status(400).json({error: 'Duplicate slugs detected'});
    return;
  }

  const newData = {
    articles: body.articles,
    plannedPillars: body.plannedPillars || []
  };

  const articlesContent = JSON.stringify(newData, null, 2);
  const sitemapContent = generateSitemap(body.articles);
  const llmsContent = generateLlms(body.articles);

  const message = `feat(blog): update via admin [${user.email}]\n\nAuto-actualizados: data/articles.json + sitemap.xml + llms.txt\nEditor: ${user.name || user.email}\nTimestamp: ${new Date().toISOString()}\nTotal artículos: ${body.articles.length}`;

  try {
    const result = await commitMultipleFiles({
      repo, branch, token: ghToken,
      files: [
        { path: 'data/articles.json', content: articlesContent },
        { path: 'sitemap.xml', content: sitemapContent },
        { path: 'llms.txt', content: llmsContent }
      ],
      message,
      committer: {
        name: user.name || 'IntoTheCom Admin',
        email: user.email
      }
    });

    // Fire-and-forget: notificar IndexNow con todas las URLs de artículos.
    const articleUrls = body.articles
      .filter(a => a.slug)
      .map(a => `https://www.intothecom.com/recursos/${a.slug}`);
    articleUrls.push('https://www.intothecom.com/recursos');
    articleUrls.push('https://www.intothecom.com/sitemap.xml');
    pingIndexNow(articleUrls).then(r => {
      console.log('IndexNow ping:', r.status, 'urls:', articleUrls.length);
    }).catch(e => console.log('IndexNow error:', e.message));

    res.status(200).json({
      ok: true,
      commitUrl: result.commitUrl,
      commitSha: result.commitSha,
      message: 'Articles + sitemap.xml + llms.txt commiteados en un solo commit. Vercel redeploya en ~30-60s. IndexNow notificado a Bing/Yandex/Naver/DDG.'
    });
  } catch (e) {
    res.status(500).json({error: e.message});
  }
};
