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

## Analytics

- **Meta Pixel** integrado vía `index.html`. Reemplazar `YOUR_META_PIXEL_ID` por el ID real (línea ~125 de `index.html`).
- Eventos: `PageView` automático en cada hashchange con `route` como param

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
