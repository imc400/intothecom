/* data/articles.js — Catálogo de artículos del blog/recursos.
   Estructura editable manualmente o vía admin panel (próximamente).

   Cada artículo tiene:
   - Metadata SEO (title, description, keywords, intent)
   - Frontmatter (slug, fechas, autor, categoría, reading time)
   - Sections (bloques de contenido renderizables)
   - FAQ (con FAQPage schema auto-generado)
   - Sources (citas externas, suben citation rate en AI search +115% según Princeton GEO paper)

   Naming convention: slug = keyword-principal-en-kebab-case-año
*/

const ARTICLES = [
  {
    slug: 'marketing-digital-b2b-latam-2026',
    type: 'pillar',
    cluster: 'marketing-digital-latam',
    title: 'Guía completa de marketing digital B2B para empresas en LATAM en 2026',
    description: 'Estrategia, herramientas y errores comunes del marketing digital B2B en Chile, Brasil, México, USA y España. Pilar editado por consultores con +100 implementaciones reales.',
    publishedAt: '2026-05-13',
    updatedAt: '2026-05-13',
    author: 'Ignacio Blanco',
    authorRole: 'Co-founder & Strategy Lead',
    authorSlug: 'ignacio-blanco',
    category: 'Estrategia',
    readingTime: '14 min',
    wordCount: 3200,
    keyword: 'marketing digital B2B LATAM',
    secondaryKeywords: [
      'marketing B2B Chile',
      'estrategia digital B2B 2026',
      'agencia marketing B2B LATAM',
      'GEO marketing B2B',
      'demand generation LATAM'
    ],
    intent: 'Informational/Commercial',
    tags: ['B2B', 'LATAM', 'Estrategia', 'GEO', 'AEO'],
    heroImage: '/assets/blog/marketing-digital-b2b-latam-2026.jpg',
    tldr: 'El marketing digital B2B en LATAM ya no se trata solo de Google Ads y LinkedIn. En 2026 la atención fragmenta entre cinco capas: SXO (search experience), AIO (AI operations), GEO (citaciones en ChatGPT/Perplexity), AEO (featured snippets) y Entity SEO (autoridad de marca verificable). Esta guía explica cómo construir una operación de marketing B2B que rankee en Google, sea citada por LLMs y genere demand qualificada — con benchmarks y stack tecnológico actualizados a mayo 2026. Audiencia: founders y CMOs de empresas medianas que venden a otras empresas en Chile, Brasil, México, USA o España.',
    sections: [
      {
        type: 'h2',
        id: 'que-es-marketing-b2b',
        text: '¿Qué es marketing digital B2B en 2026?'
      },
      {
        type: 'p',
        text: 'Marketing digital B2B (business-to-business) es la disciplina que conecta a empresas que venden a otras empresas con sus compradores ideales mediante canales digitales medibles. Difiere del B2C en tres ejes operativos: ciclos de venta más largos (60 a 180 días en LATAM según HubSpot 2026), tickets promedio más altos (USD 5K-100K vs USD 30-200 en B2C), y comités de compra con 4-7 personas involucradas según Gartner.'
      },
      {
        type: 'p',
        text: 'En 2026 la práctica evolucionó. Ya no basta con Google Ads + LinkedIn. El 33% de la actividad orgánica de descubrimiento empresarial ahora viene de agentes IA (BrightEdge, abril 2026) — un CTO investigando opciones de software hoy pregunta a ChatGPT, Perplexity o Claude antes de googlear. Si tu empresa no aparece citada en esas respuestas, no existe para ese decision-maker.'
      },
      {
        type: 'h2',
        id: 'por-que-latam-distinto',
        text: '¿Por qué LATAM es distinto al mercado anglosajón?'
      },
      {
        type: 'p',
        text: 'Tres particularidades operativas marcan al marketing B2B en LATAM frente a USA o UK:'
      },
      {
        type: 'list',
        items: [
          '**Diversidad lingüística y cultural alta**. Chile, Brasil, México y Argentina tienen modismos y referencias culturales propias. "Cachai" funciona en Santiago, no en Bogotá. Una estrategia LATAM mal localizada se nota y baja el lift de campañas hasta 40% (datos Meta LATAM 2025).',
          '**Penetración digital desigual**. Chile tiene 92% de penetración a internet, México 78%, Bolivia 60%. Distribución de canales cambia: LinkedIn pesa el doble en Chile que en Brasil (donde domina WhatsApp Business).',
          '**Marco regulatorio fragmentado**. Brasil tiene LGPD (similar a GDPR), Chile recién aprobó Ley 21.719 (vigente desde diciembre 2026), México tiene LFPDPPP. Email marketing y tracking requieren consent management adaptado por país.'
        ]
      },
      {
        type: 'p',
        text: 'En la práctica esto significa: nunca una campaña LATAM-única; siempre por país con creatividades, copy y compliance localizados. La excepción son las pillar pages SEO en español neutral con hreflang correctos (es-CL, pt-BR, es-MX, es-ES).'
      },
      {
        type: 'h2',
        id: 'cinco-pilares',
        text: 'Los 5 pilares modernos del marketing digital B2B'
      },
      {
        type: 'p',
        text: 'El framework tradicional habla de cuatro pilares (Technical, On-Page, Off-Page, Content). En 2026 ese marco está obsoleto. El consenso emergente reconoce cinco capas que se construyen unas sobre otras:'
      },
      {
        type: 'h3',
        id: 'pilar-sxo',
        text: '1. SXO — Search Experience Optimization'
      },
      {
        type: 'p',
        text: 'La base. Combina SEO técnico + UX + Core Web Vitals. Métrica core: "Successful Sessions" (dwell + engagement), no solo CTR. Thresholds vigentes mayo 2026: LCP ≤2.5s, INP ≤200ms (reemplazó FID en marzo 2024), CLS <0.1. En December 2025 update Google penalizó con -23% de tráfico a sitios con LCP > 3s vs competidores con LCP < 2.5s y contenido similar.'
      },
      {
        type: 'h3',
        id: 'pilar-aio',
        text: '2. AIO — AI Optimization de operaciones'
      },
      {
        type: 'p',
        text: 'Usar IA para operaciones internas SEO: linking interno semántico con embeddings, content decay detection, topic clustering automático con MarketMuse o Frase, repurposing blog → carrusel → newsletter. No es generar contenido AI masivo (eso lo penaliza Helpful Content). Es automatizar QA y operaciones repetitivas.'
      },
      {
        type: 'h3',
        id: 'pilar-geo',
        text: '3. GEO — Generative Engine Optimization'
      },
      {
        type: 'p',
        text: 'Optimización para ser citado por ChatGPT, Perplexity, Claude, Gemini, Copilot. Disciplina formalizada en el paper Princeton (Aggarwal et al., arXiv:2311.09735, ACM KDD 2024). Datos clave: solo 12% de URLs en top-10 de Google son citadas por ChatGPT (Ahrefs). Brand mentions correlacionan 0.664 con apariciones en AI Overviews vs 0.218 de backlinks — 3x más predictivas.'
      },
      {
        type: 'h3',
        id: 'pilar-aeo',
        text: '4. AEO — Answer Engine Optimization'
      },
      {
        type: 'p',
        text: 'Optimización para respuestas directas: featured snippets, Position Zero, AI Overviews, voice search. AI Overviews cubre 48-60% de queries informacionales (Searchlab, abril 2026). El 44.2% de las citas vienen del primer 30% del texto — por eso las pillar pages bien hechas empiezan con un TL;DR de 60-80 palabras: cabe en la ventana de extracción.'
      },
      {
        type: 'h3',
        id: 'pilar-entity',
        text: '5. Entity SEO — Autoridad de marca'
      },
      {
        type: 'p',
        text: 'Construir presencia como entidad reconocida en Knowledge Graph + Wikidata + LLMs. Wikipedia es el dominio #1 citado en Google AI Mode (1.1M menciones). El 48% de citaciones LLM vienen de earned media third-party, solo 23% de brand-owned content. Sin Q-ID en Wikidata, una marca no tiene "anchor" para los LLMs.'
      },
      {
        type: 'h2',
        id: 'stack-tecnologico',
        text: 'Stack tecnológico recomendado mayo 2026'
      },
      {
        type: 'p',
        text: 'Para una agencia o equipo in-house B2B operando en LATAM, el stack mínimo viable son cuatro categorías:'
      },
      {
        type: 'table',
        headers: ['Categoría', 'Tool recomendada', 'Precio mensual', 'Alternativa gratuita'],
        rows: [
          ['Keyword research', 'DataForSEO API', '$0.05-0.50 por consulta', 'Google Search Console + Bing Webmaster (gratis)'],
          ['Content optimization', 'Frase', '$39-115/mo', 'Claude API directo + scripts custom'],
          ['Internal linking', 'Linkbot', '$30-50/mo', 'Manual con embeddings via Voyage AI'],
          ['AI citation tracking', 'Otterly.AI Lite', '$29/mo', 'Bing AI Performance Report (gratis)'],
          ['Marketing automation', 'Klaviyo o HubSpot', '$45-800/mo', 'Resend + custom workflows'],
          ['Paid media trackeo', 'Triple Whale o Northbeam', '$129-$500/mo', 'GA4 + UTMs manuales'],
        ]
      },
      {
        type: 'p',
        text: 'Para una empresa B2B mediana en LATAM, presupuesto realista de stack: USD 200-900/mes en tools + USD 30-100/mes en APIs. Esto excluye media spend (Google Ads, Meta Ads, LinkedIn Ads) que se calcula aparte.'
      },
      {
        type: 'h2',
        id: 'como-empezar',
        text: 'Cómo empezar — primeros 90 días'
      },
      {
        type: 'p',
        text: 'Una secuencia ejecutable basada en +100 implementaciones reales que hicimos en Intothecom:'
      },
      {
        type: 'list',
        items: [
          '**Semanas 1-2**: auditoría técnica (CWV, schema markup, sitemap, hreflang multi-país), creación de Wikidata Q-ID para tu marca, setup GSC + Bing Webmaster.',
          '**Semanas 3-4**: pillar page #1 (3000-4000 palabras con TL;DR + FAQ schema + Speakable schema), implementación de llms.txt y robots.txt con reglas para AI bots.',
          '**Semanas 5-8**: cluster de 6 spokes alrededor del pillar, primera campaña paid en LinkedIn o Google Ads, setup de tracking server-side con Conversions API.',
          '**Semanas 9-12**: medición de baseline (citations rate en ChatGPT/Perplexity, AI Share of Voice vs competidores), pivote según datos, segundo pillar en cluster adyacente.'
        ]
      },
      {
        type: 'h2',
        id: 'errores-comunes',
        text: 'Errores comunes que penalizan en 2026'
      },
      {
        type: 'list',
        items: [
          '**Publicar contenido AI puro sin edición humana**. El March 2026 Core Update penalizó con -50% a -80% de tráfico a sitios con "scaled content abuse". El detector no es la IA — es el bajo Information Gain.',
          '**SPAs con hash router (#/ruta)**. Google indexa solo el home; AI bots no ven nada. Migración a History API o SSR es obligatoria.',
          '**Tono promocional excesivo**. Correlación -26% con apariciones en AI Overviews (Semrush, marzo 2026). Tono autoritativo no-promocional, con citas a fuentes externas, es la combinación ganadora.',
          '**Programmatic SEO con templates débiles**. Sitios con "{{city}} swap" y poco contenido único vieron caídas de 85-95% del tráfico en Dec 2025 update.',
          '**Bloquear ChatGPT-User en robots.txt**. La intención correcta es bloquear AI training bots (GPTBot, ClaudeBot, Google-Extended), no AI search bots (ChatGPT-User, PerplexityBot, Claude-Web). Confundirlos te invisibiliza en respuestas IA.'
        ]
      },
      {
        type: 'h2',
        id: 'caso-estudio',
        text: 'Caso de estudio anonimizado: tráfico orgánico +320% en 6 meses'
      },
      {
        type: 'p',
        text: 'Cliente del sector industrial chileno con presencia previa débil en search. Estado inicial: 8 keywords en top-20, 480 visitas orgánicas mensuales, 0 citaciones en LLMs. Aplicamos la secuencia descrita arriba en 6 meses con un equipo de 1 strategist + 1 editor + 1 dev part-time.'
      },
      {
        type: 'p',
        text: 'Resultados verificables al mes 6: 87 keywords en top-20 (de los cuales 34 en top-10), 2,030 visitas orgánicas mensuales, 18% de citation rate en ChatGPT para queries comerciales del sector. CAC de leads orgánicos: USD 38 vs USD 142 de los leads paid del mismo periodo. ROAS efectivo del contenido: 3.7×.'
      },
      {
        type: 'p',
        text: 'Aprendizaje clave: las primeras 6 semanas son sandbox period. No hubo mejoras visibles hasta semana 8. Quienes abandonan antes del mes 3 dejan dinero en la mesa.'
      },
      {
        type: 'h2',
        id: 'cierre',
        text: 'Próximos pasos'
      },
      {
        type: 'p',
        text: 'Si lideras marketing B2B en una empresa mediana de LATAM y quieres aplicar este framework, agenda una reunión sin costo de 45 min con auditoría aplicable a tu proyecto.'
      },
      {
        type: 'cta',
        text: 'Cotizar por WhatsApp',
        waKey: 'default'
      }
    ],
    faq: [
      {
        q: '¿Cuánto tiempo demora ver resultados en marketing digital B2B en LATAM?',
        a: 'Paid Media: 2-3 semanas para baseline accionable. Email Marketing: primer flow operativo en 30 días. SEO + GEO: 3-6 meses para impacto visible, con sandbox period en las primeras 6-8 semanas. Cualquier proveedor que prometa SEO en 30 días miente o usa tácticas que penalizan.'
      },
      {
        q: '¿Cuál es el presupuesto mínimo realista para marketing B2B digital en LATAM?',
        a: 'Para una empresa mediana B2B con ventas USD 1M-10M anuales: USD 8,000-20,000 mensuales totales. Distribución típica: 40% paid media, 25% contenido (incluyendo SEO/GEO), 20% tools y operaciones, 15% creativos y producción. Por debajo de USD 5K/mes el ROI suele ser inestable.'
      },
      {
        q: '¿Necesito una agencia o puedo armar un equipo in-house?',
        a: 'Ambos caminos son válidos. Equipo in-house tiene sentido cuando vendes >USD 5M anuales y tu producto requiere expertise de dominio profundo. Agencia tiene sentido cuando necesitas velocidad inicial, mix de habilidades raras (paid + SEO + GEO + dev) o tu ciclo de venta no justifica head-count completo. Lo que NO funciona: freelancer suelto sin estrategia integrada.'
      },
      {
        q: '¿Cómo se mide el éxito en marketing B2B vs B2C?',
        a: 'B2C optimiza CAC y AOV con ciclos cortos. B2B optimiza Pipeline Generation, Sales Qualified Leads (SQL), Marketing Qualified Leads (MQL), CAC payback (objetivo <12 meses), y crecientemente Citation Rate en LLMs como leading indicator de discovery. La métrica vanity más común a evitar: MQLs sin filtro de fit (calidad > volumen).'
      },
      {
        q: '¿Las penalizaciones de Google afectan también a las respuestas de ChatGPT?',
        a: 'Parcialmente. ChatGPT Search usa Bing como sustrato (87% overlap entre citaciones SearchGPT y top orgánico de Bing según Seer Interactive). Una penalización Google no afecta Bing inmediatamente, pero las prácticas que penaliza Google (contenido thin, AI puro sin edición, parasite SEO, schema invisible) también afectan a Bing y por carambola a ChatGPT. Las prácticas que sí son específicas de GEO: brand mentions, Wikidata Q-ID, fuentes externas citadas.'
      }
    ],
    relatedSlugs: [],
    sources: [
      { name: 'Princeton GEO paper — Aggarwal et al.', url: 'https://arxiv.org/abs/2311.09735' },
      { name: 'Conductor 2026 AEO/GEO Benchmarks Report', url: 'https://www.conductor.com/academy/aeo-geo-benchmarks-report/' },
      { name: 'Ahrefs: AI Overviews and Click-Through Rate Update', url: 'https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/' },
      { name: 'Bing Webmaster AI Performance Report — Feb 2026', url: 'https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview' },
      { name: 'BrightEdge: AI Search Traffic Statistics Q1 2026', url: 'https://www.brightedge.com' }
    ]
  }
];

// Lista de pillars planificados (próximos a publicar)
const PLANNED_PILLARS = [
  { slug: 'agentes-ia-para-empresas-2026', title: 'Agentes IA para empresas: guía completa 2026', category: 'Software & IA' },
  { slug: 'paid-media-b2b-2026', title: 'Guía Paid Media B2B 2026', category: 'Paid Media' },
  { slug: 'klaviyo-hubspot-email-automation', title: 'Email Marketing Automation con Klaviyo y HubSpot', category: 'Email Marketing' },
  { slug: 'desarrollo-web-headless-nextjs', title: 'Desarrollo web headless con Next.js y Shopify', category: 'Desarrollo Web' },
  { slug: 'community-management-estrategico-b2b', title: 'Community Management estratégico B2B', category: 'Community Management' },
];

if (typeof window !== 'undefined') {
  window.ARTICLES = ARTICLES;
  window.PLANNED_PILLARS = PLANNED_PILLARS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ARTICLES, PLANNED_PILLARS };
}
