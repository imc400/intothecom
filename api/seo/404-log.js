/* api/seo/404-log.js — POST: registra cada 404 que un usuario/bot encuentra en runtime.
   Sin auth (la 404 page lo invoca). Solo loggea a Vercel logs — útil para detectar
   URLs viejas con tráfico real que necesitan redirect.

   Body o query: path + referrer + user-agent */

module.exports = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const path = url.searchParams.get('path') || '';
  const ref = url.searchParams.get('ref') || '';
  const ua = req.headers['user-agent'] || '';

  // Anti-flood: validar path razonable
  if (!path || path.length > 500) {
    res.status(204).end();
    return;
  }

  // Log a stdout (Vercel captura logs)
  console.log(JSON.stringify({
    type: '404_runtime',
    path: path.slice(0, 500),
    referrer: ref.slice(0, 500),
    userAgent: ua.slice(0, 200),
    timestamp: new Date().toISOString()
  }));

  res.status(204).end();
};
