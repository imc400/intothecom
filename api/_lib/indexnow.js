/* api/_lib/indexnow.js — Helper para pingear IndexNow desde múltiples endpoints.
   IndexNow notifica a Bing, Yandex, Naver y DuckDuckGo simultáneamente.

   Usage:
     const { pingIndexNow } = require('../_lib/indexnow.js');
     await pingIndexNow(['https://www.intothecom.com/url1', ...]);
*/

const https = require('https');

const INDEXNOW_KEY = 'cb1731ec3af4f7044b282eee96cd9c48';
const HOST = 'www.intothecom.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

function pingIndexNow(urls) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(urls) || urls.length === 0) {
      return resolve({ status: 0, error: 'no urls' });
    }
    const payload = JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls
    });
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/IndexNow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'Host': 'api.indexnow.org'
      },
      timeout: 5000
    }, (resp) => {
      let chunks = '';
      resp.on('data', (c) => chunks += c);
      resp.on('end', () => resolve({ status: resp.statusCode, body: chunks }));
    });
    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    req.write(payload);
    req.end();
  });
}

function isValidUrl(u) {
  return typeof u === 'string' && u.startsWith(`https://${HOST}/`);
}

module.exports = { pingIndexNow, isValidUrl, INDEXNOW_KEY, HOST };
