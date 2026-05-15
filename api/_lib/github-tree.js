/* api/_lib/github-tree.js — Helper para commit atómico de múltiples archivos via
   GitHub Git Trees API. Un solo commit, un solo deploy Vercel.

   Usage:
     await commitMultipleFiles({
       repo: 'owner/repo', branch: 'main', token: GITHUB_PAT,
       files: [
         { path: 'data/articles.json', content: '...' },
         { path: 'sitemap.xml', content: '...' },
         { path: 'llms.txt', content: '...' }
       ],
       message: 'feat: ...',
       committer: { name: 'X', email: 'x@y.com' }
     });
*/

const https = require('https');

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
        try { resolve({status: resp.statusCode, body: JSON.parse(chunks)}); }
        catch (e) { resolve({status: resp.statusCode, body: chunks}); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function commitMultipleFiles({repo, branch, token, files, message, committer}) {
  // 1. Get current branch HEAD commit sha
  const headRes = await ghRequest({method: 'GET', path: `/repos/${repo}/git/refs/heads/${branch}`, token});
  if (headRes.status !== 200) throw new Error(`Cannot get branch ref: ${headRes.status} ${JSON.stringify(headRes.body)}`);
  const currentCommitSha = headRes.body.object.sha;

  // 2. Get current tree sha (base)
  const commitRes = await ghRequest({method: 'GET', path: `/repos/${repo}/git/commits/${currentCommitSha}`, token});
  if (commitRes.status !== 200) throw new Error(`Cannot get commit: ${commitRes.status}`);
  const baseTreeSha = commitRes.body.tree.sha;

  // 3. Create blob for each file
  const treeEntries = [];
  for (const file of files) {
    const blobRes = await ghRequest({
      method: 'POST',
      path: `/repos/${repo}/git/blobs`,
      token,
      body: { content: file.content, encoding: 'utf-8' }
    });
    if (blobRes.status !== 201) throw new Error(`Cannot create blob for ${file.path}: ${blobRes.status} ${JSON.stringify(blobRes.body)}`);
    treeEntries.push({ path: file.path, mode: '100644', type: 'blob', sha: blobRes.body.sha });
  }

  // 4. Create new tree based on current tree + updated entries
  const treeRes = await ghRequest({
    method: 'POST',
    path: `/repos/${repo}/git/trees`,
    token,
    body: { base_tree: baseTreeSha, tree: treeEntries }
  });
  if (treeRes.status !== 201) throw new Error(`Cannot create tree: ${treeRes.status} ${JSON.stringify(treeRes.body)}`);

  // 5. Create commit pointing to new tree
  const newCommitRes = await ghRequest({
    method: 'POST',
    path: `/repos/${repo}/git/commits`,
    token,
    body: {
      message,
      tree: treeRes.body.sha,
      parents: [currentCommitSha],
      author: committer,
      committer
    }
  });
  if (newCommitRes.status !== 201) throw new Error(`Cannot create commit: ${newCommitRes.status} ${JSON.stringify(newCommitRes.body)}`);

  // 6. Update branch ref to point to new commit (atomic with optimistic concurrency)
  const refUpdateRes = await ghRequest({
    method: 'PATCH',
    path: `/repos/${repo}/git/refs/heads/${branch}`,
    token,
    body: { sha: newCommitRes.body.sha, force: false }
  });
  if (refUpdateRes.status !== 200) {
    throw new Error(`Cannot update ref (someone else pushed): ${refUpdateRes.status}`);
  }

  return {
    commitSha: newCommitRes.body.sha,
    commitUrl: newCommitRes.body.html_url,
    treeSha: treeRes.body.sha
  };
}

module.exports = { commitMultipleFiles };
