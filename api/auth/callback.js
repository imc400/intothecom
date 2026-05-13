/* api/auth/callback.js — Recibe code de Google, valida, set JWT cookie. */

const https = require('https');
const { sign, parseCookies, serializeCookie } = require('../_lib/jwt.js');

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = typeof body === 'string' ? body : new URLSearchParams(body).toString();
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
        'Accept': 'application/json'
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
    req.write(data);
    req.end();
  });
}

function decodeIdToken(idToken) {
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;
  try {
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (payloadB64.length % 4)) % 4;
    return JSON.parse(Buffer.from(payloadB64 + '='.repeat(padLen), 'base64').toString('utf-8'));
  } catch (_) {
    return null;
  }
}

module.exports = async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;
  const allowlist = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase());

  if (!clientId || !clientSecret || !sessionSecret) {
    res.status(500).send('OAuth env vars not configured');
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    res.status(400).send(`OAuth error: ${error}`);
    return;
  }
  if (!code) {
    res.status(400).send('Missing code parameter');
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  if (!state || cookies.oauth_state !== state) {
    res.status(400).send('Invalid state parameter (possible CSRF)');
    return;
  }

  const host = req.headers.host || 'intothecom.com';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${host}/api/auth/callback`;

  // Exchange code for tokens
  const tokenResponse = await httpsPost('https://oauth2.googleapis.com/token', {
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  if (tokenResponse.status !== 200 || !tokenResponse.body.id_token) {
    res.status(401).send('Token exchange failed: ' + JSON.stringify(tokenResponse.body));
    return;
  }

  const idTokenPayload = decodeIdToken(tokenResponse.body.id_token);
  if (!idTokenPayload || !idTokenPayload.email) {
    res.status(401).send('Invalid id_token');
    return;
  }

  if (!idTokenPayload.email_verified) {
    res.status(403).send('Email not verified by Google');
    return;
  }

  const email = String(idTokenPayload.email).toLowerCase();
  if (!allowlist.includes(email)) {
    res.status(403).send(`Email ${email} not in admin allowlist. Contact owner.`);
    return;
  }

  // Sign session JWT
  const sessionToken = sign({
    email: email,
    name: idTokenPayload.name || '',
    picture: idTokenPayload.picture || ''
  }, sessionSecret, 28800); // 8 hours

  const cookieHeaders = [
    serializeCookie('admin_session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 28800
    }),
    serializeCookie('oauth_state', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 0
    })
  ];

  res.setHeader('Set-Cookie', cookieHeaders);
  res.statusCode = 302;
  res.setHeader('Location', '/admin');
  res.end();
};
