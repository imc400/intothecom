/* api/_lib/gsc.js — Helper para Google Search Console API.
   Soporta DOS flows de autenticación (priorizado en este orden):

   1. OAuth 2.0 refresh_token (PREFERIDO, no afectado por bug GSC 23-04-2026)
      - Requiere: GSC_OAUTH_REFRESH_TOKEN + GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
      - Autentica como usuario humano que ya es Owner de la property
   2. Service Account JWT (fallback)
      - Requiere: GSC_SERVICE_ACCOUNT_JSON
      - Autentica como SA — pero falla si GSC no lo reconoce como user

   Property URL en GSC_PROPERTY_URL (ej. "sc-domain:intothecom.com").

   Public API:
   - loadServiceAccount(): valida y devuelve el SA parseado
   - getAccessToken(): obtiene access_token usando el flow disponible
   - query(body): hace POST a searchAnalytics/query
   - getAuthMethod(): retorna 'oauth' | 'service_account' | 'none'
*/

const https = require('https');
const crypto = require('crypto');

const TOKEN_URI = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

// Cache de token en memoria del Lambda (expires después de 1h)
let _tokenCache = null;

function getAuthMethod() {
  if (process.env.GSC_OAUTH_REFRESH_TOKEN &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET) return 'oauth';
  if (process.env.GSC_SERVICE_ACCOUNT_JSON) return 'service_account';
  return 'none';
}

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

async function getAccessTokenViaServiceAccount() {
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
    throw new Error(`Token exchange (SA) failed: ${result.status} ${JSON.stringify(result.body)}`);
  }
  return { access_token: result.body.access_token, expires_in: result.body.expires_in };
}

async function getAccessTokenViaRefreshToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GSC_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('OAuth env vars missing: GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GSC_OAUTH_REFRESH_TOKEN');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  const result = await httpPost({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    body: params.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (result.status !== 200) {
    throw new Error(`Token exchange (OAuth refresh) failed: ${result.status} ${JSON.stringify(result.body)}`);
  }
  return { access_token: result.body.access_token, expires_in: result.body.expires_in };
}

async function getAccessToken(forceFresh = false) {
  // Use cache si no expiró (renovamos 5min antes de expirar)
  if (!forceFresh && _tokenCache && _tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return _tokenCache.token;
  }

  const method = getAuthMethod();
  if (method === 'none') {
    throw new Error('No GSC auth method configured. Need either GSC_OAUTH_REFRESH_TOKEN+GOOGLE_CLIENT_* or GSC_SERVICE_ACCOUNT_JSON');
  }

  const { access_token, expires_in } = method === 'oauth'
    ? await getAccessTokenViaRefreshToken()
    : await getAccessTokenViaServiceAccount();

  _tokenCache = {
    token: access_token,
    expiresAt: Date.now() + (expires_in * 1000),
    method
  };
  return access_token;
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

module.exports = { loadServiceAccount, getAccessToken, query, getSitemaps, getAuthMethod };
