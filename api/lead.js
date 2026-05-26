/* api/lead.js — POST: recibe brief del form /hablemos, envía email vía Resend
   al equipo (info + cc ignacio) y un auto-reply al lead. Reemplaza FormSubmit.

   Por qué endpoint propio:
   - Sin sponsor banner en los emails
   - Logs propios en Vercel (debug + auditoría de leads)
   - Deliverability ~99% (dominio verificado, no relay de terceros)
   - Reply-To = email del lead → respondés desde inbox y le llega al lead
   - Honeypot real validado en server (no se puede bypassear desde frontend)

   Body esperado:
     { name, email, message, company, service, budget,
       source, gclid, utm_source, utm_medium, utm_campaign,
       utm_content, utm_term, landing, referrer, _honey }

   Response: { ok: true } o { ok: false, error: '...' }
*/

const { Resend } = require('resend');

const ALLOWED_ORIGINS = [
  'https://www.intothecom.com',
  'https://intothecom.com',
];

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    req.on('data', (c) => chunks += c);
    req.on('end', () => {
      try { resolve(chunks ? JSON.parse(chunks) : {}); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(s) {
  return String(s == null || s === '' ? '—' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function txt(s) {
  return String(s == null || s === '' ? '—' : s);
}

function row(label, value) {
  return `<tr><td style="padding:10px 12px;border:1px solid #e5e5e5;background:#f9f9f9;font-weight:600;width:140px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:10px 12px;border:1px solid #e5e5e5;vertical-align:top">${value}</td></tr>`;
}

module.exports = async (req, res) => {
  // CORS — solo aceptar requests desde nuestro propio dominio
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[lead] RESEND_API_KEY no configurada en env vars');
    res.status(500).json({ ok: false, error: 'Email service not configured' });
    return;
  }

  let body;
  try { body = await readJsonBody(req); }
  catch (e) { res.status(400).json({ ok: false, error: 'Invalid JSON' }); return; }

  // Honeypot anti-spam: si el campo _honey tiene valor, es bot. Devolvemos 200
  // para no revelar la trampa, pero no enviamos el email.
  if (body._honey) {
    console.log('[lead] honeypot triggered, silently dropping');
    return res.status(200).json({ ok: true });
  }

  // Validación mínima
  const name = (body.name || '').toString().trim().slice(0, 200);
  const email = (body.email || '').toString().trim().slice(0, 200);
  const message = (body.message || '').toString().trim().slice(0, 5000);

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email format' });
  }

  // Subject inteligente
  const subjectParts = [name];
  if (body.service) subjectParts.push(body.service);
  if (body.budget) subjectParts.push(body.budget);
  const subject = `Brief — ${subjectParts.join(' · ')}`;

  // HTML email para notificación interna
  const internalHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:32px;background:#f4efe6;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1a1a1d">
  <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5">
    <div style="padding:24px 32px;background:#0a0a0b;color:#f4efe6">
      <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.6;font-family:'JetBrains Mono',ui-monospace,monospace">/ nuevo brief</div>
      <h1 style="margin:8px 0 0 0;font-size:22px;font-weight:600">${escapeHtml(subject)}</h1>
    </div>
    <div style="padding:24px 32px">
      <table style="border-collapse:collapse;width:100%;font-size:14px;line-height:1.5">
        ${row('Nombre', escapeHtml(name))}
        ${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:#f39200;text-decoration:none">${escapeHtml(email)}</a>`)}
        ${row('Mensaje', `<div style="white-space:pre-wrap">${escapeHtml(message)}</div>`)}
        ${row('Empresa', escapeHtml(body.company))}
        ${row('Servicio', escapeHtml(body.service))}
        ${row('Presupuesto', escapeHtml(body.budget))}
      </table>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e5e5">
        <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.55;margin-bottom:12px;font-family:'JetBrains Mono',ui-monospace,monospace">/ atribución</div>
        <table style="border-collapse:collapse;width:100%;font-size:13px;line-height:1.5">
          ${row('Source', escapeHtml(body.source))}
          ${row('Landing', escapeHtml(body.landing))}
          ${row('Referrer', escapeHtml(body.referrer))}
          ${row('GCLID', escapeHtml(body.gclid))}
          ${row('utm_source', escapeHtml(body.utm_source))}
          ${row('utm_medium', escapeHtml(body.utm_medium))}
          ${row('utm_campaign', escapeHtml(body.utm_campaign))}
          ${row('utm_content', escapeHtml(body.utm_content))}
          ${row('utm_term', escapeHtml(body.utm_term))}
        </table>
      </div>

      <p style="margin:24px 0 0 0;font-size:12px;color:#666">
        Responder a este email contesta directamente al lead (${escapeHtml(email)}).
      </p>
    </div>
  </div>
</body></html>`;

  const internalText = `Nuevo brief desde intothecom.com/hablemos

Nombre:       ${txt(name)}
Email:        ${txt(email)}
Mensaje:
${txt(message)}

Empresa:      ${txt(body.company)}
Servicio:     ${txt(body.service)}
Presupuesto:  ${txt(body.budget)}

--- Atribución ---
Source:       ${txt(body.source)}
Landing:      ${txt(body.landing)}
Referrer:     ${txt(body.referrer)}
GCLID:        ${txt(body.gclid)}
utm_source:   ${txt(body.utm_source)}
utm_medium:   ${txt(body.utm_medium)}
utm_campaign: ${txt(body.utm_campaign)}
utm_content:  ${txt(body.utm_content)}
utm_term:     ${txt(body.utm_term)}

Responder a este email contesta directamente al lead (${txt(email)}).
`;

  // Auto-reply al lead
  const replyHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Recibimos tu brief — Intothecom</title></head>
<body style="margin:0;padding:32px;background:#f4efe6;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1a1a1d">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5">
    <div style="padding:32px;background:#0a0a0b;color:#f4efe6;text-align:center">
      <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.6;font-family:'JetBrains Mono',ui-monospace,monospace">/ Intothecom</div>
      <h1 style="margin:12px 0 0 0;font-size:26px;font-weight:600;font-family:'Instrument Serif',Georgia,serif;font-style:italic">Recibimos tu brief.</h1>
    </div>
    <div style="padding:32px;font-size:15px;line-height:1.6">
      <p>Hola <strong>${escapeHtml(name)}</strong>,</p>
      <p>Gracias por escribirnos. Tu brief llegó al equipo y <strong>te respondemos en menos de 1 hora hábil</strong> (Lun–Vie 9:00–19:00 hora Santiago).</p>
      <p>Si tu consulta es urgente o prefieres conversar al instante:</p>
      <p style="text-align:center;margin:24px 0">
        <a href="https://wa.me/56974143642" style="display:inline-block;padding:14px 28px;background:#f39200;color:#1a1a1d;text-decoration:none;border-radius:999px;font-weight:600">WhatsApp +56 9 7414 3642 →</a>
      </p>
      <p>Mientras tanto, puedes revisar:</p>
      <ul style="padding-left:20px">
        <li><a href="https://www.intothecom.com/casos" style="color:#f39200">Casos de éxito</a> — métricas reales de +100 clientes</li>
        <li><a href="https://www.intothecom.com/recursos" style="color:#f39200">Guías técnicas B2B</a> — paid media, email, agentes IA y más</li>
      </ul>
      <p style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e5e5;color:#666;font-size:13px">
        — Equipo Intothecom<br/>
        Almirante Pastene 333, of. 402 · Providencia, Santiago, Chile<br/>
        <a href="https://www.intothecom.com" style="color:#f39200">intothecom.com</a>
      </p>
    </div>
  </div>
</body></html>`;

  const replyText = `Hola ${name},

Gracias por escribirnos. Tu brief llegó al equipo y te respondemos en menos de 1 hora hábil (Lun–Vie 9:00–19:00 hora Santiago).

Si tu consulta es urgente o prefieres conversar al instante:
WhatsApp +56 9 7414 3642 → https://wa.me/56974143642

Mientras tanto, puedes revisar:
- Casos de éxito: https://www.intothecom.com/casos
- Guías técnicas B2B: https://www.intothecom.com/recursos

— Equipo Intothecom
Almirante Pastene 333, of. 402 · Providencia, Santiago, Chile
https://www.intothecom.com
`;

  const resend = new Resend(apiKey);

  try {
    // 1. Notificación interna al equipo (info + cc ignacio)
    const internalResult = await resend.emails.send({
      from: 'Intothecom <info@intothecom.com>',
      to: ['info@intothecom.com'],
      cc: ['ignacio@intothecom.com'],
      replyTo: email,
      subject,
      html: internalHtml,
      text: internalText,
    });

    if (internalResult.error) {
      console.error('[lead] internal send failed:', internalResult.error);
      return res.status(500).json({ ok: false, error: 'Failed to send notification' });
    }

    // 2. Auto-reply al lead (no bloquea: si falla, el internal ya fue OK)
    try {
      const replyResult = await resend.emails.send({
        from: 'Intothecom <info@intothecom.com>',
        to: [email],
        replyTo: 'info@intothecom.com',
        subject: 'Recibimos tu brief — Intothecom',
        html: replyHtml,
        text: replyText,
      });
      if (replyResult.error) {
        console.warn('[lead] autoreply failed (no afecta lead capture):', replyResult.error);
      }
    } catch (replyErr) {
      console.warn('[lead] autoreply exception:', replyErr);
    }

    // Log estructurado para auditoría
    console.log('[lead] OK', JSON.stringify({
      name, email,
      service: body.service || null,
      budget: body.budget || null,
      utm_source: body.utm_source || null,
      utm_campaign: body.utm_campaign || null,
      gclid: body.gclid || null,
      ts: new Date().toISOString(),
    }));

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[lead] exception:', err);
    return res.status(500).json({ ok: false, error: 'Email send failed' });
  }
};
