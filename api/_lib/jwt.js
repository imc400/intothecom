/* api/_lib/jwt.js — Helpers JWT minimalistas (HS256) sin dependencias externas.
   Suficiente para cookie-based session auth de un admin panel.

   sign(payload, secret, ttlSeconds) => string token
   verify(token, secret) => payload | null
   parseCookies(cookieHeader) => {[name]: value}
   serializeCookie(name, value, opts) => string (Set-Cookie value) */

const crypto = require('crypto');

function base64UrlEncode(bufOrStr) {
  const b = Buffer.isBuffer(bufOrStr) ? bufOrStr : Buffer.from(bufOrStr);
  return b.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(padLen), 'base64');
}

function sign(payload, secret, ttlSeconds = 28800) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = Object.assign({}, payload, {
    iat: now,
    exp: now + ttlSeconds
  });
  const h = base64UrlEncode(JSON.stringify(header));
  const p = base64UrlEncode(JSON.stringify(body));
  const data = `${h}.${p}`;
  const sig = base64UrlEncode(crypto.createHmac('sha256', secret).update(data).digest());
  return `${data}.${sig}`;
}

function verify(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;
  const data = `${h}.${p}`;
  const expectedSig = base64UrlEncode(crypto.createHmac('sha256', secret).update(data).digest());
  let sigBuf, expBuf;
  try {
    sigBuf = Buffer.from(sig);
    expBuf = Buffer.from(expectedSig);
  } catch (_) {
    return null;
  }
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(p).toString('utf-8'));
  } catch (_) {
    return null;
  }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const piece of cookieHeader.split(';')) {
    const idx = piece.indexOf('=');
    if (idx < 0) continue;
    const name = piece.slice(0, idx).trim();
    const value = piece.slice(idx + 1).trim();
    if (name) out[name] = decodeURIComponent(value);
  }
  return out;
}

function serializeCookie(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  if (opts.secure) parts.push('Secure');
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  return parts.join('; ');
}

module.exports = { sign, verify, parseCookies, serializeCookie };
