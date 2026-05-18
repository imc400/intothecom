/* SSR content por ruta — fuente única de verdad para el contenido SEO/Ads visible
   sin depender de JavaScript. Build.js lo lee y genera HTML real dentro de cada
   landing antes de que React monte. Una vez que React monta, reemplaza este
   contenido con la UI completa.

   Cada bloque debe ser semánticamente correcto (h1, h2, p, ul) y reflejar el
   contenido que React renderiza en esa ruta — no contenido genérico.

   Crítico: Google Ads (AdsBot) rechaza landings con "contenido insuficiente"
   cuando el HTML inicial no tiene contenido visible específico de la URL. */

const WA_DEFAULT = 'https://wa.me/56974143642?text=Hola%20Intothecom%2C%20me%20gustar%C3%ADa%20cotizar%20un%20servicio.';
const WA_PAID = 'https://wa.me/56974143642?text=Hola%20Intothecom%2C%20me%20interesa%20Paid%20Media.';
const WA_EMAIL = 'https://wa.me/56974143642?text=Hola%20Intothecom%2C%20me%20interesa%20Email%20Marketing.';
const WA_WEB = 'https://wa.me/56974143642?text=Hola%20Intothecom%2C%20me%20interesa%20Desarrollo%20Web.';
const WA_CM = 'https://wa.me/56974143642?text=Hola%20Intothecom%2C%20me%20interesa%20Community%20Management.';
const WA_SW = 'https://wa.me/56974143642?text=Hola%20Intothecom%2C%20me%20interesa%20Software%20%26%20IA.';

