# Intothecom — Sitio web 2026

Sitio web institucional de [Intothecom](https://intothecom.com) — estudio digital de marketing, software & IA basado en Chile, con operación en USA, España, Colombia y Perú.

## Stack

- Sitio estático (SPA) con **React 18 (UMD) + Babel-in-browser** — sin build step
- Hash router (`#/paid-media`, `#/software-ia`, etc.)
- **Tipografía**: Sora (display/sans), Instrument Serif (italic accents), JetBrains Mono (UI)
- **Color system**: dark layered (`#0a0a0b` / `#121214` / `#1a1a1d`) + paper warm (`#f4efe6`) + orange (`#f39200`)
- Canvas animados (`Ambient` + `DarkCanvas`) con blobs orgánicos + grain
- Cursor custom con `mix-blend-mode: difference`
- Custom UI: marquee de clientes, FAQ accordion, scroll cinemático con `IntersectionObserver`

## Estructura

```
.
├── index.html              # Entry + router + RouteMeta + JSON-LD + Meta Pixel
├── styles.css              # Sistema de diseño completo
├── components/
│   ├── shared.jsx          # Nav, Footer, Cursor, Ambient, ClientsMarquee, FAQ, FloatingWhatsApp, StatusBar, waLink
│   ├── page-home.jsx       # Home (hero, stats, services, guarantees, FAQ, testimonials, markets)
│   └── pages.jsx           # Servicios, ServicePage, SoftwareIA, Nosotros, Hablemos
├── assets/
│   ├── logo-{dark,white,gray}.png
│   ├── mark-{dark,white}.png
│   └── clients/            # 19 logos de clientes
├── vercel.json             # Config deploy (rewrites + security headers)
├── robots.txt
├── sitemap.xml
└── README.md
```

## Rutas

| Ruta | Página |
|------|--------|
| `/` | Home |
| `/servicios` | Catálogo de los 5 servicios |
| `/software-ia` | Software & IA a medida |
| `/paid-media` | Paid Media |
| `/email-marketing` | Email Marketing |
| `/desarrollo-web` | Diseño y Desarrollo Web |
| `/community-management` | Community Management |
| `/nosotros` | Estudio |
| `/hablemos` | Contacto / brief |

## Conversion infrastructure

- **CTA primario**: `Cotizar por WhatsApp` (verde `#25D366`) → `wa.me/56974143642` con mensaje pre-llenado por servicio
- **Floating WhatsApp button** con animación de pulso, aparece después de 600px de scroll
- **Status bar superior** con indicador online/offline según horario SCL (Lun-Vie 9-19)
- **Garantías block**: 4 risk-reversal claims (reunión sin costo, mes a mes desde mes 4, reportes con acceso directo, equipo senior)
- **FAQ accordion** con 6 preguntas pre-sale
- **Form simplificado**: 3 campos requeridos + toggle "+ Más detalles"

## SEO & A11y

- Per-route `<title>`, `<meta description>`, `<link canonical>` actualizados dinámicamente
- JSON-LD: `Organization`, `LocalBusiness`, `Service` ×5, `FAQPage`
- `hreflang` para `es-CL`, `es-ES`, `es-MX`
- Skip-link, `<main>` landmark, `aria-current` en nav, `aria-controls` en FAQ
- `prefers-reduced-motion` honored

## Medición de Meta

El píxel existente `1332352548957136` se carga desde `assets/meta.js` después de aceptar la medición de Meta. Las preferencias se pueden cambiar desde el pie de página. Google Ads y Analytics conservan su integración separada.

Configurar en Vercel producción `META_PIXEL_ID` y `META_CONVERSIONS_ACCESS_TOKEN` (secreto). El token nunca se incluye en HTML o JavaScript del navegador. Un cambio de ID requiere volver a publicar.

- `PageView`: una visita a una ruta pública, también en navegación SPA.
- `Contact`: clic en WhatsApp; no confirma un mensaje enviado.
- `Lead`: el brief fue aceptado por Resend. El correo se normaliza y transforma con SHA-256 solo con consentimiento. No se envían mensaje, empresa, presupuesto ni datos privados.

Navegador y servidor usan el mismo `event_id`. Los reenvíos del mismo formulario conservan la clave de idempotencia de Resend y el ID de conversión. Un fallo de Meta no bloquea el formulario. Los logs `[meta] accepted` / `[meta] rejected` permiten verificar la recepción sin registrar credenciales o datos de contacto.

`npm test` verifica consentimiento, rutas privadas, duplicados, reintentos, fallos de Meta y la entrega real del formulario con proveedores simulados. Las pruebas contra Meta deben pasar `test_event_code` explícitamente; no se guarda como variable de producción.

## Medición de OpenAI Ads

Configurar `OPENAI_ADS_PIXEL_ID` y `OPENAI_ADS_CONVERSIONS_API_KEY` (secreto) en Vercel **producción** y volver a desplegar. El ID se inyecta al compilar; la clave se usa exclusivamente en `api/_lib/openai-ads.js`. Los previews desactivan la integración. Sin ID no se carga el SDK ni se envían eventos.

- `page_viewed`: carga y navegación a páginas públicas, con consentimiento.
- `custom` / `whatsapp_clicked`: apertura de WhatsApp; no confirma un lead.
- `lead_created`: recepción del brief confirmada por Resend, por navegador y servidor. Ambos usan el mismo ID derivado de la entrega de Resend; los reintentos conservan ese ID.

El consentimiento de OpenAI usa `into_openai_consent` y no se hereda de la elección anterior de Meta. El aviso informa de ambos proveedores. Rechazar elimina `__oppref` y `__obref`; la API comprueba el consentimiento antes de leerlos. Solo se envía el correo normalizado con SHA-256, metadatos técnicos y referencias de atribución; nunca el contenido del brief. La coincidencia automática del SDK se configura en Ads Manager.

`npm test` cubre consentimiento, idempotencia, atribución y fallos. `node scripts/validate-openai-ads.js` valida un evento sintético con `validate_only: true`, sin registrar una conversión ni enviar correos. Los logs `[openai-ads] accepted/rejected/unavailable` omiten claves y datos personales. Se hace un reintento ante errores transitorios; no hay cola persistente, por lo que una caída prolongada puede perder eventos de servidor.

En Ads Manager: crear/reutilizar la fuente de Intothecom y su clave de conversiones, crear el evento `lead_created` para esa fuente y comprobar el flujo de eventos. La integración no cambia presupuestos ni objetivos de campañas.

Referencias: [Measurement Pixel](https://developers.openai.com/ads/measurement-pixel), [Conversions API](https://developers.openai.com/ads/conversions-api).

## Desarrollo local

```bash
# Cualquier server estático funciona
python3 -m http.server 5500
# o
npx serve .
```

Abrir http://localhost:5500.

## Deploy

Conectado a Vercel — push a `main` despliega automáticamente.

```bash
git push origin main
```

Headers de seguridad y rewrites configurados en `vercel.json`.

## Pendientes (P1)

- [ ] OG image real (`assets/og-cover.jpg` 1200×630)
- [ ] Resize logos clientes oversized (toke, inmobiliariahcg, lucreciafranzoy SVGO pass)
- [ ] Pre-compilar JSX con esbuild (eliminar Babel runtime de ~500KB)
- [ ] Pre-render rutas para SEO real (hash router invisible para crawlers)
- [ ] Página `/casos` con case studies long-form
- [ ] Equipo / fundadores con LinkedIn

## Contacto

- WhatsApp: +56 9 7414 3642
- Email: info@intothecom.com
- Instagram: [@intothecom_](https://instagram.com/intothecom_)
