const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const { createHash, randomUUID, webcrypto } = require('node:crypto');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const Module = require('node:module');
const originalLoad = Module._load, realFetch = global.fetch;
let pending = [], mails = [], requests = [], failMail = false;
Module._load = function (name, ...args) {
  if (name === '@vercel/functions') return { waitUntil: promise => pending.push(promise) };
  if (name === 'resend') return { Resend: class { emails = { send: async (message, options) => { mails.push({ message, options }); return failMail ? { error: { message: 'mock error' } } : { data: { id: options.idempotencyKey } }; } }; } };
  return originalLoad.call(this, name, ...args);
};
const meta = require('../api/_lib/meta');
const endpoint = require('../api/meta-events');
const lead = require('../api/lead');
Module._load = originalLoad;
const origin = 'https://www.intothecom.com';
const consent = 'into_meta_consent=accepted.2026-10-19; _fbp=fb.1.1792448000000.123';
function req(body, headers = {}, parsed = true) {
  const request = Readable.from([JSON.stringify(body)]);
  Object.assign(request, { method: 'POST', headers: { origin, cookie: consent, 'user-agent': 'Integration test', 'x-vercel-forwarded-for': '203.0.113.12', ...headers } });
  if (parsed) request.body = body;
  return request;
}
async function run(handler, request) {
  const response = { status(n) { this.code = n; return this; }, json(data) { this.data = data; return this; }, setHeader() {}, end() {} };
  await handler(request, response);
  await Promise.all(pending.splice(0));
  return response;
}
beforeEach(() => {
  pending = []; mails = []; requests = []; failMail = false;
  process.env.META_PIXEL_ID = '1332352548957136'; process.env.META_CONVERSIONS_ACCESS_TOKEN = 'test-token'; process.env.RESEND_API_KEY = 'test-key';
  global.fetch = async (url, options) => { requests.push({ url, options, body: JSON.parse(options.body) }); return Response.json({ events_received: 1 }); };
});
afterEach(async () => { await Promise.all(pending.splice(0)); global.fetch = realFetch; });

test('CAPI excludes private URLs and only hashes email with Meta consent', () => {
  for (const url of ['/admin', '/api/auth/callback?code=secret', '/hablemos?email=a@example.com', '/?utm_campaign=a%40example.com', 'https://other.example/']) assert.equal(meta.publicUrl(url), null);
  const input = { name: 'Lead', id: 'test', url: '/hablemos?utm_source=instagram', email: ' PERSON@example.com ', contentName: 'brief_form' };
  assert.equal(meta.eventFor(req({}, { cookie: '' }), input), null);
  const event = meta.eventFor(req({}), input);
  assert.equal(event.event_source_url, origin + '/hablemos');
  assert.equal(event.user_data.em[0], createHash('sha256').update('person@example.com').digest('hex'));
  assert.ok(!JSON.stringify(event).includes('@'));
});
test('PageView and Contact preserve browser event IDs; public endpoint cannot fabricate Lead', async () => {
  const body = { eventName: 'PageView', eventId: randomUUID(), url: origin + '/paid-media?fbclid=abcde' };
  assert.equal((await run(endpoint, req(body, { cookie: '' }))).data.measured, false);
  assert.equal((await run(endpoint, req(body, { origin: 'https://other.example' }))).code, 403);
  for (const invalid of [{ ...body, eventName: 'Lead' }, { ...body, eventId: 'bad' }, { ...body, url: '/admin' }]) assert.equal((await run(endpoint, req(invalid))).code, 400);
  assert.equal((await run(endpoint, req(body))).code, 202);
  assert.equal(requests[0].body.data[0].event_id, body.eventId);
  assert.equal(requests[0].body.data[0].event_source_url, origin + '/paid-media');
  assert.ok(!requests[0].url.includes('test-token'));
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test-token');
  assert.equal((await run(endpoint, req({ ...body, eventName: 'Contact', eventId: randomUUID() }))).code, 202);
  assert.equal(requests[1].body.data[0].custom_data.content_name, 'whatsapp_click');
});
test('accepted briefs use one stable delivery ID for Pixel/CAPI and idempotent emails', async () => {
  const body = { name: 'Test', email: 'person@example.com', message: 'Private message', budget: 'Private budget', submission_id: randomUUID() };
  const first = await run(lead, req(body));
  const repeated = await run(lead, req(body, {}, false));
  assert.equal(first.code, 200); assert.equal(repeated.code, 200);
  assert.equal(first.data.meta.eventId, repeated.data.meta.eventId);
  assert.equal(requests[0].body.data[0].event_id, first.data.meta.eventId);
  assert.equal(requests[1].body.data[0].event_id, first.data.meta.eventId);
  assert.equal(mails[0].options.idempotencyKey, mails[2].options.idempotencyKey);
  assert.ok(!JSON.stringify(requests).includes('Private'));
  assert.ok(!JSON.stringify(requests).includes('person@example.com'));
});
test('invalid, bot, rejected and consentless briefs never create a Meta Lead', async () => {
  const body = { name: 'Test', email: 'test@example.com', message: 'Test' };
  assert.equal((await run(lead, req(body, { cookie: '' }))).data.meta, undefined);
  assert.equal((await run(lead, req({ ...body, _honey: 'bot' }))).data.meta, undefined);
  assert.equal((await run(lead, req({ ...body, email: 'bad' }))).code, 400);
  assert.equal((await run(lead, req(body, { origin: 'https://other.example' }))).code, 403);
  failMail = true;
  assert.equal((await run(lead, req(body))).code, 500);
  assert.equal(requests.length, 0);
});
test('Meta failure preserves successful contact and retry deduplication', async () => {
  global.fetch = async (_, options) => { requests.push(JSON.parse(options.body)); return Response.json({ error: { code: 2, is_transient: true } }, { status: 503 }); };
  const result = await run(lead, req({ name: 'Test', email: 'test@example.com', message: 'Test', submission_id: randomUUID() }));
  assert.equal(result.code, 200); assert.equal(result.data.ok, true);
  assert.equal(requests.length, 2); assert.deepEqual(requests[0], requests[1]);
});
test('test code is explicit, and permission errors are not retried', async () => {
  const event = meta.eventFor(req({}), { name: 'PageView', id: randomUUID(), url: '/' });
  assert.equal(await meta.sendEvent(event, 'TEST123'), true); assert.equal(requests[0].body.test_event_code, 'TEST123');
  let count = 0; global.fetch = async () => { count++; return Response.json({ error: { code: 190 } }, { status: 400 }); };
  assert.equal(await meta.sendEvent(event), false); assert.equal(count, 1);
});

