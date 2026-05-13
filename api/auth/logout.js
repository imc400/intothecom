/* api/auth/logout.js — Limpia la cookie de session. */

const {serializeCookie} = require('../_lib/jwt.js');

module.exports = (req, res) => {
  res.setHeader('Set-Cookie', serializeCookie('admin_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 0
  }));
  res.statusCode = 302;
  res.setHeader('Location', '/admin');
  res.end();
};
