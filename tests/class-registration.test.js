const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const handler = require('../api/class-registration');
const { PROPERTY, STARTS_AT } = require('../api/_lib/live-class');
const realFetch = global.fetch;
const realNow = Date.now;
const realError = console.error;
process.env.RESEND_CONTACTS_API_KEY = 'test-key';
process.env.LIVE_CLASS_SEGMENT_ID = 'class-segment';
process.env.NODE_ENV = 'production';
let calls;
let responses;
beforeEach(() => {
  Date.now = () => Date.parse('2026-09-28T12:00:00Z');
  calls = [];
  responses = [];
  global.fetch = async (url, options) => {
    calls.push({ url, ...options, body: options.body ? JSON.parse(options.body) : undefined });
    const [status, body] = responses.shift() || [500, {}];
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  };
  console.error = () => {};
});
after(() => { global.fetch = realFetch; Date.now = realNow; console.error = realError; });
async function request(body = {}, options = {}) {
  const valid = { name: 'Persona de prueba', email: 'PERSONA@example.com', consent: true, ...body };
  const req = Readable.from([JSON.stringify(valid)]);
  Object.assign(req, { method: 'POST', headers: { origin: 'https://www.intothecom.com', 'content-type': 'application/json' }, ...options });
  const res = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await handler(req, res);
  return res;
}
test('new attendee is saved with class membership and consent before success', async () => {
  responses.push([404, {}], [201, { id: 'new-contact' }]);
  const result = await request({ utm_source: 'tiktok' });
  assert.equal(result.code, 200);
  assert.equal(calls[1].body.email, 'persona@example.com');
  assert.deepEqual(calls[1].body.segments, [{ id: 'class-segment' }]);
  const saved = JSON.parse(calls[1].body.properties[PROPERTY]);
  assert.equal(saved.source, 'tiktok');
  assert.equal(saved.consent, 'shopify-meta-2026-10-04');
  assert.ok(!calls.some(call => call.url.includes('/emails')));
});
test('repeat attendee keeps first registration and unsubscribe preference', async () => {
  responses.push([200, { id: 'existing', unsubscribed: true, properties: { [PROPERTY]: { value: '{"at":"original"}', type: 'string' } } }], [200, {}]);
  const result = await request();
  assert.equal(result.code, 200);
  assert.equal(calls.length, 2);
  assert.ok(!calls.some(call => call.method === 'PATCH'));
});
test('existing contact added to class without resubscribing or overwriting profile', async () => {
  responses.push([200, { id: 'existing', unsubscribed: true, first_name: 'Existing name', properties: { other: 'keep', [PROPERTY]: { value: null, type: 'string' } } }], [200, {}], [200, {}]);
  assert.equal((await request()).code, 200);
  assert.deepEqual(Object.keys(calls[2].body), ['properties']);
  assert.deepEqual(Object.keys(calls[2].body.properties), [PROPERTY]);
});
test('storage failure never reports success', async () => {
  responses.push([404, {}], [500, {}]);
  const result = await request();
  assert.equal(result.code, 503);
  assert.equal(result.data.ok, false);
});
test('partial class membership write failure is recoverable without false success', async () => {
  responses.push([200, { id: 'existing', properties: {} }], [200, {}], [500, {}]);
  assert.equal((await request()).code, 503);
});
test('simultaneous contact creation recovers from conflict', async () => {
  responses.push([404, {}], [409, {}], [200, { id: 'existing', properties: {} }], [200, {}], [200, {}]);
  assert.equal((await request()).code, 200);
  assert.equal(calls.length, 5);
});
test('untrusted origins are rejected before storage', async () => {
  assert.equal((await request({}, { headers: { origin: 'https://evil.example', 'content-type': 'application/json' } })).code, 403);
  assert.equal(calls.length, 0);
});
test('invalid email, name and missing consent never create contacts', async () => {
  for (const body of [{ email: 'broken' }, { name: [] }, { consent: false }, { email: 'bad\n@example.com' }]) assert.equal((await request(body)).code, 400);
  assert.equal(calls.length, 0);
});
test('honeypot rejects the submission without false success', async () => {
  assert.equal((await request({ website: 'spam' })).code, 400);
  assert.equal(calls.length, 0);
});
test('registration closes at the actual Santiago start time', async () => {
  Date.now = () => Date.parse(STARTS_AT);
  assert.equal((await request()).code, 410);
  assert.equal(calls.length, 0);
});
test('oversized payload and wrong HTTP method do not reach storage', async () => {
  assert.equal((await request({ name: 'x'.repeat(5000) })).code, 400);
  assert.equal((await request({}, { method: 'GET' })).code, 405);
  assert.equal(calls.length, 0);
});
