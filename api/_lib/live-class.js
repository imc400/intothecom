const CLASS_ID = 'shopify-meta-2026-10-04';
const SEGMENT_NAME = 'Soy Nacho White · Shopify + Meta Ads · 04 oct 2026';
const STARTS_AT = '2026-10-04T21:00:00.000Z';
const PROPERTY = 'snw_20261004_registration';

async function resendRequest(path, { method = 'GET', body } = {}) {
  const key = process.env.RESEND_CONTACTS_API_KEY || process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_NOT_CONFIGURED');
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`https://api.resend.com${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 429 && attempt < 3) {
      const seconds = Number(response.headers.get('retry-after')) || attempt + 1;
      await new Promise(resolve => setTimeout(resolve, Math.min(seconds, 3) * 1000 + Math.random() * 300));
      continue;
    }
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(`RESEND_${response.status}`);
      error.status = response.status;
      error.code = data.name;
      throw error;
    }
    return data;
  }
}

let segment;
async function getSegment() {
  if (process.env.LIVE_CLASS_SEGMENT_ID) return process.env.LIVE_CLASS_SEGMENT_ID;
  if (segment) return segment;
  const { data = [] } = await resendRequest('/segments');
  segment = data.find(item => item.name === SEGMENT_NAME)?.id;
  if (!segment) throw new Error('LIVE_CLASS_NOT_CONFIGURED');
  return segment;
}

module.exports = { CLASS_ID, SEGMENT_NAME, STARTS_AT, PROPERTY, resendRequest, getSegment };
