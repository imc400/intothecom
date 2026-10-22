const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { createHash, randomUUID, webcrypto } = require('node:crypto');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const Module = require('node:module');
const originalLoad = Module._load, realFetch = global.fetch;
let pending = [], requests = [], mails = [], failMail = false;
Module._load = function (name, ...args) {
  if (name === '@vercel/functions') return { waitUntil: promise => pending.push(promise) };
  if (name === 'resend') return { Resend: class {
    emails = { send: async (message, options) => {
      mails.push({ message, options });
      return failMail ? { error: { message: 'test failure' } } : { data: { id: options.idempotencyKey } };
    } };
  } };
  return originalLoad.call(this, name, ...args);
};
const ads = require('../api/_lib/openai-ads');
const lead = require('../api/lead');
Module._load = originalLoad;
const consent = 'into_openai_consent=accepted.2026-10-22';
const hash = value => createHash('sha256').update(value).digest('hex');
function req(body = {}, cookies = consent) {
  return { method: 'POST', body, headers: {
    origin: 'https://www.intothecom.com', cookie: cookies,
    'user-agent': 'Measurement test', 'x-vercel-forwarded-for': '203.0.113.12',
  } };
}
async function run(body, cookies) {
  const response = { status(n) { this.code = n; return this; }, json(data) { this.data = data; return this; }, setHeader() {}, end() {} };
  await lead(req(body, cookies), response);
  await Promise.all(pending.splice(0));
  return response;
}
beforeEach(() => {
  pending = []; requests = []; mails = []; failMail = false;
  delete process.env.VERCEL_ENV;
  delete process.env.META_CONVERSIONS_ACCESS_TOKEN;
  process.env.OPENAI_ADS_PIXEL_ID = 'test-pixel';
  process.env.OPENAI_ADS_CONVERSIONS_API_KEY = 'test-secret';
  process.env.RESEND_API_KEY = 'test-email-key';
  global.fetch = async (url, options) => { requests.push({ url, options, body: JSON.parse(options.body) }); return new Response(null, { status: 204 }); };
});
afterEach(async () => { await Promise.all(pending.splice(0)); global.fetch = realFetch; });

test('CAPI requires fresh OpenAI consent, even for existing Meta visitors', () => {
  for (const cookies of ['', 'into_meta_consent=accepted.2026-10-19', 'into_openai_consent=rejected.2026-10-22', 'into_openai_consent=accepted.old']) {
    assert.equal(ads.leadEvent(req({}, cookies), 'person@example.com', 'delivery'), null);
  }
  process.env.VERCEL_ENV = 'preview';
  assert.equal(ads.leadEvent(req(), 'person@example.com', 'delivery'), null);
});
test('CAPI preserves attribution references and sends only the normalized email hash', () => {
  const event = ads.leadEvent(req({}, consent + '; __oppref=original%2Fclick%3Dref; __obref=original-browser'), ' Person@Example.COM ', 'delivery');
  assert.equal(event.oppref, 'original/click=ref');
  assert.equal(event.user.obref, 'original-browser');
  assert.equal(event.user.emails_sha256[0], hash('person@example.com'));
  assert.equal(event.source_url, 'https://www.intothecom.com/hablemos');
  assert.equal(event.user.ip_address, '203.0.113.12');
  assert.equal(event.type, 'lead_created');
  assert.equal(event.data.type, 'customer_action');
  assert.ok(Number.isInteger(event.timestamp_ms));
  assert.ok(!JSON.stringify(event).includes('@'));
  assert.ok(!ads.leadEvent(req({}, consent + '; __oppref=%0A'), '', 'delivery').oppref);
});
test('confirmed brief uses stable browser/server event ID and does not expose form fields', async () => {
  const body = { name: 'Test', email: 'person@example.com', message: 'Private message', company: 'Private company', budget: 'Private budget', submission_id: randomUUID() };
  const first = await run(body), second = await run(body);
  assert.equal(first.code, 200);
  assert.equal(first.data.openai.eventId, second.data.openai.eventId);
  assert.equal(first.data.openai.eventId, requests[0].body.events[0].id);
  assert.equal(requests[0].body.events[0].id, requests[1].body.events[0].id);
  assert.equal(mails[0].options.idempotencyKey, mails[2].options.idempotencyKey);
  assert.ok(!JSON.stringify(requests).includes('Private'));
  assert.ok(!JSON.stringify(requests).includes('person@example.com'));
  assert.ok(!requests[0].url.includes('test-secret'));
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test-secret');
});
test('failed, invalid, bot and unconsented submissions never create conversions', async () => {
  const body = { name: 'Test', email: 'person@example.com', message: 'Test' };
  assert.equal((await run(body, '')).data.openai, undefined);
  assert.equal((await run({ ...body, _honey: 'bot' })).data.openai, undefined);
  assert.equal((await run({ ...body, email: 'bad' })).code, 400);
  failMail = true;
  assert.equal((await run(body)).code, 500);
  assert.equal(requests.length, 0);
});
test('transient OpenAI errors retry the same event without failing the contact request', async () => {
  global.fetch = async (_, options) => { requests.push(options.body); return new Response(null, { status: 503 }); };
  const response = await run({ name: 'Test', email: 'test@example.com', message: 'Test' });
  assert.equal(response.code, 200);
  assert.equal(response.data.ok, true);
  assert.equal(requests.length, 2);
  assert.equal(requests[0], requests[1]);
});
test('validation does not save conversions; permanent errors and missing credentials do not retry', async () => {
  const event = ads.leadEvent(req(), '', 'delivery');
  assert.equal(await ads.sendEvent(event, { validateOnly: true }), true);
  assert.equal(requests[0].body.validate_only, true);
  let calls = 0;
  global.fetch = async () => { calls++; return new Response(null, { status: 401 }); };
  assert.equal(await ads.sendEvent(event), false);
  assert.equal(calls, 1);
  delete process.env.OPENAI_ADS_CONVERSIONS_API_KEY;
  assert.equal(await ads.sendEvent(event), false);
  assert.equal(calls, 1);
});

