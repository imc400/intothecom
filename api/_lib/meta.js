const { createHash, randomUUID } = require('node:crypto');
const { isIP } = require('node:net');
const { waitUntil } = require('@vercel/functions');
const ORIGINS = ['https://www.intothecom.com', 'https://intothecom.com'];
const CONSENT = 'accepted.2026-10-19';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const buckets = new Map();
const hash = value => createHash('sha256').update(value).digest('hex');
function cookie(req, name) {
  const part = String(req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  try { return part ? decodeURIComponent(part.slice(name.length + 1)) : ''; } catch { return ''; }
}
const consented = req => cookie(req, 'into_meta_consent') === CONSENT;
const configured = () => /^\d+$/.test(process.env.META_PIXEL_ID || '') && !!process.env.META_CONVERSIONS_ACCESS_TOKEN;
function publicUrl(value) {
  try {
    const url = new URL(value, ORIGINS[0]);
    if (!ORIGINS.includes(url.origin)) return null;
    const path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (!['/', '/servicios', '/software-ia', '/paid-media', '/email-marketing', '/desarrollo-web', '/community-management', '/nosotros', '/hablemos', '/casos', '/recursos', '/equipo/ignacio-blanco'].includes(path) && !/^\/recursos\/[a-z0-9-]{1,120}$/.test(path)) return null;
    for (const [key, val] of url.searchParams) if (!/^(utm_(source|medium|campaign|content|term)|oppref|fbclid|gclid|gbraid|wbraid)$/.test(key) || val.length > (key === 'oppref' ? 4096 : 512) || val.includes('@')) return null;
    return ORIGINS[0] + path;
  } catch { return null; }
}
function clientIp(req) {
  return String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
}
function limited(req) {
  const now = Date.now(), key = hash(clientIp(req));
  for (const [id, value] of buckets) if (value.until <= now) buckets.delete(id);
  if (buckets.size >= 10000 && !buckets.has(key)) return true;
  const value = buckets.get(key) || { hits: 0, until: now + 60000 };
  value.hits++; buckets.set(key, value);
  return value.hits > 60;
}
async function readBody(req) {
  if (Number(req.headers['content-length']) > 16000) throw new Error('BODY_TOO_LARGE');
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (raw.length > 16000) throw new Error('BODY_TOO_LARGE');
    return JSON.parse(raw);
  }
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 16000) throw new Error('BODY_TOO_LARGE'); }
  return JSON.parse(raw || '{}');
}
function eventFor(req, { name, id, url, email, contentName }) {
  const source = publicUrl(url);
  if (!consented(req) || !source || !req.headers['user-agent']) return null;
  const user = { client_user_agent: String(req.headers['user-agent']).slice(0, 1000) };
  const ip = clientIp(req); if (isIP(ip)) user.client_ip_address = ip;
  for (const key of ['fbp', 'fbc']) {
    const value = cookie(req, '_' + key);
    if (/^fb\.\d\.\d{13}\.[A-Za-z0-9_-]{1,512}$/.test(value)) user[key] = value;
  }
  if (email) user.em = [hash(email.trim().toLowerCase())];
  return { event_name: name, event_id: id, event_time: Math.floor(Date.now() / 1000), action_source: 'website', event_source_url: source, user_data: user, ...(contentName ? { custom_data: { content_name: contentName } } : {}) };
}
async function sendEvent(event, testCode) {
  if (!event || !configured()) return false;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`https://graph.facebook.com/v25.0/${process.env.META_PIXEL_ID}/events`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.META_CONVERSIONS_ACCESS_TOKEN}` },
        body: JSON.stringify({ data: [event], ...(testCode ? { test_event_code: testCode } : {}) }), signal: AbortSignal.timeout(8000),
      });
      const result = await res.json();
      if (res.ok && result.events_received === 1) { console.info('[meta] accepted', { event: event.event_name, eventId: event.event_id }); return true; }
      if (attempt === 0 && (res.status === 429 || res.status >= 500 || result.error?.is_transient)) continue;
      console.error('[meta] rejected', { status: res.status, code: result.error?.code, event: event.event_name });
      return false;
    } catch { if (attempt === 1) console.error('[meta] unavailable', { event: event.event_name }); }
  }
  return false;
}
function schedule(event) {
  if (!event || !configured()) return false;
  const pending = sendEvent(event);
  try { waitUntil(pending); } catch { pending.catch(() => {}); }
  return true;
}
function leadReceipt(req, email, deliveryId) {
  if (!consented(req) || !deliveryId) return undefined;
  const eventId = 'into-lead-' + hash(String(deliveryId));
  schedule(eventFor(req, { name: 'Lead', id: eventId, url: '/hablemos', email, contentName: 'brief_form' }));
  return { eventId, contentName: 'brief_form' };
}
module.exports = { ORIGINS, UUID, configured, consented, publicUrl, limited, readBody, eventFor, sendEvent, schedule, leadReceipt, randomUUID };
