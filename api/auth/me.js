/* api/auth/me.js — Retorna info del usuario actual si esta logueado, 401 si no. */

const {parseCookies, verify} = require('../_lib/jwt.js');

module.exports = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    res.status(500).json({error: 'SESSION_SECRET not configured'});
    return;
  }
  const payload = verify(cookies.admin_session, secret);
  if (!payload || !payload.email) {
    res.status(401).json({authenticated: false});
    return;
  }
  const allowlist = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase());
  if (!allowlist.includes(payload.email.toLowerCase())) {
    res.status(403).json({authenticated: false, error: 'Email not in allowlist'});
    return;
  }
  res.status(200).json({
    authenticated: true,
    email: payload.email,
    name: payload.name || '',
    picture: payload.picture || '',
    exp: payload.exp
  });
};
