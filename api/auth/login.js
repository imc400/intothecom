/* api/auth/login.js — Redirect a Google OAuth con hd=intothecom.com hint */

const crypto = require('crypto');
const { serializeCookie } = require('../_lib/jwt.js');

module.exports = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('GOOGLE_CLIENT_ID not configured');
    return;
  }

  const host = req.headers.host || 'intothecom.com';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${host}/api/auth/callback`;

  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    access_type: 'online',
    prompt: 'select_account',
    hd: 'intothecom.com'
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  res.setHeader('Set-Cookie', serializeCookie('oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 600
  }));
  res.statusCode = 302;
  res.setHeader('Location', googleAuthUrl);
  res.end();
};
