const { createHash } = require('node:crypto');
const { isIP } = require('node:net');
const { waitUntil } = require('@vercel/functions');

const CONSENT = 'accepted.2026-10-22';
const hash = value => createHash('sha256').update(value).digest('hex');
function cookie(req, name) {
  const part = String(req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  try { return part ? decodeURIComponent(part.slice(name.length + 1)) : ''; } catch { return ''; }
}
const consented = req => cookie(req, 'into_openai_consent') === CONSENT;
const pixelConfigured = () => /^[A-Za-z0-9_-]{1,200}$/.test(process.env.OPENAI_ADS_PIXEL_ID || '') && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production');
const configured = () => pixelConfigured() && !!process.env.OPENAI_ADS_CONVERSIONS_API_KEY;
function reference(value) {
  return value && value.length <= 4096 && !/[\x00-\x20\x7f]/.test(value) ? value : undefined;
}

// Only the successful lead handler can create this conversion; there is no public event relay.
function leadEvent(req, email, deliveryId) {
  if (!consented(req) || !pixelConfigured() || !deliveryId) return null;
  const user = {};
  const obref = reference(cookie(req, '__obref'));
  if (obref) user.obref = obref;
  if (email) user.emails_sha256 = [hash(email.trim().toLowerCase())];
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  if (isIP(ip)) user.ip_address = ip;
  if (req.headers['user-agent']) user.user_agent = String(req.headers['user-agent']).slice(0, 1000);
  const oppref = reference(cookie(req, '__oppref'));
  return {
    id: 'into-openai-lead-' + hash(String(deliveryId)),
    type: 'lead_created',
    timestamp_ms: Date.now(),
    action_source: 'web',
    source_url: 'https://www.intothecom.com/hablemos',
    opt_out: true,
    ...(oppref ? { oppref } : {}),
    user,
    data: { type: 'customer_action' },
  };
}

async function sendEvent(event, { validateOnly = false } = {}) {
  if (!event || !configured()) return false;
  // Retry the exact event (including ID and timestamp), never the email submission.
  const body = JSON.stringify({ validate_only: validateOnly, events: [event] });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(`https://bzr.openai.com/v1/events?pid=${encodeURIComponent(process.env.OPENAI_ADS_PIXEL_ID)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_ADS_CONVERSIONS_API_KEY}` },
        body, signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        console.info('[openai-ads] ' + (validateOnly ? 'validated' : 'accepted'), { event: event.type, eventId: event.id });
        return true;
      }
      if (attempt === 0 && (response.status === 429 || response.status >= 500)) continue;
      console.error('[openai-ads] rejected', { status: response.status, event: event.type });
      return false;
    } catch {
      if (attempt === 1) console.error('[openai-ads] unavailable', { event: event.type });
    }
  }
  return false;
}

function leadReceipt(req, email, deliveryId) {
  const event = leadEvent(req, email, deliveryId);
  if (!event) return undefined;
  if (configured()) {
    const pending = sendEvent(event);
    try { waitUntil(pending); } catch { pending.catch(() => {}); }
  }
  return { eventId: event.id };
}
module.exports = { consented, configured, leadEvent, leadReceipt, sendEvent };