const COMMON_NAV = [
  { label: 'Inicio', path: '/' },
  { label: 'Servicios', path: '/servicios' },
  { label: 'Software & IA', path: '/software-ia' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Recursos', path: '/recursos' },
  { label: 'Contacto', path: '/contacto' }
];

const COMMON_FOOTER = {
  address: 'Almirante Pastene 333, oficina 402, Providencia, Santiago, Chile',
  email: 'info@intothecom.com',
  phone: '+56 9 7414 3642',
  whatsapp: WA_DEFAULT,
  hours: 'Lunes a Viernes 9:00–19:00 hora Santiago',
  markets: 'Chile · USA · España · Colombia · Perú',
  services: [
    { label: 'Software & IA', path: '/software-ia' },
    { label: 'Paid Media', path: '/paid-media' },
    { label: 'Email Marketing', path: '/email-marketing' },
    { label: 'Desarrollo Web', path: '/desarrollo-web' },
    { label: 'Community Management', path: '/community-management' }
  ]
};

const SSR_CONTENT = {
  '/': {
    hero: {
      eyebrow: 'Estudio digital · est. 2019 · Chile · USA · España · Colombia · Perú',
      h1: 'Marketing, software & inteligencia.',
      body: 'Diseñamos estrategias, productos digitales y agentes de IA a medida para negocios que crecen en serio. Cinco años de operación, +5M USD generados vía RRSS para nuestros clientes. Verificable.',
      ctas: [
        { text: 'Cotizar por WhatsApp', href: WA_DEFAULT, primary: true, external: true },
        { text: 'Ver servicios', href: '/servicios', primary: false }
      ]
    },
    stats: [
      { num: '+100', label: 'Negocios asesorados', sub: '2019–2026 · CL/BR/US/ES' },
      { num: '+5M', label: 'USD generados vía RRSS', sub: 'verificable con clientes ref.' },
      { num: '−50%', label: 'CAC promedio', sub: 'vs. baseline pre-Intothecom' }
    ],
    sections: [
      {
        eyebrow: '/ qué hacemos',
        h2: 'Construimos el motor digital de tu negocio. Pieza por pieza.',
        body: 'Intothecom es un estudio digital chileno fundado en 2019. Operamos en cinco mercados (Chile, USA, España, Colombia, Perú) con foco en empresas B2B que necesitan resultados medibles, no entregables sin contexto.'
      },
      {
        eyebrow: '/ servicios · 05',
        h2: 'Cinco servicios integrados para escalar tu negocio.',
        services: [
          { num: '01', t: 'Software & IA a medida', desc: 'Agentes, automatizaciones y productos digitales construidos para tu operación.', path: '/software-ia' },
          { num: '02', t: 'Paid Media', desc: 'Campañas en Google, Meta, TikTok y LinkedIn con foco en ROAS y CAC.', path: '/paid-media' },
          { num: '03', t: 'Email Marketing', desc: 'Segmentación quirúrgica, automatizaciones y flows que convierten.', path: '/email-marketing' },
          { num: '04', t: 'Desarrollo Web', desc: 'Sitios y e-commerce headless, rápidos y diseñados para vender.', path: '/desarrollo-web' },
          { num: '05', t: 'Community Management', desc: 'Contenido con criterio editorial y comunidad real, no vanity metrics.', path: '/community-management' }
        ]
      },
      {
        eyebrow: '/ 5+ años en industria',
        h2: 'Datos, no promesas.',
        body: 'Cinco años construyendo el motor digital de empresas B2B en LATAM, USA y España. Casos verificables, métricas reales y un equipo senior que no terceriza.'
      },
      {
        eyebrow: '/ garantías',
        h2: 'Sin contratos eternos. Sin sorpresas.',
        body: 'Mes 1 es onboarding. Si al mes 3 no se cumplieron los KPIs acordados por escrito, devolvemos el último mes o ajustamos scope sin costo. Una marca por categoría dentro de un mismo mercado: exclusividad real.'
      }
    ],
    faq: [
      { q: '¿Cuánto demora ver resultados?', a: 'Paid Media: 2 a 3 semanas. Email: primer flow en vivo en 30 días. Web: 6 a 12 semanas. Software & IA: prototipo funcional en 3 semanas.' },
      { q: '¿Trabajan con retainer mensual o por proyecto?', a: 'Ambos. Servicios continuos son retainer 3 meses mínimo. Web y software son fixed-scope con hito de pago.' },
      { q: '¿Trabajan con clientes fuera de Chile?', a: '60% de nuestros clientes opera en mercados externos. Reuniones por Meet, contratos en USD o moneda local, facturamos como prestador en CL/ES.' },
      { q: '¿Tienen exclusividad por industria?', a: 'Sí. Una marca por categoría dentro de un mismo mercado.' },
      { q: '¿Qué pasa si no veo resultados?', a: 'Mes 1 es onboarding. Si al mes 3 no se cumplieron los KPIs acordados por escrito, devolvemos el último mes o ajustamos scope sin costo.' },
      { q: '¿Quién ejecuta mi cuenta?', a: 'Un lead senior más un especialista. No tercerizamos a freelancers.' }
    ]
  },

  '/servicios': {
    hero: {
      eyebrow: 'Catálogo de servicios · 05 disciplinas',
      h1: 'Cinco servicios integrados.',
      body: 'Marketing, software e inteligencia artificial bajo un mismo techo. Cada disciplina diseñada para escalar con datos, no con opiniones. Una marca por categoría dentro de cada mercado: exclusividad real para nuestros clientes.',
      ctas: [
        { text: 'Cotizar por WhatsApp', href: WA_DEFAULT, primary: true, external: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ servicios disponibles',
        h2: 'Especialidades del estudio.',
        services: [
          { num: '01', t: 'Software & IA a medida', desc: 'Agentes conversacionales, copilotos internos, RAG sobre tu data y automatizaciones. De idea a producción en 6 semanas.', path: '/software-ia' },
          { num: '02', t: 'Paid Media', desc: 'Google Ads, Meta Ads, TikTok Ads y LinkedIn Ads. Tracking server-side, atribución multi-touch y optimización por ROAS.', path: '/paid-media' },
          { num: '03', t: 'Email Marketing', desc: 'Klaviyo y HubSpot. Flows de bienvenida, abandono, post-compra y win-back. Primer flow en vivo en 30 días.', path: '/email-marketing' },
          { num: '04', t: 'Diseño y Desarrollo Web', desc: 'Sitios institucionales y e-commerce headless con Next.js y Shopify. Lighthouse 90+ no negociable.', path: '/desarrollo-web' },
          { num: '05', t: 'Community Management', desc: 'Línea editorial documentada, producción mensual de foto y video, gestión de DMs y crisis. Comunidad que compra.', path: '/community-management' }
        ]
      },
      {
        eyebrow: '/ cómo elegir',
        h2: 'Te orientamos sin costo.',
        body: 'Agenda 45 minutos con un lead senior. Revisamos tu negocio, identificamos los 3 mayores bloqueos y recomendamos qué servicios necesitas — incluso si no encajamos. Sin venta dura.'
      }
    ],
    faq: [
      { q: '¿Puedo contratar un solo servicio?', a: 'Sí. La mayoría de clientes empieza con uno (Paid Media o Email) y suma servicios en función de resultados. No hay paquetes obligatorios.' },
      { q: '¿Trabajan con retainer o por proyecto?', a: 'Servicios continuos (Paid, Email, Community) van por retainer mensual con mínimo 3 meses. Web y Software son fixed-scope.' },
      { q: '¿Hacen estrategia transversal?', a: 'Sí. Si tomas 3+ servicios, designamos un Strategy Lead que coordina entre áreas para maximizar el efecto compuesto.' }
    ]
  },

  '/paid-media': {
    hero: {
      eyebrow: 'Paid media · PM-01 · 3 meses mínimo',
      h1: 'Anuncios que venden.',
      body: 'Paid Media se enfoca en aumentar el tráfico calificado mediante anuncios pagados en Google Ads, Meta Ads, TikTok Ads y LinkedIn Ads. Diseñamos campañas con foco en resultados rápidos, medibles y un alto retorno de inversión — no en impresiones vacías.',
      meta: [
        { label: 'Servicio', value: 'PM-01' },
        { label: 'Disponibilidad', value: 'CL · BR · US · ES' },
        { label: 'Duración mín.', value: '3 meses' },
        { label: 'Categorías', value: 'Google · Meta · TikTok · LinkedIn' }
      ],
      ctas: [
        { text: 'Cotizar por WhatsApp', href: WA_PAID, primary: true, external: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ qué es',
        h2: 'Tráfico calificado, ROI medible.',
        body: 'Paid Media se enfoca en aumentar el tráfico calificado mediante anuncios pagados. Diseñamos campañas con foco en resultados rápidos, medibles y un alto retorno de inversión.',
        bullets: [
          'Estrategia full-funnel: descubrimiento, consideración y conversión.',
          'Creatividades A/B que no parecen ads.',
          'Tracking server-side y atribución limpia (Conversions API, GA4 server-side).',
          'Reportes semanales con decisiones, no con gráficos.'
        ]
      },
      {
        eyebrow: '/ proceso',
        h2: 'Un proceso construido para escalar.',
        steps: [
          { t: 'Auditoría', d: 'Revisamos tu cuenta actual, audiencias, tracking y competencia para encontrar el techo real.' },
          { t: 'Setup', d: 'Configuramos pixel, conversiones server-side, audiencias y estructura de campañas.' },
          { t: 'Lanzamiento', d: 'Test creativo en paralelo, presupuesto controlado y aprendizaje rápido en 2 semanas.' },
          { t: 'Escala', d: 'Cuando un ángulo funciona, escalamos vertical y horizontalmente sin reventar el CAC.' }
        ]
      },
      {
        eyebrow: '/ qué obtienes',
        h2: 'Resultados medibles.',
        bullets: [
          'Resultados rápidos y medibles: campañas con KPIs claros desde la semana uno: ROAS, CAC y LTV proyectado.',
          'Alto retorno de inversión: optimizamos por ingreso, no por clics. Cada peso invertido tiene un objetivo de retorno explícito.',
          'Estructura escalable: cuentas limpias y documentadas, listas para crecer sin canibalizar tus propias campañas.'
        ]
      }
    ],
    others: [
      { num: '02', t: 'Email Marketing', desc: 'Automatizaciones que convierten.', path: '/email-marketing' },
      { num: '03', t: 'Software & IA', desc: 'Productos digitales a medida.', path: '/software-ia' },
      { num: '04', t: 'Desarrollo Web', desc: 'Sitios diseñados para vender.', path: '/desarrollo-web' }
    ],
    faq: [
      { q: '¿Cuánto presupuesto mínimo se necesita?', a: 'Para Google y Meta, recomendamos USD 1.500–3.000 mensuales de media spend para tener señal estadística. LinkedIn requiere USD 5.000+ por su CPC alto. Fee de gestión es aparte.' },
      { q: '¿En cuánto tiempo se ven resultados?', a: 'Primeros aprendizajes en 2 semanas. Optimización fina entre semanas 3 y 6. Estado escalable desde el mes 2–3.' },
      { q: '¿Garantizan ROAS específico?', a: 'No prometemos números que no controlamos al 100%. Sí garantizamos proceso, transparencia y mejora mes a mes contra tu propio baseline.' }
    ]
  },

  '/email-marketing': {
    hero: {
      eyebrow: 'Email marketing · EM-01 · 3 meses mínimo',
      h1: 'Inbox que convierte.',
      body: 'El email es la única audiencia que realmente posees. Diseñamos estrategias con segmentación quirúrgica, contenido relevante, automatizaciones y análisis continuo. Convierte 4–6× mejor que social. Bien hecho, es tu canal más rentable.',
      meta: [
        { label: 'Servicio', value: 'EM-01' },
        { label: 'Disponibilidad', value: 'CL · BR · US · ES' },
        { label: 'Duración mín.', value: '3 meses' },
        { label: 'Plataformas', value: 'Klaviyo · Mailchimp · HubSpot · ActiveCampaign' }
      ],
      ctas: [
        { text: 'Cotizar por WhatsApp', href: WA_EMAIL, primary: true, external: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ qué es',
        h2: 'Contacto directo, sin intermediarios.',
        body: 'El email es la única audiencia que realmente posees. Diseñamos estrategias personalizadas con segmentación, contenido relevante, automatizaciones y análisis continuo.',
        bullets: [
          'Segmentación precisa por comportamiento y valor de cliente.',
          'Creación de contenido relevante y atractivo para cada segmento.',
          'Análisis de métricas y optimización continua (open rate, CTR, conversión).',
          'Flows: bienvenida, abandono de carrito, post-compra, win-back, reactivación.'
        ]
      },
      {
        eyebrow: '/ proceso',
        h2: 'Del primer correo al noveno flow.',
        steps: [
          { t: 'Auditoría de listas', d: 'Limpiamos, segmentamos y validamos tu base actual. Identificamos contactos zombie y oportunidades dormidas.' },
          { t: 'Estrategia', d: 'Calendario editorial, plantillas master y mapa de automatizaciones priorizado por impacto.' },
          { t: 'Producción', d: 'Diseñamos y programamos campañas con copywriting que no se ignora. Templates responsive multi-cliente.' },
          { t: 'Optimización', d: 'A/B test en asunto, hora, contenido y CTA. Mejora continua con métricas reales.' }
        ]
      },
      {
        eyebrow: '/ qué obtienes',
        h2: 'Tu canal más rentable.',
        bullets: [
          'Alto impacto en conversiones: email convierte 4–6× mejor que social. Bien hecho, es tu canal más rentable.',
          'Tráfico sostenido: cada envío recuerda tu marca y alimenta el ciclo de retención.',
          'Audiencia 100% propia: tu lista es un activo que no se evapora con un cambio de algoritmo.'
        ]
      }
    ],
    others: [
      { num: '02', t: 'Paid Media', desc: 'Campañas con foco en ROAS y CAC.', path: '/paid-media' },
      { num: '03', t: 'Community Management', desc: 'Comunidad real.', path: '/community-management' },
      { num: '04', t: 'Software & IA', desc: 'Automatizaciones a medida.', path: '/software-ia' }
    ],
    faq: [
      { q: '¿En qué plataforma trabajan?', a: 'Klaviyo (recomendado para e-commerce), HubSpot (para B2B), Mailchimp y ActiveCampaign. Si ya tienes una, mantenemos esa.' },
      { q: '¿Cuándo está el primer flow en vivo?', a: '30 días desde kickoff: bienvenida + abandono de carrito + post-compra son los primeros tres.' },
      { q: '¿Qué hacemos con la lista vieja?', a: 'Re-engagement campaign segmentado por última actividad. Contactos que no responden en 3 envíos se archivan: mantener una lista zombie destruye deliverability.' }
    ]
  },

  '/desarrollo-web': {
    hero: {
      eyebrow: 'Diseño y desarrollo web · WEB-01 · 6–12 semanas',
      h1: 'Sitios que venden.',
      body: 'Diseñamos y desarrollamos sitios web y e-commerce de forma personalizada. Cada decisión —velocidad, jerarquía, copy, microinteracción— está al servicio de la conversión. Lighthouse 90+ no negociable.',
      meta: [
        { label: 'Servicio', value: 'WEB-01' },
        { label: 'Disponibilidad', value: 'CL · BR · US · ES' },
        { label: 'Duración', value: '6–12 semanas' },
        { label: 'Stack', value: 'Next.js · Shopify · Webflow · Headless' }
      ],
      ctas: [
        { text: 'Cotizar por WhatsApp', href: WA_WEB, primary: true, external: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ qué es',
        h2: 'Tu sitio es tu mejor vendedor.',
        body: 'Diseñamos y desarrollamos sitios web y e-commerce de forma personalizada. Cada decisión está al servicio de la conversión.',
        bullets: [
          'Diseño UI/UX con foco en conversión, no en estética vacía.',
          'Performance: Core Web Vitals en verde, LCP <2.5s, CLS <0.1.',
          'SEO técnico integrado: estructura semántica, schema.org, sitemap dinámico.',
          'Stack moderno: Next.js, headless commerce, CMS desacoplado editable.'
        ]
      },
      {
        eyebrow: '/ proceso',
        h2: 'Diseño y código bajo el mismo techo.',
        steps: [
          { t: 'Discovery', d: 'Definimos KPIs del sitio antes de tocar Figma. Sin objetivos medibles, no hay diseño.' },
          { t: 'Diseño', d: 'Wireframes, sistema de diseño documentado, prototipos navegables aprobados.' },
          { t: 'Desarrollo', d: 'Código limpio, componentizado, con CMS para que tu equipo edite sin desarrollador.' },
          { t: 'Lanzamiento', d: 'QA cross-browser, migración de contenido, redirects 301, monitoreo post-launch.' }
        ]
      },
      {
        eyebrow: '/ qué obtienes',
        h2: 'Sitios construidos para vender.',
        bullets: [
          'Conversión medible: sitios construidos para vender, con tracking limpio desde el primer pixel.',
          'Performance que se siente: Lighthouse 90+ no negociable. Cada milisegundo cuenta.',
          'Editable por tu equipo: CMS amigable. Editas textos e imágenes sin llamarnos.'
        ]
      }
    ],
    others: [
      { num: '02', t: 'Software & IA', desc: 'Productos digitales a medida.', path: '/software-ia' },
      { num: '03', t: 'Paid Media', desc: 'Tráfico calificado para tu nuevo sitio.', path: '/paid-media' },
      { num: '04', t: 'Email Marketing', desc: 'Convierte tráfico en clientes recurrentes.', path: '/email-marketing' }
    ],
    faq: [
      { q: '¿Hacen e-commerce o solo institucionales?', a: 'Ambos. Para e-commerce trabajamos con Shopify (recomendado para >$5K MRR) o headless con Next.js + Shopify Storefront API. Para institucionales, Next.js + CMS (Sanity, Contentful).' },
      { q: '¿Qué pasa con SEO post-launch?', a: 'Entregamos schema.org completo, sitemap, redirects 301 desde sitio anterior y reporte de Search Console primer mes. SEO ongoing es servicio aparte.' },
      { q: '¿Mi equipo puede editar el sitio?', a: 'Sí. Todos los sitios incluyen CMS editable. Capacitación de 1h al final del proyecto. Textos, imágenes y bloques se editan sin tocar código.' }
    ]
  },

  '/community-management': {
    hero: {
      eyebrow: 'Community management · CM-01 · 3 meses mínimo',
      h1: 'Comunidad real.',
      body: 'Construimos presencia social con voz propia, contenido que se comparte y comunidad que responde. No publicamos por publicar — cada pieza tiene un objetivo y se mide. Comunidad que compra, no vanity metrics.',
      meta: [
        { label: 'Servicio', value: 'CM-01' },
        { label: 'Disponibilidad', value: 'CL · BR · US · ES' },
        { label: 'Duración mín.', value: '3 meses' },
        { label: 'Canales', value: 'Instagram · TikTok · LinkedIn · X' }
      ],
      ctas: [
        { text: 'Cotizar por WhatsApp', href: WA_CM, primary: true, external: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ qué es',
        h2: 'Contenido con criterio editorial.',
        body: 'Construimos presencia social con voz propia. Cada pieza tiene un objetivo y se mide.',
        bullets: [
          'Línea editorial y tono de marca documentado.',
          'Calendario mensual con ángulos, formatos y CTAs específicos por canal.',
          'Producción de contenido: foto, motion, copy, reels.',
          'Gestión de comunidad: DMs, comentarios, crisis management.'
        ]
      },
      {
        eyebrow: '/ proceso',
        h2: 'Más que postear bonito.',
        steps: [
          { t: 'Brand strategy', d: 'Voz, tono, pilares de contenido y guía visual documentada como manual interno.' },
          { t: 'Producción', d: 'Sesiones mensuales: foto, video y motion alineados con la estrategia de cada canal.' },
          { t: 'Publicación', d: 'Calendario aprobado, horarios óptimos por canal, copywriting nativo no genérico.' },
          { t: 'Comunidad', d: 'Respondemos DMs, moderamos comentarios y reportamos sentiment cada semana.' }
        ]
      },
      {
        eyebrow: '/ qué obtienes',
        h2: 'Comunidad que compra.',
        bullets: [
          'Marca con personalidad: salimos del feed genérico. Tu marca se reconoce sin ver el logo.',
          'Comunidad que compra: audiencia engaged, no inflada. Más DMs útiles, menos likes vacíos.',
          'Reportes con insights: mensual, con qué funcionó, qué no, y qué probamos el mes que viene.'
        ]
      }
    ],
    others: [
      { num: '02', t: 'Paid Media', desc: 'Amplifica tu mejor contenido orgánico.', path: '/paid-media' },
      { num: '03', t: 'Email Marketing', desc: 'Convierte seguidores en clientes.', path: '/email-marketing' },
      { num: '04', t: 'Software & IA', desc: 'Automatiza moderación y reportes.', path: '/software-ia' }
    ],
    faq: [
      { q: '¿Producen contenido propio o solo gestionan?', a: 'Producimos. Sesión mensual de foto + motion incluida en retainer Pro. Para retainer base, gestionamos tu material existente.' },
      { q: '¿Manejan crisis en redes?', a: 'Sí. Protocolo documentado: tiempo de respuesta <2h en hora hábil, escalamiento al cliente, mensajes pre-aprobados según severidad.' },
      { q: '¿Cuántos posts por mes?', a: 'Depende del plan: base es 12 piezas/mes (3/semana en Instagram), Pro es 20+ con video/reels/TikTok.' }
    ]
  },

  '/software-ia': {
    hero: {
      eyebrow: 'Software & IA · SW-01 · nuevo 2026',
      h1: 'Software & IA a medida.',
      body: 'No vendemos suscripciones a herramientas genéricas. Construimos sistemas concretos para tu negocio: agentes de venta conversacionales, copilotos internos, automatizaciones que reemplazan tareas manuales, y dashboards de decisión. De idea a producción en 6 semanas. Prototipo funcional en 3.',
      meta: [
        { label: 'Servicio', value: 'SW-01' },
        { label: 'Disponibilidad', value: 'CL · BR · US · ES' },
        { label: 'Stack', value: 'Python · Node · Next · LLMs' },
        { label: 'Modelos', value: 'GPT · Claude · Gemini · OSS' }
      ],
      ctas: [
        { text: 'Discutir por WhatsApp', href: WA_SW, primary: true, external: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ manifiesto',
        h2: 'La IA útil no es un chatbot en una esquina. Es código que reemplaza tareas reales.',
        body: 'Diseñamos sistemas con arquitectura real: data versionada, prompts evaluados, observabilidad y rollback. No reventamos suscripciones a ChatGPT con copywriting encima.',
        bullets: [
          'Construimos, no revendemos. Arquitectura propia con data, prompts versionados, evaluación y observabilidad.',
          'IA con propósito: cada feature reemplaza una tarea humana específica. Si no puede medirse, no la construimos.',
          'Stack moderno: Python, Node.js, Next.js, LLMs (Claude, GPT, Gemini, modelos OSS según caso).',
          'Producción en 6 semanas: prototipo funcional al mes 1, deploy productivo al mes 2.'
        ]
      },
      {
        eyebrow: '/ qué construimos',
        h2: 'Casos típicos.',
        services: [
          { num: '01', t: 'Agentes conversacionales', desc: 'Asistentes de venta para WhatsApp y web con conocimiento de tu catálogo, integración a CRM y handoff humano.', path: '/recursos/agentes-ia-para-empresas-2026' },
          { num: '02', t: 'Copilotos internos', desc: 'Asistentes para tu equipo: legal, ops, contabilidad. RAG sobre documentación interna con citación de fuente.', path: '/recursos/agentes-ia-para-empresas-2026' },
          { num: '03', t: 'Automatizaciones', desc: 'Bots que ejecutan workflows: cotización, onboarding, reporting. Reemplazan tareas humanas repetitivas.', path: '/recursos/agentes-ia-para-empresas-2026' },
          { num: '04', t: 'Dashboards de decisión', desc: 'Vista única con datos de tus 6 herramientas. KPIs en tiempo real con alertas por anomalía.', path: '/recursos/agentes-ia-para-empresas-2026' }
        ]
      },
      {
        eyebrow: '/ proceso',
        h2: 'De idea a producción en 6 semanas.',
        steps: [
          { t: 'Discovery (sem 1)', d: 'Mapeamos procesos manuales actuales, identificamos qué tarea reemplaza la IA y definimos métrica de éxito.' },
          { t: 'Prototipo (sem 2–3)', d: 'Construimos un MVP funcional. Lo pruebas con datos reales. Iteramos sobre feedback.' },
          { t: 'Producción (sem 4–5)', d: 'Endurecemos código, agregamos observabilidad, seguridad y manejo de errores. Deploy.' },
          { t: 'Iteración (sem 6+)', d: 'Métricas de uso reales, ajuste de prompts, expansión de capacidades según ROI.' }
        ]
      }
    ],
    faq: [
      { q: '¿Necesito tener mis datos limpios?', a: 'No. Parte del trabajo es estructurar tus datos: documentos PDF, planillas, exportes de CRM. Te decimos qué falta y cómo organizarlo.' },
      { q: '¿Qué pasa con la propiedad del código?', a: 'Es tuyo. Te entregamos repositorio en GitHub, deployments y credenciales. Podemos mantenerlo nosotros o tu equipo.' },
      { q: '¿Qué modelo usan?', a: 'Depende del caso: Claude para razonamiento complejo, GPT-4 para multimodal, Gemini para volumen, modelos OSS (Llama, Qwen) si hay restricciones de datos. Diseñamos para poder cambiar sin reescribir.' }
    ]
  },

  '/nosotros': {
    hero: {
      eyebrow: 'El estudio · est. 2019 · 4 mercados activos',
      h1: 'Cinco años haciendo crecer negocios.',
      body: 'Empezamos en 2019 como una agencia de marketing digital en Chile. Cinco años después operamos en cuatro mercados, hemos asesorado más de 100 negocios y construimos software & IA a medida para clientes que necesitan más que campañas. Nos motiva el crecimiento medible. Si no se puede medir, no lo hacemos.',
      ctas: [
        { text: 'Agendar por WhatsApp', href: WA_DEFAULT, primary: true, external: true },
        { text: 'Escribir un brief', href: '/hablemos', primary: false }
      ]
    },
    stats: [
      { num: '+100', label: 'Negocios asesorados' },
      { num: '+5M', label: 'USD vendidos por RRSS' },
      { num: '+5', label: 'Años en industria' },
      { num: '04', label: 'Mercados activos' }
    ],
    sections: [
      {
        eyebrow: '/ qué somos',
        h2: 'Una agencia con obsesión por los datos.',
        body: 'Empezamos en 2019 como una agencia de marketing digital en Chile. Cinco años después operamos en cuatro mercados, hemos asesorado más de 100 negocios y construimos software & IA a medida para clientes que necesitan más que campañas. Nos motiva el crecimiento medible. Si no se puede medir, no lo hacemos.'
      },
      {
        eyebrow: '/ principios',
        h2: 'Cómo trabajamos.',
        bullets: [
          'Data sobre opinión: cada decisión está respaldada por números. Las opiniones son hipótesis hasta que se prueban.',
          'Transparencia radical: reportes honestos, incluyendo lo que no funcionó. No tenemos nada que ocultar.',
          'Foco en negocio: no optimizamos métricas vanidosas. Optimizamos ingresos, margen y LTV.',
          'Equipo senior: quien vende es quien ejecuta. No hay mid-funnel: trabajas directo con quien sabe.'
        ]
      },
      {
        eyebrow: '/ siguiente paso',
        h2: '¿Te suena? Hablemos.',
        body: '45 minutos sin costo, sin venta dura. Revisamos tu negocio, identificamos los 3 mayores bloqueos y te entregamos un plan accionable. Si encajamos, seguimos. Si no, te sales con valor.'
      }
    ],
    faq: [
      { q: '¿Quién es Intothecom?', a: 'Estudio digital chileno fundado en 2019. Operamos en cinco mercados (Chile, USA, España, Colombia, Perú) con +100 negocios asesorados, +5M USD generados vía RRSS para clientes y -50% CAC promedio.' },
      { q: '¿Quiénes son los founders?', a: 'Ignacio Blanco (Co-founder & Strategy Lead). Equipo senior in-house con especialistas por disciplina.' },
      { q: '¿Tienen oficina física?', a: 'Sí. Almirante Pastene 333, oficina 402, Providencia, Santiago, Chile. Recibimos visitas con cita previa.' }
    ]
  },

  '/hablemos': {
    hero: {
      eyebrow: 'Brief · cotización en < 1h hábil · respuesta directa',
      h1: 'Cuéntanos qué quieres hacer crecer.',
      body: 'Camino rápido recomendado: WhatsApp. Respuesta en menos de 1 hora hábil, sin formularios largos ni call-center. Si prefieres escribir un brief estructurado, también tenemos formulario debajo. Lunes a Viernes, 9:00 a 19:00 hora Santiago.',
      ctas: [
        { text: 'Cotizar por WhatsApp', href: WA_DEFAULT, primary: true, external: true },
        { text: 'Llamar al +56 9 7414 3642', href: 'tel:+56974143642', primary: false, external: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ canales directos',
        h2: 'Cómo llegar a nosotros.',
        bullets: [
          'WhatsApp Business +56 9 7414 3642 — respuesta en <1h hábil.',
          'Email info@intothecom.com — para briefs estructurados o documentos.',
          'Email del founder ignacio@intothecom.com — para conversaciones estratégicas.',
          'Oficina: Almirante Pastene 333, oficina 402, Providencia, Santiago. Visitas con cita previa.'
        ]
      },
      {
        eyebrow: '/ qué pasa después',
        h2: 'Proceso de cotización.',
        steps: [
          { t: 'Respuesta', d: 'Confirmamos recepción en <1h hábil con un mensaje breve de WhatsApp o email.' },
          { t: 'Discovery call', d: '30–45 min por Meet o WhatsApp para entender contexto, objetivo y restricciones reales.' },
          { t: 'Propuesta', d: 'Documento con scope, KPIs, timeline e inversión. Te llega en 48–72h hábiles.' },
          { t: 'Kickoff', d: 'Firma de contrato y arranque del proyecto. Mes 1 es onboarding.' }
        ]
      }
    ],
    faq: [
      { q: '¿Cuánto cuesta una primera reunión?', a: 'Es sin costo. 45 minutos con un lead senior. Si no encajamos, te llevas un plan accionable de todos modos.' },
      { q: '¿Tienen rango mínimo de presupuesto?', a: 'Para servicios continuos, USD 1.5K/mes (retainer base). Para Software & IA, proyectos desde USD 8K. Si tu presupuesto es menor, te recomendamos alternativas honestas.' },
      { q: '¿Trabajan con freelancers o equipo in-house?', a: 'Equipo senior in-house. No tercerizamos ejecución a freelancers externos. Quien vende es quien ejecuta.' }
    ]
  },

  '/contacto': {
    hero: {
      eyebrow: 'Contacto · oficinas y canales',
      h1: 'Hablemos.',
      body: 'WhatsApp Business +56 9 7414 3642 con respuesta en menos de 1 hora hábil. Email info@intothecom.com para briefs estructurados. Oficina HQ en Providencia, Santiago. Operamos en Chile, USA, España, Colombia y Perú.',
      ctas: [
        { text: 'WhatsApp +56 9 7414 3642', href: WA_DEFAULT, primary: true, external: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ canales',
        h2: 'Cómo contactarnos.',
        contactGrid: [
          { label: 'Email general', value: 'info@intothecom.com', href: 'mailto:info@intothecom.com' },
          { label: 'Email founder', value: 'ignacio@intothecom.com', href: 'mailto:ignacio@intothecom.com' },
          { label: 'WhatsApp', value: '+56 9 7414 3642', href: WA_DEFAULT },
          { label: 'Oficina HQ', value: 'Almirante Pastene 333, of. 402, Providencia, Santiago', href: 'https://www.google.com/maps/search/?api=1&query=Almirante+Pastene+333+Providencia+Santiago+Chile' },
          { label: 'Otras ciudades', value: 'Miami · Madrid · Bogotá · Lima' },
          { label: 'Horario', value: 'Lun–Vie · 9:00–19:00 SCL' }
        ]
      }
    ],
    faq: [
      { q: '¿Atienden fuera de Chile?', a: 'Sí. Reuniones por Google Meet, contratos en USD o moneda local. Operamos con clientes en USA, España, Colombia y Perú.' },
      { q: '¿Tienen oficina en otras ciudades?', a: 'HQ está en Santiago. Tenemos presencia comercial en Miami, Madrid, Bogotá y Lima vía partners.' }
    ]
  },

  '/casos': {
    hero: {
      eyebrow: 'Casos de éxito · resultados verificables',
      h1: 'Cuando los datos hablan, la propuesta sobra.',
      body: 'Casos seleccionados con métricas reales. Hemos trabajado con +100 marcas verificables, incluyendo Equifax, Bullpadel, Imanix, Granja Magdalena, Toke, Parque Termal Botánico, Rebels Golf, Spot Essence y CIPO. Métricas detalladas disponibles bajo NDA según sensibilidad.',
      ctas: [
        { text: 'Pedir caso aplicable', href: WA_DEFAULT, primary: true, external: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ clientes destacados',
        h2: 'Marcas con las que trabajamos.',
        bullets: [
          'Equifax — servicios financieros, expansión LATAM.',
          'Bullpadel — equipamiento deportivo, e-commerce y paid media.',
          'Imanix — juguetes magnéticos, Klaviyo + Meta Ads.',
          'Granja Magdalena — D2C de alimentos, paid media + community.',
          'Toke — fintech, growth orgánico + email marketing.',
          'Parque Termal Botánico — turismo, web + reservas online.',
          'Rebels Golf — D2C deporte, paid media + email automation.',
          'Spot Essence — D2C fragancias, e-commerce headless.',
          'CIPO — institucional, presencia digital + LinkedIn Ads.'
        ]
      },
      {
        eyebrow: '/ qué medimos',
        h2: 'Métricas que importan.',
        bullets: [
          'ROAS por canal y campaña — no impresiones.',
          'CAC y LTV — costo de adquisición vs valor de vida.',
          'Pipeline qualified — leads cualificados, no MQLs vanity.',
          'Revenue atribuible — ingreso directo medido vía atribución multi-touch.'
        ]
      }
    ],
    faq: [
      { q: '¿Puedo pedir referencias?', a: 'Sí. Te conectamos con 2–3 clientes actuales de tu industria para que hablen sin guion. Coordinación previa por respeto al tiempo de ellos.' },
      { q: '¿Por qué no muestran números públicamente?', a: 'NDA. Mostramos métricas concretas en propuestas firmadas, con autorización explícita del cliente cuando lo solicitamos.' }
    ]
  },

  '/recursos': {
    hero: {
      eyebrow: 'Recursos · guías técnicas B2B LATAM',
      h1: 'Pillar pages, benchmarks y guías.',
      body: 'Contenido técnico de marketing digital B2B en LATAM: paid media, email automation con Klaviyo y HubSpot, desarrollo web headless, agentes IA empresariales, Generative Engine Optimization (GEO), Answer Engine Optimization (AEO) y community management estratégico. Editado por consultores con +100 implementaciones reales.',
      ctas: [
        { text: 'Ver todos los recursos', href: '#recursos', primary: true }
      ]
    },
    sections: [
      {
        eyebrow: '/ temas cubiertos',
        h2: 'Qué encontrás aquí.',
        bullets: [
          'Paid Media B2B 2026: Google, Meta, LinkedIn y TikTok con tracking server-side.',
          'Email Marketing: automation con Klaviyo y HubSpot, flows de conversión.',
          'Agentes IA para empresas: arquitectura, casos de uso, costos reales.',
          'Asistente IA para atención al cliente: casos LATAM B2B verificables.',
          'CRM B2B: cómo elegir entre HubSpot, Pipedrive, Salesforce.',
          'Marketing digital B2B LATAM: benchmarks por industria y mercado.'
        ]
      },
      {
        eyebrow: '/ metodología',
        h2: 'Cómo escribimos.',
        body: 'Cada artículo está editado por un consultor senior con experiencia real en la disciplina. Citamos fuentes primarias (datos de cliente, benchmarks de plataforma, papers). Actualizamos al menos 1× por año. Sin contenido genérico generado por IA sin revisión humana.'
      }
    ],
    faq: [
      { q: '¿Puedo descargar los recursos en PDF?', a: 'Algunos sí (plantillas y checklists). Las guías largas no — preferimos que las leas en web, donde mantienen formato y actualizamos links.' },
      { q: '¿Aceptan guest posts?', a: 'No publicamos guest posts. Sí citamos fuentes externas con link cuando aportan al tema. Si tienes data interesante, escríbenos.' }
    ]
  }
};

module.exports = { SSR_CONTENT, COMMON_NAV, COMMON_FOOTER };
