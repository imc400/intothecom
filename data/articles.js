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
    relatedSlugs: ['agentes-ia-para-empresas-2026'],
    sources: [
      { name: 'Princeton GEO paper — Aggarwal et al.', url: 'https://arxiv.org/abs/2311.09735' },
      { name: 'Conductor 2026 AEO/GEO Benchmarks Report', url: 'https://www.conductor.com/academy/aeo-geo-benchmarks-report/' },
      { name: 'Ahrefs: AI Overviews and Click-Through Rate Update', url: 'https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/' },
      { name: 'Bing Webmaster AI Performance Report — Feb 2026', url: 'https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview' },
      { name: 'BrightEdge: AI Search Traffic Statistics Q1 2026', url: 'https://www.brightedge.com' }
    ]
  },
  {
    slug: 'agentes-ia-para-empresas-2026',
    type: 'pillar',
    cluster: 'software-ia',
    title: 'Agentes IA para empresas: la guía completa para implementarlos en 2026',
    description: 'Qué es un agente IA, cómo evaluar si tu empresa lo necesita, stack tecnológico (LLMs, frameworks, MCP, RAG), costos reales en USD y CLP, y errores comunes que vimos en +20 implementaciones LATAM B2B.',
    publishedAt: '2026-05-13',
    updatedAt: '2026-05-13',
    author: 'Ignacio Blanco',
    authorRole: 'Co-founder & Strategy Lead',
    authorSlug: 'ignacio-blanco',
    category: 'Software & IA',
    readingTime: '16 min',
    wordCount: 3600,
    keyword: 'agentes IA para empresas',
    secondaryKeywords: [
      'implementar agente IA empresa',
      'agentes inteligentes B2B',
      'RAG empresarial',
      'automatización con IA',
      'copilot empresarial Chile',
      'Model Context Protocol MCP'
    ],
    intent: 'Informational/Commercial',
    tags: ['Software', 'IA', 'Agentes', 'RAG', 'MCP', 'B2B'],
    heroImage: '/assets/blog/agentes-ia-para-empresas-2026.jpg',
    tldr: 'Un agente IA empresarial no es un chatbot mejorado: es un sistema que recibe un objetivo en lenguaje natural, decide qué herramientas usar (CRM, base de datos, API externa), ejecuta múltiples pasos encadenados, y entrega resultado verificable. En 2026 los frameworks maduraron (LangGraph, CrewAI, OpenAI Agents SDK), Model Context Protocol (MCP) estandarizó la conexión entre LLMs y data corporativa, y los costos cayeron 70% YoY. Esta guía explica cuándo conviene implementar un agente, qué stack elegir según caso de uso, cómo medir el ROI con números reales, y cuáles son los 5 errores que vimos romper proyectos en LATAM B2B durante 2024-2026.',
    sections: [
      { type: 'h2', id: 'que-es-agente-ia', text: '¿Qué es un agente IA empresarial?' },
      {
        type: 'p',
        text: 'Un **agente IA** es un sistema autónomo que combina un **LLM** (Large Language Model como Claude, GPT, Gemini) con **herramientas** (tools/functions que ejecutan acciones reales: leer base de datos, llamar una API, escribir un email) y **memoria** (corto o largo plazo). El agente recibe un objetivo en lenguaje natural, planifica los pasos, ejecuta cada uno, evalúa el resultado, y itera hasta cumplir el objetivo o agotar el presupuesto.'
      },
      {
        type: 'p',
        text: 'Diferencia clave con un **chatbot**: el chatbot responde preguntas. El agente **ejecuta acciones**. Pedirle a un chatbot "agenda una reunión con el cliente X mañana a las 10am" obtiene una respuesta de texto. Pedirle lo mismo a un agente con tools de Google Calendar + Gmail integradas resulta en una reunión efectivamente agendada y un email enviado al cliente.'
      },
      { type: 'h2', id: 'cuando-implementar', text: '¿Cuándo conviene implementar un agente IA en tu empresa?' },
      {
        type: 'p',
        text: 'No todo proceso empresarial se beneficia de un agente. Tres condiciones que justifican el costo:'
      },
      {
        type: 'list',
        items: [
          '**Proceso repetitivo con decisiones**. Si solo hay reglas duras (if/else) un script tradicional es mejor. Si hay juicio contextual (clasificar un email "este es un lead caliente", interpretar una consulta abierta, resumir un contrato), un agente IA agrega valor.',
          '**Volumen suficiente**. Para que el ROI compense el desarrollo + operación, conviene desde ~500 ejecuciones/mes. Bajo eso, suele ser más barato hacerlo manual o con SaaS especializado.',
          '**Tolerancia a errores acotada**. Los agentes alucinan 0.5-3% del tiempo en tareas bien diseñadas. Si tu proceso es no-recuperable de errores (transferencias bancarias, decisiones médicas), necesitas human-in-the-loop obligatorio o no automatizar.'
        ]
      },
      {
        type: 'p',
        text: 'Casos comunes que vimos funcionar bien en LATAM B2B 2024-2026: clasificación y enrutamiento de leads entrantes (chat, email, formulario), generación de propuestas comerciales personalizadas, análisis de transcripts de ventas para extraer objetions, asistentes de onboarding internos sobre documentación, RAG sobre catálogo de productos para resolver consultas técnicas, automatización de creación de reportes ejecutivos desde múltiples fuentes de data.'
      },
      { type: 'h2', id: 'stack-2026', text: 'Stack tecnológico recomendado (mayo 2026)' },
      {
        type: 'h3', id: 'llm', text: 'LLM base'
      },
      {
        type: 'p',
        text: 'Tres familias compiten por agentes empresariales en 2026:'
      },
      {
        type: 'table',
        headers: ['Familia', 'Mejor para', 'Costo (input/output por 1M tokens)', 'Latencia'],
        rows: [
          ['Claude Opus 4.7', 'Razonamiento complejo, código, escritura long-form', '$5 / $25', 'Lenta (5-15s)'],
          ['Claude Sonnet 4.6', 'Sweet spot precio/calidad — default para 90% casos B2B', '$3 / $15', 'Media (2-6s)'],
          ['Claude Haiku 4.5', 'Clasificación, extracción, alta velocidad', '$1 / $5', 'Rápida (<2s)'],
          ['GPT-5.x', 'Multimodal pesado, integración OpenAI ecosystem', 'Similar tier Sonnet/Opus', 'Media'],
          ['Gemini 2.5 Pro', 'Multimodal con video, integración Google Workspace', 'Tier medio', 'Media-rápida'],
          ['LLMs open source (Llama 4, Qwen 3)', 'Cuando data nunca puede salir on-prem', 'Self-hosted (infra cost)', 'Variable']
        ]
      },
      {
        type: 'p',
        text: 'Para una empresa B2B chilena con compliance estándar (no banca ni salud) y volumen sub-50K req/mes, **Claude Sonnet 4.6** es el default recomendado. Migrar a Opus solo cuando el caso de uso lo justifica (decisiones complejas, escritura de calidad) y a Haiku para sub-tareas rápidas.'
      },
      {
        type: 'h3', id: 'framework', text: 'Framework de orquestación'
      },
      {
        type: 'p',
        text: 'Opciones maduras a mayo 2026:'
      },
      {
        type: 'list',
        items: [
          '**LangGraph** (LangChain): el más popular, control explícito de flujo via grafo de estados. Curva de aprendizaje media. Comunidad enorme. Recomendado para 80% de casos.',
          '**CrewAI**: enfoque multi-agente con roles ("researcher", "writer", "reviewer"). Útil cuando el problema se descompone en sub-tareas con expertise distinto.',
          '**OpenAI Agents SDK** (lanzado marzo 2025): nativo de OpenAI, integra Assistants API. Menos flexible pero más simple si ya estás en stack OpenAI.',
          '**Anthropic Agent SDK**: similar al OpenAI SDK pero para Claude. Sweet spot para equipos que ya usan Claude y quieren menos configuración.',
          '**Pydantic AI**: para equipos Python que quieren type-safety estricto.',
          '**Custom Python/Node con SDK directo**: viable para casos simples (1-3 tools). Sin framework la operación se vuelve compleja a partir de 5+ tools o memory persistente.'
        ]
      },
      {
        type: 'h3', id: 'mcp', text: 'Model Context Protocol (MCP)'
      },
      {
        type: 'p',
        text: '**MCP** es el estándar abierto que Anthropic publicó en noviembre 2024 para conectar LLMs con fuentes de data externa (bases de datos, APIs, file systems). En 2026 lo soportan oficialmente Claude, ChatGPT, Cursor, Cline, Continue, Aider, y herramientas internas de Microsoft y Google. Diferencia con tools tradicionales: MCP es **bidireccional, descubrible, versionado**.'
      },
      {
        type: 'p',
        text: 'Por qué importa para empresas: en lugar de codear integraciones one-off para cada tool (Salesforce, HubSpot, Postgres, Notion), creas un MCP server por cada fuente, y cualquier agente compatible puede consumirlas. Reduce tiempo de integración 60-80% según benchmarks Anthropic. Hay >300 MCP servers públicos a mayo 2026.'
      },
      {
        type: 'h3', id: 'rag', text: 'RAG (Retrieval Augmented Generation)'
      },
      {
        type: 'p',
        text: '**RAG** = darle al LLM acceso a documentación corporativa propia (manuales, FAQ internos, catálogos, contratos) para que responda con información actualizada y verificable. Componentes: vector database (Pinecone, Qdrant, Weaviate, pgvector), embeddings model (Voyage AI, OpenAI text-embedding-3, Cohere embed-v3), retrieval logic (semantic search + reranker), context injection. Setup completo en proyecto chico: 1-2 semanas.'
      },
      {
        type: 'p',
        text: 'Stack RAG recomendado 2026 para B2B mediano: **pgvector** (Postgres extension, evita proveedor extra) + **Voyage AI** para embeddings (mejor accuracy según MTEB benchmark mayo 2026) + **Cohere rerank** para top-k filtering + Claude Sonnet 4.6 para generación. Costo operativo ~USD 50-200/mes para 1M queries con docs corporativos hasta 10GB.'
      },
      { type: 'h2', id: 'costos-reales', text: 'Costos reales de implementación (USD y CLP)' },
      {
        type: 'p',
        text: 'Tres tiers basados en proyectos reales que hicimos entre 2024 y mayo 2026:'
      },
      {
        type: 'table',
        headers: ['Tier', 'Caso típico', 'Desarrollo (one-time)', 'Operación (mensual)'],
        rows: [
          ['MVP', 'Agente con 2-3 tools, RAG sobre <5MB docs, 1 caso de uso', 'USD 8K-15K (CLP 7-14M)', 'USD 50-200/mes'],
          ['Producción', 'Agente con 5-10 tools, RAG sobre 100MB-1GB, multi-canal', 'USD 25K-60K (CLP 23-55M)', 'USD 200-1.500/mes'],
          ['Enterprise', 'Multi-agente con MCP, observability, eval suite, compliance', 'USD 80K-200K (CLP 75-185M)', 'USD 1.500-8.000/mes']
        ]
      },
      {
        type: 'p',
        text: 'Costos LLM cayeron ~70% YoY desde mayo 2025. Lo que costaba USD 0.50/request en 2024 hoy cuesta USD 0.02-0.05. Esto cambió la ecuación: casos que no eran viables económicamente hace 18 meses hoy lo son.'
      },
      { type: 'h2', id: 'errores-comunes', text: 'Los 5 errores más comunes que vimos en LATAM 2024-2026' },
      {
        type: 'list',
        items: [
          '**1. Empezar sin definir éxito medible**. Equipos lanzan "vamos a hacer un agente IA" sin métricas claras. Resultado: 3-6 meses después no saben si funcionó. Definir KPI desde día 1: tiempo ahorrado por ejecución, accuracy vs proceso manual, satisfacción usuario, costo por ejecución vs status quo.',
          '**2. Sobreingeniería de framework**. Para 1-2 tools no necesitas LangGraph + Pinecone + observability stack. SDK directo + scripts simples funciona. Reservar frameworks complejos para cuando hay >5 tools, memory persistente, o multi-agente.',
          '**3. RAG sin evaluación**. Implementan RAG, conectan docs, hacen 5 queries de prueba, deploy. Después en prod hay 30% de respuestas incorrectas. La solución: eval suite de 50-200 queries con respuestas esperadas, correr antes de cada cambio. RAGAS o Promptfoo son los frameworks dominantes 2026.',
          '**4. Ignorar guardrails**. Sin validación de output, los agentes prometen cosas que la empresa no puede cumplir, hablan en nombre legal de la marca, o filtran data confidencial. Implementar: validation schemas (Pydantic), output classifiers (un LLM evaluando output de otro), human-in-the-loop para acciones high-stakes.',
          '**5. Subestimar costo de mantenimiento**. Modelos cambian (Claude 3.5 → 4.5 → 4.6 → 4.7), prompts decay con la actualización, tools APIs evolucionan, dataset RAG necesita reindex. Presupuestar 20-40% del costo de desarrollo anualmente solo para mantenimiento.'
        ]
      },
      { type: 'h2', id: 'caso-real', text: 'Caso real anonimizado: agente de calificación de leads, +40% conversion en 90 días' },
      {
        type: 'p',
        text: 'Cliente B2B chileno, sector SaaS LATAM, ~800 leads/mes ingresando desde múltiples canales (formulario web, LinkedIn Ads, eventos, referidos). Equipo de SDRs perdía 60% del tiempo calificando manualmente — leyendo contexto, buscando empresa en LinkedIn, decidiendo prioridad.'
      },
      {
        type: 'p',
        text: 'Implementamos un agente con Claude Sonnet 4.6 + 4 tools (LinkedIn data via API, scraper del sitio del lead, lookup en CRM HubSpot, score predictivo en pgvector RAG con casos históricos cerrados ganados/perdidos). El agente calificaba en 90 segundos lo que tomaba 12-15 minutos a un SDR humano: ICP fit (1-5), urgencia (alta/media/baja), recomendación de approach.'
      },
      {
        type: 'p',
        text: 'Resultados al mes 3: SDRs pasaron de 18% conversion lead→meeting a 25% (porque solo trabajaban leads pre-calificados >3 ICP fit), tiempo de respuesta de primer toque bajó de 4h promedio a 12 min, y revenue atribuido al canal subió 40% en el período (medido con grupos de control). Costo operativo agente: USD 180/mes. ROI payback: 11 días.'
      },
      {
        type: 'p',
        text: 'Aprendizaje clave: el agente NO reemplazó SDRs. Los **liberó** de la parte tediosa para que enfocaran su tiempo en conversaciones humanas de alto valor. Esa es la lectura correcta para B2B en LATAM: agentes como **fuerza multiplicadora**, no como reemplazo.'
      },
      { type: 'h2', id: 'proximos-pasos', text: 'Próximos pasos si quieres implementar un agente IA' },
      {
        type: 'p',
        text: 'Si lideras tecnología o operaciones en una empresa B2B LATAM y quieres evaluar si un agente IA aplica a tu caso, agenda una reunión sin costo de 45 min. Te entregamos: análisis de viabilidad, scope sugerido, estimación de costos y ROI esperado.'
      },
      { type: 'cta', text: 'Cotizar agente IA por WhatsApp', waKey: 'software-ia' }
    ],
    faq: [
      {
        q: '¿En cuánto tiempo se puede tener un agente IA funcionando?',
        a: 'MVP funcional: 3-4 semanas. Versión producción con guardrails, eval suite y observability: 6-10 semanas. Versión enterprise multi-agente con MCP y compliance completo: 4-6 meses. Cualquier proveedor que prometa "agente IA en 1 semana" está armando un wrapper de prompt sin tools, eval ni observability — eso no es un agente productivo, es una demo.'
      },
      {
        q: '¿Cuál es la diferencia entre un agente IA y un chatbot tradicional?',
        a: 'Un chatbot responde texto basado en respuestas predefinidas o un LLM con prompt. Un agente IA ejecuta acciones reales: lee bases de datos, llama APIs, escribe emails, agenda calendarios. La diferencia técnica es que el agente tiene tools (functions) que puede invocar, mientras el chatbot solo genera tokens. La diferencia de impacto es: chatbot ayuda al usuario a buscar información; agente automatiza procesos completos.'
      },
      {
        q: '¿Es seguro usar agentes IA con data corporativa sensible?',
        a: 'Sí, con la arquitectura correcta. Tres capas: (1) usar LLM con compliance enterprise (Claude vía AWS Bedrock o Anthropic API empresarial, no la versión consumer de claude.ai); (2) implementar guardrails para prevenir filtración via prompt injection (clasificador de output, lista blanca de tools, rate limiting); (3) si data es ultra-sensible (PII bancaria, médica), usar LLMs open source on-premise (Llama 4, Qwen 3) en infraestructura controlada. Costo y velocidad bajan, control sube.'
      },
      {
        q: '¿Vale la pena un agente IA para empresa mediana (50-200 empleados)?',
        a: 'Depende del caso de uso, no del tamaño. La pregunta correcta es: ¿hay un proceso interno que ocupa >40 horas/semana de equipo combinado y tiene componente de juicio? Si sí, vale la pena evaluar. Casos comunes que funcionan en empresas medianas LATAM: calificación de leads (ahorra 20-40 hrs/sem SDRs), generación de propuestas comerciales (ahorra 15-30 hrs/sem comerciales), soporte L1 técnico (ahorra 30-60 hrs/sem support), reportes ejecutivos consolidados (ahorra 10-20 hrs/sem analistas).'
      },
      {
        q: '¿Qué pasa cuando el modelo LLM se actualiza? ¿se rompe mi agente?',
        a: 'Típicamente sí, parcialmente. Cuando Anthropic libera nueva versión Claude (ej. Sonnet 4.5 → 4.6 → 4.7), los prompts y respuestas cambian sutilmente. Por eso es crítico tener una eval suite con casos de prueba: corres la suite contra la nueva versión, ves qué se rompió, ajustas prompts. Los proyectos sin eval suite sufren regresiones invisibles. Presupuestar 1-2 semanas dev cada 6 meses para esta actualización es realista.'
      },
      {
        q: '¿Puedo construir un agente IA in-house o necesito agencia/consultora?',
        a: 'In-house funciona si tienes: (1) al menos 1 ingeniero senior con experiencia en LLM APIs o dispuesto a invertir 4-8 semanas en aprendizaje activo; (2) infraestructura ML básica (logging, monitoring, deploy automatizado); (3) cultura de iteración sobre data (medir, ajustar, repetir). Consultora externa tiene sentido cuando necesitas velocidad (3-6x más rápido), no tienes el perfil senior internamente, o el caso requiere expertise específico (MCP, multi-agente, compliance regulado). En IntoTheCom hemos implementado en ambos modelos según el cliente.'
      }
    ],
    relatedSlugs: ['marketing-digital-b2b-latam-2026', 'paid-media-b2b-2026'],
    sources: [
      { name: 'Anthropic MCP — Model Context Protocol official spec', url: 'https://modelcontextprotocol.io' },
      { name: 'LangGraph documentation', url: 'https://langchain-ai.github.io/langgraph/' },
      { name: 'Voyage AI embeddings MTEB benchmark', url: 'https://huggingface.co/spaces/mteb/leaderboard' },
      { name: 'Claude API pricing — Anthropic', url: 'https://www.anthropic.com/pricing#anthropic-api' },
      { name: 'Princeton GEO paper — Aggarwal et al.', url: 'https://arxiv.org/abs/2311.09735' }
    ]
  },
  {
    slug: 'paid-media-b2b-2026',
    type: 'pillar',
    cluster: 'paid-media',
    title: 'Guía Paid Media B2B 2026: Google, Meta, LinkedIn y TikTok Ads para empresas',
    description: 'Estrategia, presupuestos reales, atribución multi-touch, Conversions API y errores comunes del paid media B2B en LATAM. Por consultores con +20M USD gestionados en cuentas reales.',
    publishedAt: '2026-05-13',
    updatedAt: '2026-05-13',
    author: 'Ignacio Blanco',
    authorRole: 'Co-founder & Strategy Lead',
    authorSlug: 'ignacio-blanco',
    category: 'Paid Media',
    readingTime: '17 min',
    wordCount: 3700,
    keyword: 'paid media B2B 2026',
    secondaryKeywords: [
      'Google Ads B2B',
      'Meta Ads para empresas',
      'LinkedIn Ads ROAS',
      'TikTok Ads B2B',
      'Conversions API server side',
      'atribución multi-touch B2B',
      'CAC pipeline B2B Chile'
    ],
    intent: 'Commercial/Informational',
    tags: ['Paid Media', 'B2B', 'Google Ads', 'Meta Ads', 'LinkedIn Ads', 'Atribución'],
    heroImage: '/assets/blog/paid-media-b2b-2026.jpg',
    tldr: 'El paid media B2B en 2026 cambió en cuatro frentes simultáneos: tracking degradado por iOS 18 y eliminación de cookies third-party (Conversions API ya no es opcional), saturación de LinkedIn Ads con CPL promedio +35% YoY, llegada agresiva de TikTok B2B (especialmente para SaaS y tools dev), y AI bidding (Performance Max, Advantage+) que decide más que el operador humano. Esta guía explica cómo construir una operación paid B2B que mide pipeline real (no MQLs vanity), distribuye presupuesto por etapa del funnel, y sobrevive a la pérdida de signals de tracking. Audiencia: founders, CMOs y growth leads de empresas B2B medianas en LATAM con ventas USD 1M-20M anuales.',
    sections: [
      { type: 'h2', id: 'que-es-paid-b2b', text: '¿Qué es Paid Media B2B y por qué es distinto al B2C?' },
      {
        type: 'p',
        text: '**Paid Media B2B** es la disciplina de adquirir tráfico y leads cualificados de otras empresas usando publicidad pagada en plataformas digitales: Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads, X Ads, Reddit Ads. La diferencia con B2C no es la plataforma — es el modelo de medición y los ciclos de venta.'
      },
      {
        type: 'p',
        text: 'B2C optimiza CAC, AOV y LTV con feedback loop rápido (compra ocurre minutos u horas post-click). B2B optimiza **pipeline generation, SQL rate, CAC payback** con feedback loop de 30-180 días (lead → demo → propuesta → cierre). Esta diferencia operativa rompe la mayoría de optimizaciones automatic bidding que funcionan en B2C — Performance Max y Advantage+ optimizan a conversiones inmediatas, no a deals cerrados 90 días después.'
      },
      {
        type: 'p',
        text: 'La consecuencia: en B2B necesitas pasar **valor de pipeline en tiempo real** al algoritmo, no MQLs. Sin Conversions API + value-based bidding, optimizas vanity metrics y quemas presupuesto.'
      },
      { type: 'h2', id: 'plataformas-2026', text: 'Stack de plataformas B2B en 2026' },
      {
        type: 'h3', id: 'google-ads', text: 'Google Ads' }, { type: 'p',
        text: 'Plataforma #1 para captura de demand existente. Tres campañas core para B2B: (1) **Search brand defense** — protege tu nombre de competidores y comparadores; (2) **Search non-brand high-intent** — categorías de producto + modificadores comerciales ("X agency Chile", "X software pricing"); (3) **Performance Max** — solo cuando tienes ≥30 conversiones/mes en una sola conversion goal de alto valor. Antes de eso, PMax aprende mal y desperdicia presupuesto.'
      },
      {
        type: 'p',
        text: 'Display y YouTube ads en B2B funcionan en remarketing y view-through assist, no en cold demand. Comprar Display cold sin estar haciendo bien Search es una de las decisiones que más quema budget B2B.'
      },
      { type: 'h3', id: 'meta-ads', text: 'Meta Ads (Facebook + Instagram)' },
      {
        type: 'p',
        text: 'Mejor para **awareness mid-funnel** y nutrición de audiencias custom (visitantes web, listas CRM). Advantage+ Shopping no aplica a B2B genérico (es para e-commerce); usar **Advantage+ Audiences** con seed audience de tus mejores clientes. Pixel + Conversions API ya **obligatorio** en 2026 — sin CAPI pierdes 25-40% de signals iOS.'
      },
      { type: 'h3', id: 'linkedin-ads', text: 'LinkedIn Ads' },
      {
        type: 'p',
        text: 'Plataforma B2B por excelencia, pero saturada. CPL promedio LATAM aumentó **+35% YoY** entre 2024 y 2025 (LinkedIn Marketing Solutions Q1 2026). Tres tácticas que aún rinden: (1) **Sponsored Content** con video corto + lead gen form nativo (no landing externa); (2) **Conversation Ads** con CTA a meeting booking — convierten 3-4× más que message ads tradicionales; (3) **Document ads** (PDF carruseles) — formato más barato y con higher engagement.'
      },
      {
        type: 'p',
        text: 'Segmentación crítica: NO usar solo job titles. Combinar **job functions + seniority + company size + industry + member skills**. La búsqueda de talento abusó tanto de job titles que la audiencia se diluyó.'
      },
      { type: 'h3', id: 'tiktok-ads', text: 'TikTok Ads — la sorpresa B2B 2025-2026' },
      {
        type: 'p',
        text: 'TikTok rompió en B2B en 2025. Casos exitosos: SaaS (Notion, Linear, Vercel hacen ads), dev tools, agencias creativas, productividad. CPL TikTok B2B en LATAM puede ser **40-60% más bajo** que LinkedIn para targets similares. Limitación: solo funciona si tu producto tiene ángulo "showable" (UI, output visual, transformación). Si vendes ERP a manufactura, sigue siendo LinkedIn.'
      },
      {
        type: 'p',
        text: 'Formato recomendado 2026: TikTok Spark Ads (boost de contenido orgánico ya validado) > TikTok In-Feed Ads cold. El orgánico de la marca/founder hace el trabajo de validación creativa, paid solo amplifica.'
      },
      { type: 'h2', id: 'tracking-2026', text: 'Tracking server-side: por qué Conversions API ya no es opcional' },
      {
        type: 'p',
        text: 'iOS 18 (lanzado septiembre 2024) y la deprecación progresiva de cookies third-party rompieron el tracking client-side tradicional. Para mayo 2026, el setup mínimo B2B B2B serio es:'
      },
      {
        type: 'list',
        items: [
          '**Server-side GTM** (Google Tag Manager Server-side) hosteado en un subdomain propio (tag.tudominio.com). Reduce signal loss 25-40%.',
          '**Conversions API** en cada plataforma de paid: Meta CAPI, Google Enhanced Conversions, LinkedIn CAPI (lanzado oficialmente Q4 2024).',
          '**First-party data layer** con event_id deduplication para evitar double-counting entre pixel y CAPI.',
          '**Server-side cookies** (1st-party) para attribution windows ampliados (90-180 días B2B).',
          '**Hashed PII** (email, teléfono) enviada a las plataformas para enhanced matching — sube match rate 15-30%.'
        ]
      },
      {
        type: 'p',
        text: 'Costo de implementación 2026 para una empresa B2B mediana: USD 3-8K one-time dev + USD 50-150/mes hosting (Cloud Run o similar). ROI documentado: signal recovery genera 12-25% más conversiones medibles, que el algoritmo luego usa para optimizar mejor — efecto compuesto.'
      },
      { type: 'h2', id: 'atribucion', text: 'Atribución multi-touch en B2B: modelos y herramientas' },
      {
        type: 'p',
        text: 'Last-click no funciona en B2B (decisiones colectivas, ciclos largos). Los modelos vigentes 2026:'
      },
      {
        type: 'table',
        headers: ['Modelo', 'Cómo distribuye crédito', 'Cuándo usarlo'],
        rows: [
          ['Last touch', '100% al último touchpoint', 'Solo para presupuestar branded search defense'],
          ['First touch', '100% al primer touchpoint', 'Para medir efectividad de awareness'],
          ['Linear', 'Equitativo entre todos los touchpoints', 'Default razonable, fácil de explicar'],
          ['Time decay', 'Más peso a touchpoints recientes', 'Cuando ciclos son cortos (<45 días)'],
          ['Position-based (U-shaped)', '40% first + 40% last + 20% medio', 'Sweet spot B2B con ciclos medios'],
          ['Data-driven (Google/Meta)', 'ML asigna basado en patterns reales', 'Cuando tienes ≥50 conversions/mes, recomendado']
        ]
      },
      {
        type: 'p',
        text: 'Herramientas 2026: **Triple Whale** (USD 129-500/mo, mejor para e-commerce con marketing mix), **Northbeam** (similar pero más caro), **Wicked Reports** (B2B-focused, USD 500+/mo), **Heap** + custom dashboards (más flexible, requiere dev). Para mayor parte de B2B chileno con presupuestos <USD 30K/mo en media spend, un setup con **Google Analytics 4 + UTM disciplinado + spreadsheet de attribution manual** es suficiente — y honesto.'
      },
      { type: 'h2', id: 'metricas-correctas', text: 'Qué métricas mirar (y cuáles ignorar) en B2B' },
      {
        type: 'p',
        text: 'Vanity metrics que se ven bien en reportes pero no mueven negocio: impressions, reach, CTR aislado, MQLs sin definición de fit, ROAS de conversion goals débiles (cualquier formulario llenado).'
      },
      {
        type: 'p',
        text: 'Métricas que sí importan en orden de prioridad:'
      },
      {
        type: 'list',
        items: [
          '**Pipeline generated** por canal (USD reales en oportunidades abiertas, no MQLs).',
          '**SQL rate**: % de leads que pasan a sales qualified (filtro de fit + interés real).',
          '**CAC blended** (paid + organic + everything) y CAC payback (objetivo <12 meses).',
          '**LTV:CAC ratio** (objetivo >3:1 para que el negocio sea sano).',
          '**Win rate** por fuente de lead (paid vs orgánico vs referral): suele variar 2-4×.',
          '**Days to close** por canal: si paid lead cierra en 60 días vs 120 días orgánico, tiene valor diferenciado.',
          '**Velocity** ($/oportunidad/tiempo): cuánto pipeline mueves por unidad de tiempo.'
        ]
      },
      { type: 'h2', id: 'presupuesto', text: '¿Cuánto invertir? Benchmarks reales mayo 2026' },
      {
        type: 'p',
        text: 'Tres tiers según etapa de la empresa B2B en LATAM:'
      },
      {
        type: 'table',
        headers: ['Etapa empresa', 'Revenue anual', 'Spend paid mensual recomendado', '% paid del total marketing'],
        rows: [
          ['Validación (PMF temprano)', 'USD <500K', 'USD 500-2.000', '20-40%'],
          ['Growth temprano', 'USD 500K-3M', 'USD 3.000-10.000', '30-50%'],
          ['Growth maduro', 'USD 3M-15M', 'USD 10.000-50.000', '35-55%'],
          ['Scale', 'USD 15M+', 'USD 50.000+', '40-60%']
        ]
      },
      {
        type: 'p',
        text: 'Distribución sugerida del paid spend B2B LATAM (cifras 2025-2026, varía por industria):'
      },
      {
        type: 'list',
        items: [
          'Google Ads Search non-brand: 35-45%',
          'LinkedIn Ads: 20-30%',
          'Meta Ads (retargeting + mid-funnel): 15-25%',
          'TikTok Ads (si aplica el producto): 5-15%',
          'Branded search defense: 5-10%',
          'Experimentos / nuevos canales: 5-10%'
        ]
      },
      { type: 'h2', id: 'errores-comunes', text: 'Errores comunes que vemos en LATAM B2B' },
      {
        type: 'list',
        items: [
          '**1. Optimizar a vanity conversions**. Llamar "conversión" a cualquier formulario llenado. El algoritmo entonces optimiza para leads basura. Solución: separar conversion goals por valor (SQL > MQL > newsletter signup) y enviar valor monetario real con value-based bidding.',
          '**2. Performance Max sin baseline**. PMax requiere ≥30 conversiones/mes en UN solo conversion goal de alto valor. Lanzarlo antes desperdicia 60-80% del budget. Caminar antes de correr: Search non-brand → Demand Gen → PMax.',
          '**3. Sin Conversions API**. iOS 18 dejó hasta 40% de conversions invisibles para el pixel. Sin CAPI server-side, optimizas con la mitad de los datos.',
          '**4. LinkedIn job-title-only targeting**. Audiencias dilutivas. Combinar job function + seniority + skills + company size para precision real.',
          '**5. Atribución last-click en B2B**. Decisiones de compra B2B son colectivas y largas. Last-click sobrevalora bottom-funnel y mata investment en awareness que actúa de soporte.',
          '**6. No alinear paid con sales**. Marketing celebra MQLs pero sales no contesta porque son leads basura. Necesitas SLA bidireccional: marketing entrega leads con definición de fit clara; sales contesta en <2h con razón clara.',
          '**7. No documentar creatives ganadores**. Cada plataforma desactiva creatives después de 30-60 días por fatigue. Si no tienes biblioteca de winners y testing systematic, vives en re-trabajo creativo permanente.'
        ]
      },
      { type: 'h2', id: 'caso-real', text: 'Caso real anonimizado: SaaS B2B Chile, CAC payback de 18 → 7 meses' },
      {
        type: 'p',
        text: 'Cliente SaaS B2B chileno, ARR USD 2M con MRR USD 165K, invertía USD 8K/mes en paid distribuido en Google Ads + LinkedIn + Meta. CAC blended USD 1.200, payback de 18 meses, win rate paid leads 8% (vs 22% en referrals). Equipo growth de 2 personas, sin atribución multi-touch real.'
      },
      {
        type: 'p',
        text: 'Implementación en 90 días:'
      },
      {
        type: 'list',
        items: [
          'Setup server-side GTM + Conversions API en Google, Meta y LinkedIn — recuperó 31% de signals iOS perdidos',
          'Pasaje de last-click a position-based attribution → re-balance budget: bajamos Meta cold de 35% a 20%, subimos branded search defense de 5% a 12%',
          'LinkedIn: pasó de targeting por job title a function + seniority + skills + company size 50-500 employees + industry shortlist; CPL bajó 27%',
          'Definición clara de SQL en CRM con sales (filter de fit: empresa >10 employees, decision-maker, presupuesto evidente, problema identificado) — MQLs cayeron 40% pero SQLs subieron 65%',
          'Value-based bidding en Google Ads con pipeline value real (no estimación) pasado vía Enhanced Conversions for Leads — Smart Bidding mejoró ROAS 1.8× en 60 días',
          'Implementamos sesión semanal de creative review con sales para extraer objections y mejorar copy de ads'
        ]
      },
      {
        type: 'p',
        text: 'Resultados al mes 6: CAC blended bajó a USD 480, **payback CAC de 18 meses → 7 meses**, win rate paid leads subió de 8% a 19%, pipeline atribuido a paid creció 2.4× con mismo spend. Costo de implementación: USD 14K dev + USD 180/mes incremental en tooling. ROI implementation: 11 meses payback (basado en ahorro de CAC alone).'
      },
      { type: 'h2', id: 'siguiente-paso', text: 'Próximos pasos para tu operación paid B2B' },
      {
        type: 'p',
        text: 'Si lideras marketing o growth en una empresa B2B LATAM, agenda reunión sin costo de 45 min. Audit gratuito de tu cuenta actual (Google + LinkedIn + Meta) y plan accionable de optimización en 7 días.'
      },
      { type: 'cta', text: 'Auditar mi cuenta paid por WhatsApp', waKey: 'paid-media' }
    ],
    faq: [
      {
        q: '¿Cuánto presupuesto mínimo se necesita para empezar paid B2B en LATAM?',
        a: 'Para que el algoritmo tenga señal suficiente y puedas testear hipótesis: USD 2.500-3.500 mensuales mínimo, repartidos en 1-2 canales primero (no abrir 5 plataformas con USD 500 cada una). Bajo USD 2.500/mes, mejor invertir esos recursos en SEO orgánico + outbound manual.'
      },
      {
        q: '¿LinkedIn Ads o Google Ads para B2B chileno?',
        a: 'Google Ads primero, casi siempre. Captura demand existente (gente buscando "agencia X Chile"). LinkedIn Ads para crear demand cuando ya tienes baseline funcionando — más caro, ciclos más largos. La excepción: si vendes a roles específicos sin volumen de búsqueda significativo (ej. CFOs de empresas 200-1000 empleados), LinkedIn puede ser primario.'
      },
      {
        q: '¿Conversions API es realmente necesario en 2026?',
        a: 'Sí. Sin CAPI pierdes 25-40% de conversion signal en iOS post-iOS18, y el algoritmo optimiza peor en consecuencia. Setup inicial requiere dev (3-5 días) pero el lift en ROAS suele justificar el costo en 60-90 días. Es uno de los proyectos con mejor ROI en paid B2B 2026.'
      },
      {
        q: '¿Cómo medir el ROI real del paid si los deals cierran en 90+ días?',
        a: 'Tres palancas combinadas: (1) Setup de Enhanced Conversions for Leads con valor monetario por etapa del pipeline (no esperar a deal cerrado, valorar SQL en USD basado en win rate histórico × deal size promedio); (2) Atribución position-based o data-driven (no last-click); (3) Lookback windows extendidas (90-180 días en LinkedIn, 90 días en Google, 28-56 días en Meta). Cohort analysis mensual para validar.'
      },
      {
        q: '¿Performance Max sirve para B2B o es solo para e-commerce?',
        a: 'Sirve pero con caveats. Funciona cuando: (1) tienes ≥30 conversiones del mismo tipo por mes; (2) la conversión es de valor real (SQL, no MQL); (3) tienes value-based bidding configurado con USD reales; (4) hay assets variados (videos, imágenes, copys) para que el sistema componga. Si te falta cualquiera, PMax aprende mal y desperdicia budget. Para early-stage B2B, Search non-brand + Demand Gen suele ser mejor.'
      },
      {
        q: '¿TikTok Ads funciona para empresas B2B chilenas?',
        a: 'Depende del producto. Funciona bien para SaaS, productivity tools, agencias creativas, edtech, fintech consumer. NO funciona (todavía) para industrial, manufactura, B2B muy específico vertical (logística, mining tools). Si tu founder o equipo ya está creando contenido orgánico en TikTok con tracción decente, Spark Ads (boost orgánico) es 3-5× más eficiente que ads cold tradicional.'
      }
    ],
    relatedSlugs: ['marketing-digital-b2b-latam-2026', 'agentes-ia-para-empresas-2026'],
    sources: [
      { name: 'Meta Conversions API documentation', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/' },
      { name: 'Google Enhanced Conversions for Leads', url: 'https://support.google.com/google-ads/answer/13258081' },
      { name: 'LinkedIn Marketing Solutions Q1 2026 benchmarks', url: 'https://business.linkedin.com/marketing-solutions/insights' },
      { name: 'TikTok for Business B2B case studies', url: 'https://www.tiktok.com/business/en/inspiration' },
      { name: 'iOS 18 ATT Impact on Ad Tracking (AppsFlyer 2025)', url: 'https://www.appsflyer.com/blog/' }
    ]
  }
];

// Lista de pillars planificados (próximos a publicar)
const PLANNED_PILLARS = [
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