function browser(cookie = consent, path = '/') {
  const cookies = new Map(cookie.split(';').map(s => s.trim().split('='))), fb = [], network = [], loaded = [];
  const location = new URL(origin + path);
  const document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; }, createElement() { return {}; }, head: { appendChild(script) { loaded.push(script); } } };
  Object.defineProperty(document, 'cookie', { get() { return [...cookies].map(([k, v]) => k + '=' + v).join('; '); }, set(value) { const [kv] = value.split(';'); const [k, v] = kv.split('='); if (value.includes('Max-Age=0')) cookies.delete(k); else cookies.set(k, v); } });
  const window = { META_PIXEL_ID: '1332352548957136', fbq: (...args) => fb.push(args) };
  const context = vm.createContext({ window, document, location, crypto: webcrypto, URLSearchParams, Set, Uint32Array, Date, fetch: async (_, options) => network.push(JSON.parse(options.body)) });
  vm.runInContext(readFileSync(require.resolve('../assets/meta.js'), 'utf8'), context);
  return { window, document, location, fb, network, loaded };
}
test('browser tracking gates consent, avoids duplicate initial views and shares IDs with server', () => {
  const declined = browser('into_meta_consent=rejected.2026-10-19'); declined.window.fbqTrack('PageView'); assert.equal(declined.network.length, 0);
  const privatePage = browser(consent, '/admin'); privatePage.window.fbqTrack('PageView'); assert.equal(privatePage.loaded.length, 0);
  const b = browser(); b.window.fbqTrack('PageView'); b.window.fbqTrack('PageView');
  assert.equal(b.network.length, 1);
  assert.equal(b.fb.find(args => args[1] === 'PageView')[3].eventID, b.network[0].eventId);
  b.location.pathname = '/hablemos'; b.window.fbqTrack('PageView'); assert.equal(b.network.length, 2);
  b.window.fbqTrack('Contact'); assert.equal(b.network[2].eventName, 'Contact');
  const receipt = { eventId: 'into-lead-' + 'a'.repeat(64) }; b.window.intoMetaLead(receipt); b.window.intoMetaLead(receipt);
  assert.equal(b.fb.filter(args => args[1] === 'Lead').length, 1);
  b.document.cookie = 'into_meta_consent=rejected.2026-10-19'; b.window.fbqTrack('Contact'); assert.equal(b.network.length, 3);
  b.document.cookie = 'into_meta_consent=accepted.2026-10-19'; b.window.fbq = () => { throw Error('blocked'); }; assert.doesNotThrow(() => b.window.intoMetaLead({ eventId: 'into-lead-' + 'b'.repeat(64) }));
});
