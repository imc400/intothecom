/* api/seo/health.js — GET: verifica GSC env vars + auth + report del método activo.
   No requiere admin auth (sin data sensible). */

const { loadServiceAccount, getAccessToken, getAuthMethod } = require('../_lib/gsc.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authMethod = getAuthMethod();

  const status = {
    timestamp: new Date().toISOString(),
    env: {
      GSC_OAUTH_REFRESH_TOKEN: process.env.GSC_OAUTH_REFRESH_TOKEN ? 'present' : 'missing',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'present' : 'missing',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'present' : 'missing',
      GSC_SERVICE_ACCOUNT_JSON: process.env.GSC_SERVICE_ACCOUNT_JSON ? 'present' : 'missing',
      GSC_PROPERTY_URL: process.env.GSC_PROPERTY_URL || 'missing',
      BING_API_KEY: process.env.BING_API_KEY ? 'present' : 'missing'
    },
    authMethod, // 'oauth' | 'service_account' | 'none'
    authMethodLabel: {
      oauth: 'OAuth 2.0 refresh_token (preferido — bypassa bug GSC 2026)',
      service_account: 'Service Account JWT (afectado por bug GSC)',
      none: 'NO CONFIGURADO'
    }[authMethod],
    gscConfig: 'unknown',
    serviceAccountEmail: null,
    authToken: 'unknown',
    authError: null
  };

  // Si hay SA configurado, mostrar info aunque no sea el método primario
  if (process.env.GSC_SERVICE_ACCOUNT_JSON) {
    try {
      const sa = loadServiceAccount();
      status.serviceAccountEmail = sa.client_email;
    } catch (e) {
      status.authError = `SA parse error: ${e.message}`;
    }
  }

  if (authMethod === 'none') {
    status.gscConfig = 'missing';
    res.status(200).json(status);
    return;
  }

  status.gscConfig = 'ok';

  // Probar obtener access token con el método activo
  try {
    const token = await getAccessToken(true);
    status.authToken = token ? 'ok' : 'no_token';
  } catch (e) {
    status.authToken = 'error';
    status.authError = e.message;
  }

  res.status(200).json(status);
};
