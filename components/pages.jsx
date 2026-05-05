/* Service template + per-service data + Software/IA + Nosotros + Hablemos */

const SERVICES_LIST = [
  { num:'01', t:'Software & IA a medida', path:'/software-ia', tag:'NUEVO · 2026',
    desc:'Agentes conversacionales, copilotos, automatizaciones y dashboards construidos para tu operación. No suscripciones genéricas — sistemas concretos.' },
  { num:'02', t:'Paid Media', path:'/paid-media', tag:'Google · Meta · TikTok',
    desc:'Impulsa tu negocio con campañas de anuncios efectivas. Tráfico calificado mediante anuncios pagados con foco en ROAS y CAC, no en impresiones vacías.' },
  { num:'03', t:'Email Marketing', path:'/email-marketing', tag:'Klaviyo · HubSpot',
    desc:'Potencia tus ventas con estrategias efectivas de email marketing. Segmentación precisa, automatizaciones y flows que convierten en tu canal más rentable.' },
  { num:'04', t:'Diseño y Desarrollo Web', path:'/desarrollo-web', tag:'Next · Shopify · Headless',
    desc:'Aumenta el valor de tu negocio con un sitio web atractivo y funcional. UI/UX con foco en conversión, performance Lighthouse 90+ y SEO técnico integrado.' },
  { num:'05', t:'Community Management', path:'/community-management', tag:'IG · TikTok · LinkedIn',
    desc:'Conecta con tu audiencia con criterio editorial y comunidad real, no vanity metrics. Línea editorial, producción de contenido y gestión de comunidad.' },
];

