// Explicit, idempotent provisioning. Normal builds have no remote side effects.
// Run with LIVE_CLASS_SETUP=1 in the configured Vercel build environment.
const { SEGMENT_NAME, PROPERTY, resendRequest } = require('../api/_lib/live-class');

async function setup() {
  const segments = await resendRequest('/segments');
  let segment = segments.data.find(item => item.name === SEGMENT_NAME);
  if (!segment) segment = await resendRequest('/segments', { method: 'POST', body: { name: SEGMENT_NAME } });
  const properties = await resendRequest('/contact-properties');
  if (!properties.data.some(item => item.key === PROPERTY)) {
    await resendRequest('/contact-properties', { method: 'POST', body: { key: PROPERTY, type: 'string' } });
  }
  console.log('[live-class] Registration storage ready. Segment:', segment.id);
}

if (process.env.LIVE_CLASS_SETUP === '1') setup().catch(error => {
  console.error('[live-class] Setup failed:', error.message, error.code || '');
  process.exitCode = 1;
});
