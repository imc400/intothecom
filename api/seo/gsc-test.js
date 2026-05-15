/* api/seo/gsc-test.js — GET: prueba una query simple a GSC API y reporta
   el error exacto. Sin auth admin para diagnóstico rápido (sin data sensible). */

const { query, getAccessToken, loadServiceAccount } = require('../_lib/gsc.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const result = {
    timestamp: new Date().toISOString(),
    propertyUrl: process.env.GSC_PROPERTY_URL || 'missing',
    tests: []
  };

  // Test 1: Cargar service account
  try {
    const sa = loadServiceAccount();
    result.serviceAccountEmail = sa.client_email;
    result.tests.push({ name: 'load SA', status: 'ok' });
  } catch (e) {
    result.tests.push({ name: 'load SA', status: 'fail', error: e.message });
    res.status(200).json(result);
    return;
  }

  // Test 2: Obtener access token
  try {
    const token = await getAccessToken(true);
    result.tests.push({ name: 'get access token', status: 'ok', tokenPrefix: token.substring(0, 20) + '...' });
  } catch (e) {
    result.tests.push({ name: 'get access token', status: 'fail', error: e.message });
    res.status(200).json(result);
    return;
  }

  // Test 3: List sites (qué properties ve el SA)
  try {
    const https = require('https');
    const token = await getAccessToken();
    const listSitesResult = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'searchconsole.googleapis.com',
        path: '/webmasters/v3/sites',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      }, (resp) => {
        let chunks = '';
        resp.on('data', (c) => chunks += c);
        resp.on('end', () => {
          try { resolve({ status: resp.statusCode, body: JSON.parse(chunks) }); }
          catch { resolve({ status: resp.statusCode, body: chunks }); }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });
    result.tests.push({
      name: 'list sites (qué properties tiene acceso el SA)',
      status: listSitesResult.status === 200 ? 'ok' : `http_${listSitesResult.status}`,
      sites: listSitesResult.body
    });
  } catch (e) {
    result.tests.push({ name: 'list sites', status: 'fail', error: e.message });
  }

  // Test 4: Query simple a searchAnalytics
  try {
    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - 1);
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - 28);
    const r = await query({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dimensions: [],
      rowLimit: 1
    });
    result.tests.push({
      name: 'searchAnalytics query',
      status: r.status === 200 ? 'ok' : `http_${r.status}`,
      response: r.body
    });
  } catch (e) {
    result.tests.push({ name: 'searchAnalytics query', status: 'fail', error: e.message });
  }

  res.status(200).json(result);
};
