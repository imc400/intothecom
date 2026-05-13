/* api/articles/save.js — POST: actualiza data/articles.json en GitHub via API.
   Vercel detecta el commit y redeploya automaticamente.

   Body: { articles: [...], plannedPillars: [...], sha: 'currentSha' }
   Response: { ok: true, commitUrl: '...', newSha: '...' } */

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

function ghRequest({method, path, token, body}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'intothecom-admin',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (resp) => {
      let chunks = '';
      resp.on('data', (c) => chunks += c);
      resp.on('end', () => {
        try {
          resolve({status: resp.statusCode, body: JSON.parse(chunks)});
        } catch (e) {
          resolve({status: resp.statusCode, body: chunks});
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    req.on('data', (c) => chunks += c);
    req.on('end', () => {
      try {
        resolve(chunks ? JSON.parse(chunks) : {});
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
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
  try {
    body = await readJsonBody(req);
  } catch (e) {
    res.status(400).json({error: e.message});
    return;
  }

  if (!Array.isArray(body.articles)) {
    res.status(400).json({error: 'articles must be array'});
    return;
  }
  if (!body.sha) {
    res.status(400).json({error: 'sha required (current articles.json sha for conflict detection)'});
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

  const newContent = JSON.stringify(newData, null, 2);
  const newContentBase64 = Buffer.from(newContent, 'utf-8').toString('base64');

  // Commit message
  const message = `feat(blog): update articles via admin [${user.email}]\n\nEdited by ${user.name || user.email} at ${new Date().toISOString()}`;

  try {
    const result = await ghRequest({
      method: 'PUT',
      path: `/repos/${repo}/contents/data/articles.json`,
      token: ghToken,
      body: {
        message: message,
        content: newContentBase64,
        sha: body.sha,
        branch: branch,
        committer: {
          name: user.name || 'IntoTheCom Admin',
          email: user.email
        }
      }
    });

    if (result.status === 409 || (result.status === 422 && result.body && result.body.message && result.body.message.includes('sha'))) {
      res.status(409).json({error: 'Conflict: articles.json was modified by someone else. Reload and retry.'});
      return;
    }

    if (result.status !== 200 && result.status !== 201) {
      res.status(500).json({error: 'GitHub API error', status: result.status, detail: result.body});
      return;
    }

    res.status(200).json({
      ok: true,
      commitUrl: result.body.commit?.html_url,
      newSha: result.body.content?.sha,
      message: 'Articles saved. Vercel will redeploy in ~30-60s.'
    });
  } catch (e) {
    res.status(500).json({error: e.message});
  }
};
