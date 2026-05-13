/* api/articles/list.js — GET: retorna articles.json desde GitHub + su SHA
   para conflict detection. */

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

function ghRequest({path, token}) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'intothecom-admin'
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
    req.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({error: 'Method not allowed'});
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }

  const ghToken = process.env.GITHUB_PAT;
  const repo = process.env.GITHUB_REPO || 'imc400/intothecom';
  const branch = process.env.GITHUB_BRANCH || 'main';

  // Fallback: si no hay GITHUB_PAT, leer del filesystem del deploy actual.
  // Esto permite read-only mode (lista articles) hasta que se configure PAT para writes.
  if (!ghToken) {
    try {
      const fs = require('fs');
      const path = require('path');
      const localPath = path.join(process.cwd(), 'data', 'articles.json');
      if (fs.existsSync(localPath)) {
        const data = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
        res.status(200).json({
          articles: data.articles || [],
          plannedPillars: data.plannedPillars || [],
          sha: null,
          readOnly: true,
          warning: 'GITHUB_PAT not configured — read-only mode. Saves will fail until PAT is set.'
        });
        return;
      }
    } catch (e) { /* fall through to error */ }
    res.status(500).json({error: 'GITHUB_PAT not configured and filesystem fallback failed'});
    return;
  }

  try {
    const result = await ghRequest({
      path: `/repos/${repo}/contents/data/articles.json?ref=${branch}`,
      token: ghToken
    });

    if (result.status !== 200) {
      res.status(500).json({error: 'GitHub API error', detail: result.body});
      return;
    }

    const content = Buffer.from(result.body.content, 'base64').toString('utf-8');
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      res.status(500).json({error: 'Invalid JSON in articles.json'});
      return;
    }

    res.status(200).json({
      articles: data.articles || [],
      plannedPillars: data.plannedPillars || [],
      sha: result.body.sha,
      size: result.body.size,
      lastModified: result.body.html_url
    });
  } catch (e) {
    res.status(500).json({error: e.message});
  }
};
