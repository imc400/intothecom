/* api/seo/health.js — GET: verifica que GSC env vars + auth funcionan.
   No requiere admin auth (es endpoint de diagnóstico, sin data sensible).

   Response 200: { gscConfig: 'ok' | 'missing' | 'invalid', authToken: 'ok' | 'error', ... }
*/

const { loadServiceAccount, getAccessToken } = require('../_lib/gsc.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const status = {
    timestamp: new Date().toISOString(),
    env: {
      GSC_SERVICE_ACCOUNT_JSON: process.env.GSC_SERVICE_ACCOUNT_JSON ? 'present' : 'missing',
      GSC_PROPERTY_URL: process.env.GSC_PROPERTY_URL || 'missing',
      BING_API_KEY: process.env.BING_API_KEY ? 'present' : 'missing'
    },
    gscConfig: 'unknown',
    serviceAccountEmail: null,
    projectId: null,
    authToken: 'unknown',
    authError: null
  };

  // Step 1: parsear JSON
  try {
    const sa = loadServiceAccount();
    status.gscConfig = 'ok';
    status.serviceAccountEmail = sa.client_email;
    status.projectId = sa.project_id;
  } catch (e) {
    status.gscConfig = 'invalid';
    status.authError = `Parse error: ${e.message}`;
    res.status(200).json(status);
    return;
  }

  // Step 2: obtener access token (firma JWT + exchange con Google)
  try {
    const token = await getAccessToken(true);
    status.authToken = token ? 'ok' : 'no_token';
  } catch (e) {
    status.authToken = 'error';
    status.authError = e.message;
  }

  res.status(200).json(status);
};