function Servicios({ navigate }) {
  return (
    <>
      <section className="hero" data-screen-label="00 Servicios" style={{paddingBottom:48}}>
        <DarkCanvas density={0.9}/>
        <div className="hero-inner">
          <div className="hero-top">
            <span>Servicios · 05</span>
            <span>Estudio digital · est. 2019</span>
            <span>Chile · Brasil · USA · España</span>
          </div>
          <h1 className="hero-headline" style={{maxWidth:'20ch'}}>
            Todo lo que tu negocio necesita <span className="it">para crecer en serio.</span>
          </h1>
        </div>
        <div className="hero-inner">
          <div className="hero-bottom" style={{gridTemplateColumns:'1fr', gap:0}}>
            <p className="lead" style={{maxWidth:'62ch'}}>
              Marketing digital, desarrollo de software & inteligencia artificial. Diseñamos cada servicio para integrarse con los demás — no como silos, sino como un motor que crece junto a tu negocio.
            </p>
          </div>
        </div>
      </section>

      <section className="section tight" data-screen-label="01 Catálogo">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md">/ catálogo · 05 servicios</div>
          </Reveal>
          <div className="services-grid">
            {SERVICES_LIST.map((s,i) => (
              <Reveal key={s.num} delay={i*60}>
                <a href={"#"+s.path}
                   onClick={(e)=>{e.preventDefault();navigate(s.path);}}
                   className="service-card hoverable">
                  <div className="service-card-top">
                    <span className="service-card-num">{s.num}</span>
                    <span className="service-card-tag">{s.tag}</span>
                  </div>
                  <h3 className="service-card-title">{s.t}</h3>
                  <p className="service-card-desc">{s.desc}</p>
                  <span className="service-card-cta">
                    Ver detalle <span className="service-card-arrow">↗</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark tight" data-screen-label="02 Cómo">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md" style={{opacity:0.55}}>/ cómo trabajamos</div>
              <h2 className="h1" style={{maxWidth:'18ch'}}>
                Tres etapas. <span className="it">Sin teatro.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="process">
                <div className="process-step">
                  <span className="step-num">01</span>
                  <div>
                    <h4>Construimos</h4>
                    <p>Diseñamos, desarrollamos o mejoramos tu activo digital — sitio, sistema o agente IA — con foco en negocio.</p>
                  </div>
                </div>
                <div className="process-step">
                  <span className="step-num">02</span>
                  <div>
                    <h4>Lo posicionamos</h4>
                    <p>SEO técnico + estrategia orgánica para que aparezcas donde tus clientes buscan.</p>
                  </div>
                </div>
                <div className="process-step">
                  <span className="step-num">03</span>
                  <div>
                    <h4>Lo promocionamos</h4>
                    <p>Paid media, email y community con tracking server-side. Cada peso invertido tiene un retorno explícito.</p>
                  </div>
                </div>
                <div className="process-step">
                  <span className="step-num">04</span>
                  <div>
                    <h4>Lo escalamos</h4>
                    <p>Cuando un ángulo funciona, escalamos vertical y horizontalmente. Reportes mensuales con decisiones, no con gráficos.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md">/ ¿no sabes por dónde empezar?</div>
              <h2 className="h2" style={{maxWidth:'20ch'}}>
                Conversemos sin <span className="it">compromiso.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="body-lg" style={{maxWidth:'48ch'}}>
                Una reunión de 45 min donde revisamos tu negocio, identificamos los 3 mayores bloqueos y te entregamos un plan accionable. Sin venta dura, sin presentaciones aburridas. Si encajamos, seguimos. Si no, te sales con valor.
              </p>
              <div style={{display:'flex', gap:14, flexWrap:'wrap', marginTop:32}}>
                <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('servicios-final')} className="btn hoverable">
                  Agendar reunión por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
                </a>
                <a href="#/hablemos"
                   onClick={(e)=>{e.preventDefault();navigate('/hablemos');}}
                   className="btn ghost hoverable">
                  Escribir un brief <span className="arrow">↗</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function ServicePage({ navigate, data }) {
  return (
    <>
      <section className="svc-hero" data-screen-label={data.screenLabel}>
        <DarkCanvas density={0.8}/>
        <div className="svc-hero-inner">
          <div>
            <div className="eyebrow" style={{color:'#ededea', opacity:0.6, marginBottom:24}}>/ {data.eyebrow}</div>
            <h1 className="h-display" style={{maxWidth:'14ch'}}>
              {data.titlePre}<span className="it">{data.titleEm}</span>
            </h1>
          </div>
          <div className="svc-meta">
            <div className="row"><span>Servicio</span><span>{data.serviceCode}</span></div>
            <div className="row"><span>Disponibilidad</span><span>CL · BR · US · ES</span></div>
            <div className="row"><span>Duración mín.</span><span>{data.duration}</span></div>
            <div className="row"><span>Categorías</span><span>{data.categories}</span></div>
            <a href={waLink(data.waKey || 'default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick(`svc-${data.waKey || 'default'}-hero`)} className="btn invert hoverable" style={{marginTop:24}}>
              Cotizar por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md">/ qué es</div>
              <h2 className="h2">{data.whatTitlePre}<span className="it">{data.whatTitleEm}</span></h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="body-lg" style={{maxWidth:'52ch'}}>{data.whatBody}</p>
              {data.whatBullets && (
                <ul className="what-list">
                  {data.whatBullets.map((b,i)=>(
                    <li key={i}>
                      <span className="what-num">0{i+1}</span>
                      <span className="what-text">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section dark tight">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md" style={{opacity:0.55}}>/ proceso</div>
            <h2 className="h1 mb-lg" style={{maxWidth:'20ch'}}>{data.howTitlePre}<span className="it">{data.howTitleEm}</span></h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="process">
              {data.process.map((p,i)=>(
                <div key={i} className="process-step">
                  <span className="step-num">0{i+1}</span>
                  <div>
                    <h4>{p.t}</h4>
                    <p>{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md">/ qué obtienes</div>
              <h2 className="h2">Resultados <span className="it">medibles.</span></h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="benefits">
                {data.benefits.map((b,i)=>(
                  <div key={i} className="benefit-row">
                    <span className="benefit-num">+0{i+1}</span>
                    <div>
                      <div className="benefit-title">{b.t}</div>
                      <p className="benefit-body">{b.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href={waLink(data.waKey || 'default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick(`svc-${data.waKey || 'default'}-benefits`)} className="btn hoverable" style={{marginTop:48}}>
                Hablemos por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md">/ explorar</div>
            <h3 className="h2 mb-lg">Otros <span className="it">servicios.</span></h3>
          </Reveal>
          <div className="services">
            {data.others.map((o,i) => (
              <a href={"#"+o.path} key={i}
                 onClick={(e)=>{e.preventDefault();navigate(o.path);}}
                 className="service-row">
                <span className="num">{o.num}</span>
                <h3 className="title">{o.t}</h3>
                <p className="desc">{o.desc}</p>
                <span className="go">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const SERVICE_DATA = {
  'paid-media': {
    waKey:'paid-media',
    screenLabel:'02 Paid Media', eyebrow:'paid media',
    titlePre:'Anuncios que ', titleEm:'venden.',
    serviceCode:'PM-01', duration:'3 meses', categories:'Google · Meta · TikTok · LinkedIn',
    whatTitlePre:'Tráfico calificado, ', whatTitleEm:'ROI medible.',
    whatBody:'Paid Media se enfoca en aumentar el tráfico calificado mediante anuncios pagados. Diseñamos campañas con foco en resultados rápidos, medibles y un alto retorno de inversión — no en impresiones vacías.',
    whatBullets:['Estrategia full-funnel: descubrimiento, consideración y conversión.','Creatividades A/B que no parecen ads.','Tracking server-side y atribución limpia.','Reportes semanales con decisiones, no con gráficos.'],
    howTitlePre:'Un proceso construido para ', howTitleEm:'escalar.',
    process:[
      {t:'Auditoría',d:'Revisamos tu cuenta actual, audiencias, tracking y competencia para encontrar el techo real.'},
      {t:'Setup',d:'Configuramos pixel, conversiones server-side, audiencias y estructura de campañas.'},
      {t:'Lanzamiento',d:'Test creativo en paralelo, presupuesto controlado y aprendizaje rápido en 2 semanas.'},
      {t:'Escala',d:'Cuando un ángulo funciona, escalamos vertical y horizontalmente sin reventar el CAC.'},
    ],
    benefits:[
      {t:'Resultados rápidos y medibles',d:'Campañas con KPIs claros desde la semana uno: ROAS, CAC y LTV proyectado.'},
      {t:'Alto retorno de inversión',d:'Optimizamos por ingreso, no por clics. Cada peso invertido tiene un objetivo de retorno explícito.'},
      {t:'Estructura escalable',d:'Cuentas limpias y documentadas, listas para crecer sin canibalizar tus propias campañas.'},
    ],
    others:[
      {num:'02',t:'Email Marketing',desc:'Automatizaciones que convierten.',path:'/email-marketing'},
      {num:'03',t:'Software & IA',desc:'Productos digitales a medida.',path:'/software-ia'},
      {num:'04',t:'Desarrollo Web',desc:'Sitios diseñados para vender.',path:'/desarrollo-web'},
    ],
  },
  'email-marketing': {
    waKey:'email-marketing',
    screenLabel:'03 Email', eyebrow:'email marketing',
    titlePre:'Inbox que ', titleEm:'convierte.',
    serviceCode:'EM-01', duration:'3 meses', categories:'Klaviyo · Mailchimp · HubSpot · ActiveCampaign',
    whatTitlePre:'Contacto directo, ', whatTitleEm:'sin intermediarios.',
    whatBody:'El email es la única audiencia que realmente posees. Diseñamos estrategias personalizadas con segmentación, contenido relevante, automatizaciones y análisis continuo.',
    whatBullets:['Segmentación precisa por comportamiento y valor.','Creación de contenido relevante y atractivo.','Análisis de métricas y optimización continua.','Flows: bienvenida, abandono, post-compra, win-back.'],
    howTitlePre:'Del primer correo al ', howTitleEm:'noveno flow.',
    process:[
      {t:'Auditoría de listas',d:'Limpiamos, segmentamos y validamos tu base actual.'},
      {t:'Estrategia',d:'Calendario editorial, plantillas master y mapa de automatizaciones.'},
      {t:'Producción',d:'Diseñamos y programamos campañas con copywriting que no se ignora.'},
      {t:'Optimización',d:'A/B test en asunto, hora, contenido y CTA. Mejora continua.'},
    ],
    benefits:[
      {t:'Alto impacto en conversiones',d:'Email convierte 4–6× mejor que social. Bien hecho, es tu canal más rentable.'},
      {t:'Tráfico sostenido',d:'Cada envío recuerda tu marca y alimenta el ciclo de retención.'},
      {t:'Audiencia 100% propia',d:'Tu lista es un activo que no se evapora con un cambio de algoritmo.'},
    ],
    others:[
      {num:'02',t:'Paid Media',desc:'Campañas con foco en ROAS y CAC.',path:'/paid-media'},
      {num:'03',t:'Community Management',desc:'Comunidad real.',path:'/community-management'},
      {num:'04',t:'Software & IA',desc:'Automatizaciones a medida.',path:'/software-ia'},
    ],
  },
  'desarrollo-web': {
    waKey:'desarrollo-web',
    screenLabel:'04 Web', eyebrow:'diseño y desarrollo web',
    titlePre:'Sitios que ', titleEm:'venden.',
    serviceCode:'WEB-01', duration:'6–12 semanas', categories:'Next.js · Shopify · Webflow · Headless',
    whatTitlePre:'Tu sitio es ', whatTitleEm:'tu mejor vendedor.',
    whatBody:'Diseñamos y desarrollamos sitios web y e-commerce de forma personalizada. Cada decisión —velocidad, jerarquía, copy, microinteracción— está al servicio de la conversión.',
    whatBullets:['Diseño UI/UX con foco en conversión.','Performance: Core Web Vitals en verde.','SEO técnico integrado: estructura, schema, sitemap.','Stack moderno: Next.js, headless, CMS desacoplado.'],
    howTitlePre:'Diseño y código ', howTitleEm:'bajo el mismo techo.',
    process:[
      {t:'Discovery',d:'Definimos KPIs del sitio antes de tocar Figma.'},
      {t:'Diseño',d:'Wireframes, sistema de diseño, prototipos navegables.'},
      {t:'Desarrollo',d:'Código limpio, componentizado, con CMS para tu equipo.'},
      {t:'Lanzamiento',d:'QA cross-browser, migración, redirects, monitoreo.'},
    ],
    benefits:[
      {t:'Conversión medible',d:'Sitios construidos para vender, con tracking limpio desde el primer pixel.'},
      {t:'Performance que se siente',d:'Lighthouse 90+ no negociable. Cada milisegundo cuenta.'},
      {t:'Editable por tu equipo',d:'CMS amigable. Editás textos e imágenes sin llamarnos.'},
    ],
    others:[
      {num:'02',t:'Software & IA',desc:'Productos digitales a medida.',path:'/software-ia'},
      {num:'03',t:'Paid Media',desc:'Tráfico calificado para tu nuevo sitio.',path:'/paid-media'},
      {num:'04',t:'Email Marketing',desc:'Convierte tráfico en clientes recurrentes.',path:'/email-marketing'},
    ],
  },
  'community-management': {
    waKey:'community-management',
    screenLabel:'05 Community', eyebrow:'community management',
    titlePre:'Comunidad ', titleEm:'real.',
    serviceCode:'CM-01', duration:'3 meses', categories:'Instagram · TikTok · LinkedIn · X',
    whatTitlePre:'Contenido con ', whatTitleEm:'criterio editorial.',
    whatBody:'Construimos presencia social con voz propia, contenido que se comparte y comunidad que responde. No publicamos por publicar — cada pieza tiene un objetivo y se mide.',
    whatBullets:['Línea editorial y tono de marca documentado.','Calendario mensual con ángulos, formatos y CTAs.','Producción de contenido: foto, motion, copy.','Gestión de comunidad: DMs, comentarios y crisis.'],
    howTitlePre:'Más que ', howTitleEm:'postear bonito.',
    process:[
      {t:'Brand strategy',d:'Voz, tono, pilares de contenido y guía visual.'},
      {t:'Producción',d:'Sesiones mensuales: foto, video y motion alineados con la estrategia.'},
      {t:'Publicación',d:'Calendario aprobado, horarios óptimos por canal, copywriting nativo.'},
      {t:'Comunidad',d:'Respondemos, moderamos y reportamos sentiment cada semana.'},
    ],
    benefits:[
      {t:'Marca con personalidad',d:'Salimos del feed genérico. Tu marca se reconoce sin ver el logo.'},
      {t:'Comunidad que compra',d:'Audiencia engaged, no inflada. Más DMs útiles, menos likes vacíos.'},
      {t:'Reportes con insights',d:'Mensual, con qué funcionó, qué no, y qué probamos el mes que viene.'},
    ],
    others:[
      {num:'02',t:'Paid Media',desc:'Amplifica tu mejor contenido orgánico.',path:'/paid-media'},
      {num:'03',t:'Email Marketing',desc:'Convierte seguidores en clientes.',path:'/email-marketing'},
      {num:'04',t:'Software & IA',desc:'Automatiza moderación y reportes.',path:'/software-ia'},
    ],
  },
};

function SoftwareIA({ navigate }) {
  return (
    <>
      <section className="svc-hero" data-screen-label="06 Software IA">
        <DarkCanvas density={1.5}/>
        <div className="svc-hero-inner">
          <div>
            <div className="eyebrow" style={{color:'#ededea', opacity:0.6, marginBottom:24}}>/ nuevo · 2026</div>
            <h1 className="h-display" style={{maxWidth:'16ch'}}>
              Software <span className="it">&amp;</span> IA <span className="it">a medida.</span>
            </h1>
            <p className="body-lg" style={{maxWidth:'42ch', opacity:0.85, marginTop:32}}>
              No vendemos suscripciones a herramientas genéricas. Construimos sistemas concretos para tu negocio.
            </p>
          </div>
          <div className="svc-meta">
            <div className="row"><span>Servicio</span><span>SW-01</span></div>
            <div className="row"><span>Disponibilidad</span><span>CL · BR · US · ES</span></div>
            <div className="row"><span>Stack</span><span>Python · Node · Next · LLMs</span></div>
            <div className="row"><span>Modelos</span><span>GPT · Claude · Gemini · OSS</span></div>
            <a href={waLink('software-ia')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('software-ia-hero')} className="btn invert hoverable" style={{marginTop:24}}>
              Discutir por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md">/ manifiesto</div>
            <h2 className="h-display" style={{maxWidth:'18ch'}}>
              La IA útil <span className="it">no es un chatbot</span> en una esquina. Es código que reemplaza tareas reales.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="manifesto-grid">
              <div className="manifesto-cell">
                <div className="manifesto-num">/ 01</div>
                <h4>Construimos, no revendemos.</h4>
                <p>No te vendemos una suscripción a ChatGPT con copywriting encima. Diseñamos arquitectura: data, prompts versionados, eval, observabilidad y rollback.</p>
              </div>
              <div className="manifesto-cell">
                <div className="manifesto-num">/ 02</div>
                <h4>Tu data, tu propiedad.</h4>
                <p>RAG y fine-tuning sobre tu información interna sin filtrarla a modelos públicos. On-prem, VPC privada o hybrid según tu nivel de criticidad.</p>
              </div>
              <div className="manifesto-cell">
                <div className="manifesto-num">/ 03</div>
                <h4>Métricas, no demos.</h4>
                <p>Cada agente o automatización se mide en horas ahorradas, leads calificados o ingresos atribuidos. Si no mueve el negocio, lo apagamos.</p>
              </div>
              <div className="manifesto-cell">
                <div className="manifesto-num">/ 04</div>
                <h4>Producción en 6 semanas.</h4>
                <p>Discovery 1 sem · Prototipo 2 sem · Producto 3 sem. Sin presentaciones eternas: el primer prototipo funcional con tu data en menos de 14 días.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section tight dark">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md" style={{opacity:0.55}}>/ stack & modelos</div>
            <h3 className="h2 mb-lg" style={{maxWidth:'22ch'}}>Construimos con las herramientas <span className="it">correctas para cada problema.</span></h3>
          </Reveal>
          <Reveal delay={120}>
            <div className="stack-grid">
              <div className="stack-cell">
                <div className="stack-label">/ modelos</div>
                <div className="stack-tags">
                  <span className="stack-tag">GPT-5</span>
                  <span className="stack-tag">Claude Opus 4.7</span>
                  <span className="stack-tag">Gemini 2.5</span>
                  <span className="stack-tag">Llama 3</span>
                  <span className="stack-tag">Mistral</span>
                </div>
              </div>
              <div className="stack-cell">
                <div className="stack-label">/ orquestación</div>
                <div className="stack-tags">
                  <span className="stack-tag">LangGraph</span>
                  <span className="stack-tag">Vercel AI SDK</span>
                  <span className="stack-tag">Anthropic Agent SDK</span>
                  <span className="stack-tag">n8n</span>
                </div>
              </div>
              <div className="stack-cell">
                <div className="stack-label">/ vector & data</div>
                <div className="stack-tags">
                  <span className="stack-tag">Pinecone</span>
                  <span className="stack-tag">Weaviate</span>
                  <span className="stack-tag">pgvector</span>
                  <span className="stack-tag">Postgres</span>
                  <span className="stack-tag">BigQuery</span>
                </div>
              </div>
              <div className="stack-cell">
                <div className="stack-label">/ runtime & infra</div>
                <div className="stack-tags">
                  <span className="stack-tag">Python</span>
                  <span className="stack-tag">Node.js</span>
                  <span className="stack-tag">Next.js</span>
                  <span className="stack-tag">AWS</span>
                  <span className="stack-tag">GCP</span>
                  <span className="stack-tag">DigitalOcean</span>
                </div>
              </div>
              <div className="stack-cell">
                <div className="stack-label">/ observabilidad</div>
                <div className="stack-tags">
                  <span className="stack-tag">LangSmith</span>
                  <span className="stack-tag">Helicone</span>
                  <span className="stack-tag">Sentry</span>
                  <span className="stack-tag">PostHog</span>
                </div>
              </div>
              <div className="stack-cell">
                <div className="stack-label">/ integraciones típicas</div>
                <div className="stack-tags">
                  <span className="stack-tag">HubSpot</span>
                  <span className="stack-tag">Salesforce</span>
                  <span className="stack-tag">WhatsApp Business</span>
                  <span className="stack-tag">Shopify</span>
                  <span className="stack-tag">Notion</span>
                  <span className="stack-tag">Slack</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <Reveal><div className="eyebrow mb-md">/ qué construimos</div><h3 className="h2 mb-lg">Capacidades.</h3></Reveal>
          <Reveal delay={120}>
            <div className="bento">
              <div className="bento-cell dark" style={{gridColumn:'span 4', gridRow:'span 2'}}>
                <span className="small" style={{opacity:0.55}}>01 · agentes</span>
                <h4>Agentes conversacionales que cierran ventas, agendan reuniones y califican leads 24/7.</h4>
              </div>
              <div className="bento-cell feat" style={{gridColumn:'span 2'}}>
                <span className="small">02 · rag</span><h4>RAG sobre tu data interna.</h4>
              </div>
              <div className="bento-cell" style={{gridColumn:'span 2'}}>
                <span className="small">03 · automate</span><h4>Automatizaciones que reemplazan horas-persona.</h4>
              </div>
              <div className="bento-cell feat" style={{gridColumn:'span 2', gridRow:'span 2'}}>
                <span className="small">04 · dashboards</span>
                <h4>Dashboards de decisión con insights que el negocio entiende.</h4>
                <div style={{display:'flex', gap:6, alignItems:'flex-end', height:50}}>
                  {[40,60,30,80,55,90,70,50].map((h,i)=>(<div key={i} style={{flex:1, height:h+'%', background:'var(--ink)'}}></div>))}
                </div>
              </div>
              <div className="bento-cell" style={{gridColumn:'span 2'}}>
                <span className="small">05 · integrations</span><h4>Integraciones con tu CRM, ERP y herramientas existentes.</h4>
              </div>
              <div className="bento-cell dark" style={{gridColumn:'span 2'}}>
                <span className="small" style={{opacity:0.55}}>06 · copilots</span><h4>Copilotos internos para tu equipo.</h4>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md" style={{opacity:0.55}}>/ casos de uso reales</div>
            <h2 className="h1 mb-lg" style={{maxWidth:'18ch'}}>Lo que <span className="it">ya construimos.</span></h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="cases">
              {[
                {sector:'Retail', title:'Agente WhatsApp con catálogo en vivo', metric:'+38%', desc:'conversión chat→compra'},
                {sector:'B2B SaaS', title:'Copiloto interno sobre 12k tickets', metric:'−62%', desc:'tiempo de resolución'},
                {sector:'Inmobiliaria', title:'Agente que precalifica y agenda visitas', metric:'+4×', desc:'leads calificados/mes'},
                {sector:'E-commerce', title:'Pricing dinámico con elasticidad', metric:'+19%', desc:'margen sin perder volumen'},
                {sector:'Educación', title:'RAG sobre cursos + tutor personalizado', metric:'+47%', desc:'completion rate'},
              ].map((c,i)=>(
                <div key={i} className="case-row">
                  <span className="case-num">0{i+1}</span>
                  <span className="case-sector">{c.sector}</span>
                  <h4 className="case-title">{c.title}</h4>
                  <div className="case-right">
                    <div>
                      <div className="case-metric">{c.metric}</div>
                      <div className="case-desc">{c.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md">/ cómo trabajamos</div>
            <h2 className="h1 mb-lg" style={{maxWidth:'20ch'}}>De idea a producción <span className="it">en 6 semanas.</span></h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="process">
              <div className="process-step"><span className="step-num">01</span><div><h4>Discovery</h4><p>1 sem · Entendemos el problema, mapeamos data y definimos métricas de éxito.</p></div></div>
              <div className="process-step"><span className="step-num">02</span><div><h4>Prototipo</h4><p>2 sem · Versión funcional con tu data real. Validamos antes de escalar.</p></div></div>
              <div className="process-step"><span className="step-num">03</span><div><h4>Producto</h4><p>3 sem · UI, integraciones, observabilidad y eval continuo. Listo para usuarios.</p></div></div>
              <div className="process-step"><span className="step-num">04</span><div><h4>Operación</h4><p>Mensual · Monitoreo, mejora de prompts y nuevas features.</p></div></div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Nosotros({ navigate }) {
  return (
    <>
      <section className="hero" data-screen-label="07 Nosotros">
        <DarkCanvas density={0.9}/>
        <div className="hero-inner">
          <div className="hero-top">
            <span>El estudio</span><span>est. 2019</span><span>4 mercados</span>
          </div>
          <h1 className="hero-headline" style={{maxWidth:'18ch'}}>
            <span className="it">Cinco años</span> haciendo crecer negocios.
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split-title"><div className="eyebrow mb-md">/ qué somos</div><h2 className="h2">Una agencia con <span className="it">obsesión por los datos.</span></h2></Reveal>
            <Reveal delay={120}>
              <p className="body-lg" style={{maxWidth:'52ch'}}>
                Empezamos en 2019 como una agencia de marketing digital en Chile. Cinco años después operamos en cuatro mercados, hemos asesorado más de 100 negocios y construimos software & IA a medida para clientes que necesitan más que campañas.
              </p>
              <p className="body-lg" style={{maxWidth:'52ch', marginTop:24}}>
                Nos motiva el crecimiento medible. Si no se puede medir, no lo hacemos.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section dark tight">
        <div className="container">
          <Reveal>
            <div className="stats">
              <div className="stat"><div className="num">+100</div><div className="lbl">Negocios asesorados</div></div>
              <div className="stat"><div className="num">+5M</div><div className="lbl">USD vendidos por RRSS</div></div>
              <div className="stat"><div className="num">+5</div><div className="lbl">Años en industria</div></div>
              <div className="stat"><div className="num">04</div><div className="lbl">Mercados activos</div></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><div className="eyebrow mb-md">/ principios</div><h2 className="h1 mb-lg" style={{maxWidth:'20ch'}}>Cómo <span className="it">trabajamos.</span></h2></Reveal>
          <Reveal delay={120}>
            <div className="principles">
              {[
                ['Data sobre opinión','Cada decisión está respaldada por números. Las opiniones son hipótesis hasta que se prueban.'],
                ['Transparencia radical','Reportes honestos, incluyendo lo que no funcionó. No tenemos nada que ocultar.'],
                ['Foco en negocio','No optimizamos métricas vanidosas. Optimizamos ingresos, margen y LTV.'],
                ['Equipo senior','Quien vende es quien ejecuta. No hay mid-funnel: trabajas directo con quien sabe.'],
              ].map((p,i)=>(
                <div key={i} className="principle-row">
                  <span className="principle-num">0{i+1}</span>
                  <h4 className="principle-title">{p[0]}</h4>
                  <p className="principle-body">{p[1]}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section dark tight">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md" style={{opacity:0.55}}>/ siguiente paso</div>
              <h2 className="h1" style={{maxWidth:'18ch'}}>
                ¿Te suena? <span className="it">Hablemos.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="body-lg" style={{maxWidth:'48ch', opacity:0.85}}>
                45 minutos sin costo, sin venta dura. Revisamos tu negocio, identificamos los 3 mayores bloqueos y te entregamos un plan accionable. Si encajamos, seguimos. Si no, te sales con valor.
              </p>
              <div style={{display:'flex', gap:14, flexWrap:'wrap', marginTop:32}}>
                <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('nosotros-final')} className="btn hoverable">
                  Agendar por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
                </a>
                <a href="#/hablemos"
                   onClick={(e)=>{e.preventDefault();navigate('/hablemos');}}
                   className="btn ghost hoverable">
                  Escribir un brief <span className="arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function Hablemos({ navigate }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [showMore, setShowMore] = React.useState(false);
  const [form, setForm] = React.useState({ name:'', company:'', email:'', service:'', budget:'', message:'' });
  const update = (k,v) => setForm(f => ({...f, [k]:v}));
  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('https://formsubmit.co/ajax/info@intothecom.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `Nuevo brief desde intothecom.com — ${form.name}`,
          _cc: 'ignacio@intothecom.com',
          _template: 'table',
          _captcha: 'false',
          name: form.name,
          email: form.email,
          message: form.message,
          company: form.company || '—',
          service: form.service || '—',
          budget: form.budget || '—',
          source: 'intothecom.com /hablemos',
        }),
      });
      if (!res.ok) throw new Error('formsubmit failed');
      if (window.fbqTrack) window.fbqTrack('Lead', { content_name: 'brief_form', value: 1, currency: 'CLP' });
      if (window.fbqTrackCustom) window.fbqTrackCustom('FormSubmit', { service: form.service || 'unspecified' });
      setSubmitted(true);
    } catch (err) {
      const subject = encodeURIComponent(`Brief desde intothecom.com — ${form.name}`);
      const body = encodeURIComponent(
        `Nombre: ${form.name}\nEmail: ${form.email}\nEmpresa: ${form.company || '—'}\nServicio: ${form.service || '—'}\nPresupuesto: ${form.budget || '—'}\n\nMensaje:\n${form.message}`
      );
      window.location.href = `mailto:info@intothecom.com?cc=ignacio@intothecom.com&subject=${subject}&body=${body}`;
      setError('No pudimos enviar automáticamente. Te abrimos tu cliente de correo como respaldo.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <section className="hero" data-screen-label="08 Hablemos">
        <DarkCanvas density={0.7}/>
        <div className="hero-inner">
          <div className="hero-top"><span>Estás a un paso de partir hacia el éxito</span><span>info@intothecom.com</span><span>Respuesta &lt; 1h hábil</span></div>
          <h1 className="hero-headline" style={{maxWidth:'20ch'}}>
            Cuéntanos <span className="it">qué quieres hacer crecer.</span>
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          {!submitted ? (
            <>
              <div className="wa-primary-block">
                <div>
                  <div className="eyebrow mb-md">/ camino rápido · recomendado</div>
                  <h2 className="h2" style={{maxWidth:'18ch', marginBottom:14}}>Hablemos por <span className="it">WhatsApp.</span></h2>
                  <p className="body" style={{opacity:0.75, maxWidth:'46ch', marginBottom:24}}>
                    Respuesta en menos de 1h hábil. Sin formularios largos, sin call-center.
                  </p>
                  <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('hablemos-primary')} className="btn hoverable">
                    Cotizar por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
                  </a>
                </div>
                <div className="wa-primary-meta">
                  <div className="wa-meta-row"><span className="mono">/ número</span><span>+56 9 7414 3642</span></div>
                  <div className="wa-meta-row"><span className="mono">/ horario</span><span>Lun–Vie 9–19 SCL</span></div>
                  <div className="wa-meta-row"><span className="mono">/ respuesta</span><span>&lt; 1h hábil</span></div>
                  <div className="wa-meta-row"><span className="mono">/ verificado</span><span>WhatsApp Business</span></div>
                </div>
              </div>

              <div className="form-divider">
                <span>o escríbenos un brief</span>
              </div>

              <form className="form" onSubmit={submit} noValidate aria-label="Brief de contacto">
                <div className="form-row">
                  <label htmlFor="f-name">01 / Nombre <span aria-label="requerido">*</span></label>
                  <input id="f-name" required type="text" autoComplete="name" placeholder="Tu nombre completo" value={form.name} onChange={e=>update('name', e.target.value)} aria-required="true"/>
                </div>
                <div className="form-row">
                  <label htmlFor="f-email">02 / Email <span aria-label="requerido">*</span></label>
                  <input id="f-email" required type="email" autoComplete="email" placeholder="hola@tuempresa.com" value={form.email} onChange={e=>update('email', e.target.value)} aria-required="true"/>
                </div>
                <div className="form-row">
                  <label htmlFor="f-msg">03 / Cuéntanos <span aria-label="requerido">*</span></label>
                  <textarea id="f-msg" required placeholder="¿Qué problema quieres resolver?" rows={3} value={form.message} onChange={e=>update('message', e.target.value)} aria-required="true"/>
                </div>

                {showMore && (
                  <div id="form-extra-fields">
                    <div className="form-row">
                      <label htmlFor="f-company">04 / Empresa</label>
                      <input id="f-company" type="text" autoComplete="organization" placeholder="Nombre de tu empresa" value={form.company} onChange={e=>update('company', e.target.value)}/>
                    </div>
                    <div className="form-row">
                      <label htmlFor="f-svc">05 / Servicio</label>
                      <select id="f-svc" value={form.service} onChange={e=>update('service', e.target.value)}>
                        <option value="">Selecciona un servicio</option>
                        <option>Software & IA a medida</option>
                        <option>Paid Media</option>
                        <option>Email Marketing</option>
                        <option>Desarrollo Web</option>
                        <option>Community Management</option>
                        <option>Strategy / multi-servicio</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label htmlFor="f-budget">06 / Presupuesto</label>
                      <select id="f-budget" value={form.budget} onChange={e=>update('budget', e.target.value)}>
                        <option value="">Rango mensual estimado</option>
                        <option>USD 1.5k–3k</option><option>USD 3k–8k</option><option>USD 8k–20k</option>
                        <option>USD 20k+</option><option>Aún no lo sé</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="form-toggle hoverable" aria-expanded={showMore} aria-controls="form-extra-fields" onClick={()=>setShowMore(s=>!s)}>
                    {showMore ? '— Menos detalles' : '+ Más detalles (opcional)'}
                  </button>
                  <button type="submit" className="btn hoverable" disabled={submitting}>
                    {submitting ? 'Enviando…' : 'Enviar brief'} <span className="arrow" aria-hidden="true">↗</span>
                  </button>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <p className="form-privacy">
                  Al enviar aceptas que usemos tu información solo para responderte. Sin spam, sin listas. Cumplimos Ley 19.628 (CL) y GDPR.
                </p>
              </form>
            </>
          ) : (
            <Reveal>
              <div style={{textAlign:'center', padding:'60px 0'}}>
                <div className="eyebrow mb-md" style={{justifyContent:'center'}}>/ mensaje recibido</div>
                <h2 className="h-display" style={{maxWidth:'14ch', margin:'0 auto'}}>
                  Gracias, <span className="it">{form.name || 'tu mensaje'}</span>.<br/>Te respondemos en 24h.
                </h2>
                <button className="btn hoverable" style={{marginTop:32}} onClick={()=>navigate('/')}>
                  Volver al inicio <span className="arrow">↗</span>
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-cell">
              <div className="contact-label">/ Email general</div>
              <a className="contact-value contact-link" href="mailto:info@intothecom.com">info@intothecom.com</a>
            </div>
            <div className="contact-cell">
              <div className="contact-label">/ Email founder</div>
              <a className="contact-value contact-link" href="mailto:ignacio@intothecom.com">ignacio@intothecom.com</a>
            </div>
            <div className="contact-cell">
              <div className="contact-label">/ WhatsApp</div>
              <a className="contact-value contact-link" href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('hablemos-grid')}>+56 9 7414 3642</a>
            </div>
            <div className="contact-cell">
              <div className="contact-label">/ Oficina HQ</div>
              <a className="contact-value contact-link" href="https://www.google.com/maps/search/?api=1&query=Almirante+Pastene+333+Providencia+Santiago+Chile" target="_blank" rel="noopener noreferrer">Almirante Pastene 333, of. 402, Providencia</a>
            </div>
            <div className="contact-cell">
              <div className="contact-label">/ Otras ciudades</div>
              <div className="contact-value">São Paulo · Miami · Madrid</div>
            </div>
            <div className="contact-cell">
              <div className="contact-label">/ Horario</div>
              <div className="contact-value">Lun–Vie · 9:00–19:00 SCL</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Contacto({ navigate }) {
  const mapsQuery = encodeURIComponent('Almirante Pastene 333, Providencia, Santiago, Chile');
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const mapsEmbed = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
  return (
    <>
      <section className="hero" data-screen-label="Contacto" style={{paddingBottom:48}}>
        <DarkCanvas density={0.7}/>
        <div className="hero-inner">
          <div className="hero-top">
            <span>Contacto · oficinas + canales</span>
            <span>Respuesta &lt; 1h hábil</span>
            <span>Lun–Vie · 9:00–19:00 SCL</span>
          </div>
          <h1 className="hero-headline" style={{maxWidth:'20ch'}}>
            Conversemos en <span className="it">persona,</span> por mail o por WhatsApp.
          </h1>
        </div>
        <div className="hero-inner">
          <div className="hero-bottom" style={{gridTemplateColumns:'1fr', gap:0}}>
            <p className="lead" style={{maxWidth:'56ch'}}>
              Atendemos desde Providencia, Santiago. Coordinamos reuniones presenciales o por Meet con clientes en Chile, Brasil, USA y España.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            <Reveal>
              <div className="contact-channels">
                <div className="contact-channel">
                  <div className="contact-channel-label">/ WhatsApp Business</div>
                  <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('contacto-channel')} className="contact-channel-value contact-channel-link">
                    +56 9 7414 3642
                  </a>
                  <div className="contact-channel-meta">Respuesta promedio &lt; 1h hábil</div>
                </div>
                <div className="contact-channel">
                  <div className="contact-channel-label">/ Email general</div>
                  <a href="mailto:info@intothecom.com" className="contact-channel-value contact-channel-link">
                    info@intothecom.com
                  </a>
                  <div className="contact-channel-meta">Briefs, prensa, partners</div>
                </div>
                <div className="contact-channel">
                  <div className="contact-channel-label">/ Email founder</div>
                  <a href="mailto:ignacio@intothecom.com" className="contact-channel-value contact-channel-link">
                    ignacio@intothecom.com
                  </a>
                  <div className="contact-channel-meta">Conversaciones estratégicas</div>
                </div>
                <div className="contact-channel">
                  <div className="contact-channel-label">/ Teléfono</div>
                  <a href="tel:+56974143642" className="contact-channel-value contact-channel-link">
                    +56 9 7414 3642
                  </a>
                  <div className="contact-channel-meta">Lun–Vie · 9:00–19:00 SCL</div>
                </div>
                <div className="contact-channel">
                  <div className="contact-channel-label">/ Oficina central</div>
                  <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="contact-channel-value contact-channel-link">
                    Almirante Pastene 333, of. 402
                  </a>
                  <div className="contact-channel-meta">Providencia · Santiago de Chile</div>
                </div>
                <div className="contact-channel">
                  <div className="contact-channel-label">/ Otras ciudades</div>
                  <div className="contact-channel-value">São Paulo · Miami · Madrid</div>
                  <div className="contact-channel-meta">Reuniones por Meet o presenciales</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="contact-map-wrap">
                <iframe
                  title="Oficina Intothecom — Almirante Pastene 333, Providencia"
                  src={mapsEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="contact-map"
                  allowFullScreen
                ></iframe>
                <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="contact-map-link">
                  Abrir en Google Maps <span aria-hidden="true">↗</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section dark tight">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md" style={{opacity:0.55}}>/ camino rápido</div>
              <h2 className="h1" style={{maxWidth:'18ch'}}>
                ¿Quieres ir <span className="it">directo al grano?</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="body-lg" style={{maxWidth:'48ch', opacity:0.85}}>
                Escríbenos por WhatsApp Business y respondemos en menos de una hora hábil. Sin formularios, sin call-center.
              </p>
              <div style={{display:'flex', gap:14, flexWrap:'wrap', marginTop:32}}>
                <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('contacto-final')} className="btn hoverable">
                  Cotizar por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
                </a>
                <a href="#/hablemos"
                   onClick={(e)=>{e.preventDefault();navigate('/hablemos');}}
                   className="btn ghost hoverable">
                  Escribir un brief <span className="arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function Casos({ navigate }) {
  const cases = [
    { sector:'Retail · LatAm', client:'Bullpadel Chile', title:'E-commerce headless con tracking server-side', summary:'Migración a Shopify Hydrogen + atribución limpia + paid integrado. Mes 1 de tracking nuevo desbloqueó audiencias que estaban siendo subreportadas un 38%.', metrics:[['+213%','revenue YoY'],['ROAS 6.2×','blended Q3'],['9 meses','time-to-result']] },
    { sector:'B2B SaaS · CL/USA', client:'Equifax — SEC', title:'Calificación de leads con copiloto interno', summary:'Copiloto sobre 12k tickets históricos para que ventas pre-califique antes del primer contacto. Reduce tiempo de resolución y libera horas-persona del equipo senior.', metrics:[['−62%','tiempo resolución'],['+4×','leads calificados/mes'],['12k','tickets indexados']] },
    { sector:'Industrial · Chile', client:'Imanix', title:'Automatización de inventario + agente conversacional B2B', summary:'Reemplazo de 3 procesos manuales por un agente que toma pedidos, valida stock en vivo y deriva a humano cuando hay duda. Onboarding en 6 semanas.', metrics:[['−47h','horas/mes liberadas'],['+27%','checkout completion'],['6 sem','prototipo a prod']] },
  ];
  return (
    <>
      <section className="hero" data-screen-label="Casos" style={{paddingBottom:48}}>
        <DarkCanvas density={0.9}/>
        <div className="hero-inner">
          <div className="hero-top">
            <span>Casos seleccionados · 03</span>
            <span>+100 marcas asesoradas · 19 visibles</span>
            <span>Datos verificables</span>
          </div>
          <h1 className="hero-headline" style={{maxWidth:'20ch'}}>
            Cuando los datos hablan, <span className="it">la propuesta sobra.</span>
          </h1>
        </div>
        <div className="hero-inner">
          <div className="hero-bottom" style={{gridTemplateColumns:'1fr', gap:0}}>
            <p className="lead" style={{maxWidth:'56ch'}}>
              Casos seleccionados con métricas reales y fuentes verificables. Casos completos bajo NDA disponibles en reunión.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md">/ casos destacados</div>
          </Reveal>
          <div className="cases-list">
            {cases.map((c,i) => (
              <Reveal key={i} delay={i*80}>
                <article className="case-card">
                  <div className="case-card-meta">
                    <span className="case-card-num">0{i+1}</span>
                    <span className="case-card-sector">{c.sector}</span>
                    <span className="case-card-client">{c.client}</span>
                  </div>
                  <h2 className="case-card-title">{c.title}</h2>
                  <p className="case-card-summary">{c.summary}</p>
                  <div className="case-card-metrics">
                    {c.metrics.map((m,j)=>(
                      <div key={j} className="case-card-metric">
                        <div className="case-card-metric-num">{m[0]}</div>
                        <div className="case-card-metric-lbl">{m[1]}</div>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark tight">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md" style={{opacity:0.55}}>/ siguiente paso</div>
              <h2 className="h1" style={{maxWidth:'18ch'}}>
                ¿Quieres ver el <span className="it">tuyo acá?</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="body-lg" style={{maxWidth:'48ch', opacity:0.85}}>
                Casos completos con metodología, anti-patrones evitados y métricas mensuales se comparten en reunión. WhatsApp es el camino más rápido.
              </p>
              <div style={{display:'flex', gap:14, flexWrap:'wrap', marginTop:32}}>
                <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('casos-final')} className="btn hoverable">
                  Pedir caso completo por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

window.ServicePage = ServicePage;
window.SERVICE_DATA = SERVICE_DATA;
window.Servicios = Servicios;
window.SoftwareIA = SoftwareIA;
window.Nosotros = Nosotros;
window.Hablemos = Hablemos;
window.Contacto = Contacto;
window.Casos = Casos;
