/* api/_lib/gsc.js — Helper para Google Search Console API.
   Autenticación: Service Account JWT → access_token → API calls.

   Service Account JSON en env var GSC_SERVICE_ACCOUNT_JSON.
   Property URL en GSC_PROPERTY_URL (ej. "sc-domain:intothecom.com").

   Public API:
   - loadServiceAccount(): valida y devuelve el SA parseado
   - getAccessToken(): firma JWT + obtiene access_token (cacheado)
   - query(body): hace POST a searchAnalytics/query
*/

const https = require('https');
const crypto = require('crypto');

const TOKEN_URI = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

// Cache de token en memoria del Lambda (expires después de 1h)
let _tokenCache = null;

function loadServiceAccount() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GSC_SERVICE_ACCOUNT_JSON env var not set');
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch (e) {
    throw new Error(`GSC_SERVICE_ACCOUNT_JSON is not valid JSON: ${e.message}`);
  }
  if (!sa.client_email) throw new Error('Service Account JSON missing client_email');
  if (!sa.private_key) throw new Error('Service Account JSON missing private_key');
  if (!sa.token_uri) sa.token_uri = TOKEN_URI;
  // Normalize private_key (some env stores escape \n as literal text)
  if (sa.private_key.includes('\\n')) {
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  }
  return sa;
}

function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJWT(sa, scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: scope,
    aud: sa.token_uri,
    exp: now + 3600,
    iat: now
  };
  const signingInput = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(payload));
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign(sa.private_key)
    .toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return signingInput + '.' + signature;
}

function httpPost({ hostname, path, body, headers, timeoutMs = 10000 }) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: timeoutMs
    }, (resp) => {
      let chunks = '';
      resp.on('data', (c) => chunks += c);
      resp.on('end', () => {
        try { resolve({ status: resp.statusCode, body: JSON.parse(chunks) }); }
        catch { resolve({ status: resp.statusCode, body: chunks }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('GSC timeout')); });
    req.write(data);
    req.end();
  });
}

async function getAccessToken(forceFresh = false) {
  // Use cache si no expiró (renovamos 5min antes de expirar)
  if (!forceFresh && _tokenCache && _tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return _tokenCache.token;
  }

  const sa = loadServiceAccount();
  const jwt = signJWT(sa, SCOPE);
  const body = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;

  const result = await httpPost({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (result.status !== 200) {
    throw new Error(`Token exchange failed: ${result.status} ${JSON.stringify(result.body)}`);
  }

  _tokenCache = {
    token: result.body.access_token,
    expiresAt: Date.now() + (result.body.expires_in * 1000)
  };
  return result.body.access_token;
}

// Hace POST a searchanalytics/query con el body de GSC API
async function query(body) {
  const token = await getAccessToken();
  const propertyUrl = process.env.GSC_PROPERTY_URL;
  if (!propertyUrl) throw new Error('GSC_PROPERTY_URL env var not set');

  const result = await httpPost({
    hostname: 'searchconsole.googleapis.com',
    path: `/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
    body,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeoutMs: 15000
  });
  return result;
}

// Lista de URLs indexadas (Sitemap submission state)
async function getSitemaps() {
  const token = await getAccessToken();
  const propertyUrl = process.env.GSC_PROPERTY_URL;
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'searchconsole.googleapis.com',
      path: `/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/sitemaps`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 10000
    }, (resp) => {
      let chunks = '';
      resp.on('data', (c) => chunks += c);
      resp.on('end', () => {
        try { resolve({ status: resp.statusCode, body: JSON.parse(chunks) }); }
        catch { resolve({ status: resp.statusCode, body: chunks }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('GSC timeout')); });
    req.end();
  });
}

module.exports = { loadServiceAccount, getAccessToken, query, getSitemaps };
