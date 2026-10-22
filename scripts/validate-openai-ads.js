// Run with production Pixel ID and CAPI key in the environment. No conversion is saved.
const { randomUUID } = require('node:crypto');
const { configured, sendEvent } = require('../api/_lib/openai-ads');
async function main() {
  if (!configured()) throw new Error('Configure OPENAI_ADS_PIXEL_ID and OPENAI_ADS_CONVERSIONS_API_KEY');
  const ok = await sendEvent({
    id: 'validation-' + randomUUID(), type: 'lead_created', timestamp_ms: Date.now(),
    action_source: 'web', source_url: 'https://www.intothecom.com/hablemos',
    opt_out: true, data: { type: 'customer_action' },
  }, { validateOnly: true });
  if (!ok) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