function browser(cookies = consent, path = '/', pixelId = 'test-pixel') {
  const jar = new Map(cookies.split(';').filter(Boolean).map(s => s.trim().split('='))), calls = [], loaded = [], ready = [];
  const location = new URL('https://www.intothecom.com' + path);
  const document = { readyState: 'loading', addEventListener(_, fn) { ready.push(fn); }, createElement() { return {}; }, head: { appendChild(script) { loaded.push(script); } } };
  Object.defineProperty(document, 'cookie', {
    get() { return [...jar].map(([k, v]) => k + '=' + v).join('; '); },
    set(value) { const [kv] = value.split(';'), at = kv.indexOf('='), k = kv.slice(0, at), v = kv.slice(at + 1); if (value.includes('Max-Age=0')) jar.delete(k); else jar.set(k, v); },
  });
  const window = { OPENAI_ADS_PIXEL_ID: pixelId, oaiq: (...args) => calls.push(args) };
  vm.runInNewContext(readFileSync(require.resolve('../assets/openai-ads'), 'utf8'), { window, document, location, crypto: webcrypto, URLSearchParams, Set, Date });
  return { window, document, location, calls, loaded, ready, jar };
}
test('browser excludes private pages, private queries, unconfigured sites and old Meta consent', () => {
  for (const path of ['/admin', '/api/auth/callback?code=secret', '/hablemos?email=person@example.com', '/?utm_campaign=person%40example.com']) {
    const b = browser(consent, path); b.window.intoOpenAI.track('page_viewed'); assert.equal(b.loaded.length, 0);
  }
  const missing = browser(consent, '/', ''); missing.ready[0](); assert.equal(missing.loaded.length, 0);
  const legacy = browser('into_meta_consent=accepted.2026-10-19');
  assert.equal(legacy.window.intoOpenAI.needsChoice(), true);
  legacy.ready[0](); assert.equal(legacy.loaded.length, 0);
});
test('browser tracks SPA views and WhatsApp accurately and deduplicates lead receipts', () => {
  const b = browser(consent + '; __oppref=persisted-click', '/?oppref=ad-click');
  b.ready[0](); b.window.intoOpenAI.track('page_viewed');
  assert.equal(b.calls.filter(args => args[1] === 'page_viewed').length, 1);
  assert.equal(b.calls.some(args => args[0] === 'consent' && args[1] === false), false, 'initialization must not erase existing attribution');
  b.location.pathname = '/hablemos'; b.window.intoOpenAI.track('page_viewed');
  assert.equal(b.calls.filter(args => args[1] === 'page_viewed').length, 2);
  b.window.intoOpenAI.track('whatsapp_clicked');
  assert.equal(b.calls.at(-1)[1], 'custom');
  assert.equal(b.calls.at(-1)[3].custom_event_name, 'whatsapp_clicked');
  const receipt = { eventId: 'into-openai-lead-' + 'a'.repeat(64) };
  b.window.intoOpenAI.lead(receipt); b.window.intoOpenAI.lead(receipt);
  assert.equal(b.calls.filter(args => args[1] === 'lead_created').length, 1);
  assert.equal(b.calls.at(-1)[3].event_id, receipt.eventId);
  assert.equal(b.loaded.length, 1);
});
test('revocation clears attribution cookies and prevents later browser events; reacceptance works', () => {
  const b = browser(consent + '; __oppref=click; __obref=browser');
  b.ready[0](); b.window.intoOpenAI.setConsent(false);
  const count = b.calls.length;
  b.window.intoOpenAI.track('whatsapp_clicked');
  b.window.intoOpenAI.lead({ eventId: 'into-openai-lead-' + 'b'.repeat(64) });
  assert.equal(b.calls.length, count);
  assert.equal(b.jar.has('__oppref'), false); assert.equal(b.jar.has('__obref'), false);
  assert.equal(b.window.intoOpenAI.needsChoice(), false);
  b.window.intoOpenAI.setConsent(true);
  assert.equal(b.calls.at(-1)[1], 'page_viewed');
  b.window.oaiq = () => { throw Error('SDK blocked'); };
  assert.doesNotThrow(() => b.window.intoOpenAI.track('whatsapp_clicked'));
});
