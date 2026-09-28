const { CLASS_ID, STARTS_AT, PROPERTY, getSegment, resendRequest } = require('./_lib/live-class');
const { createHash } = require('node:crypto');

// Best-effort per-instance throttle; Vercel's firewall remains the outer layer.
// Store only IP hashes, bound memory, and do not log either IPs or hashes.
const buckets = new Map();
function throttled(req) {
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const key = createHash('sha256').update(ip).digest('hex');
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.until) {
    if (buckets.size >= 5000) buckets.delete(buckets.keys().next().value);
    bucket = { count: 0, until: now + 600000 };
    buckets.set(key, bucket);
  }
  return ++bucket.count > 30;
}

const ALLOWED_ORIGINS = new Set(['https://www.intothecom.com', 'https://intothecom.com']);
function permittedOrigin(origin) {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (process.env.VERCEL_ENV === 'preview' && origin === `https://${process.env.VERCEL_URL}`) return true;
  return process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

async function readBody(req) {
  if (Number(req.headers['content-length']) > 4096) throw new Error('BODY_TOO_LARGE');
  if (req.body !== undefined) {
    if (Buffer.byteLength(JSON.stringify(req.body)) > 4096) throw new Error('BODY_TOO_LARGE');
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > 4096) throw new Error('BODY_TOO_LARGE');
  }
  return JSON.parse(raw);
}

const clean = (value, max) => typeof value === 'string' ? value.trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, max) : '';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }
  if (!permittedOrigin(req.headers.origin || '')) return res.status(403).json({ ok: false, error: 'Abre el formulario desde la página de la clase.' });
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).json({ ok: false, error: 'Formato no válido.' });
  if (Date.now() >= Date.parse(STARTS_AT)) return res.status(410).json({ ok: false, error: 'La inscripción para esta clase ya cerró.' });

  let body;
  try { body = await readBody(req); }
  catch { return res.status(400).json({ ok: false, error: 'Revisa los datos del formulario.' }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ ok: false, error: 'Revisa los datos del formulario.' });
  if (body.website) return res.status(400).json({ ok: false, error: 'No pudimos completar la inscripción.' });
  const name = clean(body.name, 100);
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (name.length < 2 || email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || body.consent !== true) {
    return res.status(400).json({ ok: false, error: 'Ingresa tu nombre, un correo válido y acepta recibir la información de esta clase.' });
  }
  if (throttled(req)) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ ok: false, error: 'Hay demasiados intentos desde tu conexión. Espera unos minutos y vuelve a intentarlo.' });
  }

  try {
    const segmentId = await getSegment();
    const contactPath = `/contacts/${encodeURIComponent(email)}`;
    let contact;
    try { contact = await resendRequest(contactPath); }
    catch (error) { if (error.status !== 404) throw error; }
    const registration = JSON.stringify({
      name, at: new Date().toISOString(), consent: CLASS_ID,
      source: clean(body.utm_source, 60) || 'direct',
      medium: clean(body.utm_medium, 60), campaign: clean(body.utm_campaign, 60),
    });
    if (!contact) {
      try {
        await resendRequest('/contacts', { method: 'POST', body: {
          email, first_name: name, properties: { [PROPERTY]: registration }, segments: [{ id: segmentId }],
        } });
      } catch (error) {
        // A simultaneous request may already have created this email.
        if (error.status !== 409 && error.status !== 422) throw error;
        contact = await resendRequest(contactPath);
      }
    }
    if (contact) {
      await resendRequest(`${contactPath}/segments/${segmentId}`, { method: 'POST' });
      const property = contact.properties?.[PROPERTY];
      const previousRegistration = typeof property === 'string' ? property : property?.value;
      if (!previousRegistration) {
        // Do not overwrite existing names, other properties or unsubscribe preferences.
        await resendRequest(contactPath, { method: 'PATCH', body: { properties: { [PROPERTY]: registration } } });
      }
    }
    // No email is sent here. A saved contact is the source of truth for success.
    return res.status(200).json({ ok: true, classId: CLASS_ID });
  } catch (error) {
    // Never log names, addresses, attribution or provider response bodies.
    console.error('[live-class] Registration failed:', error.status || error.message);
    res.setHeader('Retry-After', '10');
    return res.status(503).json({ ok: false, error: 'No pudimos guardar tu inscripción. Tus datos siguen en el formulario; intenta de nuevo en unos segundos.' });
  }
};
