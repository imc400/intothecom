const meta = require('./_lib/meta');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!meta.ORIGINS.includes(req.headers.origin)) return res.status(403).json({ ok: false });
  if (!meta.consented(req) || !meta.configured()) return res.status(200).json({ ok: true, measured: false });
  if (meta.limited(req)) return res.status(429).json({ ok: false });
  try {
    const body = await meta.readBody(req);
    if (!body || !['PageView', 'Contact'].includes(body.eventName) || !meta.UUID.test(body.eventId || '') || !meta.publicUrl(body.url)) return res.status(400).json({ ok: false });
    const event = meta.eventFor(req, { name: body.eventName, id: body.eventId, url: body.url, ...(body.eventName === 'Contact' ? { contentName: 'whatsapp_click' } : {}) });
    return res.status(202).json({ ok: true, measured: meta.schedule(event) });
  } catch { return res.status(400).json({ ok: false }); }
};
