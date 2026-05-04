/* Page: HOME — v2 editorial */

const TESTIMONIALS = [
  { name: "Maria Jesús Silva", role: "Retail · Chile", quote: "Muy buenos profesionales, dedicados y con la mejor disposición para resolver problemas. 100% recomendados." },
  { name: "Nicolás Eguiguren", role: "B2B · USA", quote: "Excelente trabajo. Muy profesionales. Recomendados. Keep going and never sacrifice service." },
  { name: "Dominga Cortés-Monroy", role: "Fullcommerce", quote: "Atención personalizada y 24/7. Saben leer al cliente y al consumidor final, lo que hace mucho más efectiva la estrategia." },
  { name: "Clemente García", role: "E-commerce", quote: "Muy profesionales y constantemente apoyándonos, buscando nuevas soluciones a las cosas que se presentan en el día a día." },
  { name: "Alessandra Peppi", role: "B2B · Chile", quote: "Super buena coordinación y comunicación. Han trabajado con nosotros por más de un año y super buenos resultados." },
  { name: "Heidi Secher Santander", role: "Cliente · Chile", quote: "Muy amables, y son muy buenos en lo que hacen. 100% recomendado." },
  { name: "Anto Loyola", role: "Cliente · Chile", quote: "Muy atentos. Me ayudaron a todas horas y en todos mis requisitos. Una empresa muy humana y bien hecha." },
  { name: "Francisca Muñoz", role: "Cliente · Chile", quote: "Excelente servicio. Muy claro, transparente y con buenos resultados." },
];

function Home({ navigate }) {
  return (
    <>
      {/* HERO */}
      <section className="hero" data-screen-label="01 Home">
        <DarkCanvas density={1.2}/>
        <div className="hero-inner">
          <div className="hero-top">
            <span>Estudio digital · est. 2019</span>
            <span>Chile · Brasil · USA · España</span>
            <span>v.2026</span>
          </div>
          <h1 className="hero-headline">
            Marketing, software <span className="it">&amp;</span> <span className="it">inteligencia.</span>
          </h1>
          <div className="hero-cta-pair">
            <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('hero-home')} className="btn hoverable">
              Cotizar por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
            </a>
            <a href="#/servicios"
               onClick={(e)=>{e.preventDefault();navigate('/servicios');}}
               className="btn ghost hoverable">
              Ver servicios <span className="arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="hero-inner">
          <div className="hero-bottom">
            <p className="lead">
              Diseñamos estrategias, productos digitales y agentes de IA a medida para negocios que crecen en serio. Cinco años. <strong>+5M USD generados</strong> vía RRSS para nuestros clientes. Verificable.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num">+100</div>
                <div className="lbl">Negocios asesorados</div>
                <div className="lbl-sub">2019–2026 · CL/BR/US/ES</div>
              </div>
              <div className="hero-stat">
                <div className="num">+5M</div>
                <div className="lbl">USD generados vía RRSS</div>
                <div className="lbl-sub">verificable con clientes ref.</div>
              </div>
              <div className="hero-stat">
                <div className="num">−50%</div>
                <div className="lbl">CAC promedio</div>
                <div className="lbl-sub">vs. baseline pre-Intothecom</div>
              </div>
            </div>
          </div>
          <div className="hero-trust-strip">
            <div className="hero-trust-header">
              <span className="hero-trust-label">Confían en nosotros</span>
              <span className="hero-trust-count">+100 marcas asesoradas</span>
            </div>
            <div className="hero-trust-logos">
              {['equifax.svg','bullpadel.png','toke.png','granjamagdalena.png','parquetermalbotanico.svg','terrafirme.png'].map(f => (
                <img key={f} src={`assets/clients/${f}`} alt="" className="hero-trust-logo" loading="lazy"/>
              ))}
            </div>
            <a href="https://www.google.com/search?q=intothecom" target="_blank" rel="noopener noreferrer" className="hero-google-rating hoverable">
              <span className="hero-google-stars" aria-hidden="true">★★★★★</span>
              <span className="hero-google-score">5.0</span>
              <span className="hero-google-meta">17 reseñas en Google</span>
              <span className="hero-google-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee items={["marketing digital", "software a medida", "agentes de IA", "paid media", "email automation", "desarrollo web", "community", "data & analytics"]}/>

      {/* MEGA STATEMENT */}
      <section className="section" data-screen-label="02 Statement">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md">/ qué hacemos</div>
            <h2 className="h-display" style={{maxWidth:'20ch'}}>
              Construimos el motor digital de tu negocio. <span className="it">Pieza por pieza.</span>
            </h2>
          </Reveal>
        </div>
      </section>

      {/* CLIENTS MARQUEE */}
      <ClientsMarquee/>

      {/* SERVICES */}
      <section className="section tight" data-screen-label="03 Servicios">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md">/ servicios · 05</div>
          </Reveal>
          <div className="services">
            {[
              { num: "01", t: "Software & IA a medida", desc: "Agentes, automatizaciones y productos digitales construidos para tu operación.", path:"/software-ia" },
              { num: "02", t: "Paid Media", desc: "Campañas en Google, Meta, TikTok y LinkedIn con foco en ROAS y CAC.", path:"/paid-media" },
              { num: "03", t: "Email Marketing", desc: "Segmentación quirúrgica, automatizaciones y flows que convierten.", path:"/email-marketing" },
              { num: "04", t: "Desarrollo Web", desc: "Sitios y e-commerce headless, rápidos y diseñados para vender.", path:"/desarrollo-web" },
              { num: "05", t: "Community Management", desc: "Contenido con criterio editorial y comunidad real, no vanity metrics.", path:"/community-management" },
            ].map(s => (
              <a href={"#"+s.path} key={s.num}
                 onClick={(e)=>{e.preventDefault();navigate(s.path);}}
                 className="service-row">
                <span className="num">{s.num}</span>
                <h3 className="title">{s.t}</h3>
                <p className="desc">{s.desc}</p>
                <span className="go">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STATS dark */}
      <section className="section dark" data-screen-label="04 Stats">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md" style={{opacity:0.55}}>/ 5+ años en industria</div>
            <h2 className="h1 mb-lg" style={{maxWidth:'18ch'}}>
              Datos, <span className="it">no promesas.</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="stats">
              <div className="stat"><div className="num">+100</div><div className="lbl">Negocios asesorados</div></div>
              <div className="stat"><div className="num">+5M</div><div className="lbl">USD vendidos por RRSS</div></div>
              <div className="stat"><div className="num">+5</div><div className="lbl">Años en industria</div></div>
              <div className="stat"><div className="num">−50%</div><div className="lbl">CAC promedio</div></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* IA SPOTLIGHT */}
      <section className="section" data-screen-label="05 IA">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md">/ nuevo · 2026</div>
              <h2 className="h1">
                Software <span className="it">+ IA</span><br/>a medida.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="body-lg" style={{maxWidth:'48ch'}}>
                No vendemos &ldquo;suscripciones a IA&rdquo;. Construimos sistemas concretos para tu negocio: agentes de venta conversacionales, copilotos internos, automatizaciones que reemplazan tareas manuales, y dashboards de decisión.
              </p>
              <div className="tag-list mt-md">
                <span className="tag">Agentes conversacionales</span>
                <span className="tag">RAG sobre tu data</span>
                <span className="tag">Automatizaciones</span>
                <span className="tag">Dashboards</span>
                <span className="tag">Integraciones</span>
              </div>
              <button className="btn hoverable" style={{marginTop:32}}
                      onClick={()=>navigate('/software-ia')}>
                Ver capacidades <span className="arrow">↗</span>
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* GUARANTEES */}
      <section className="section tight" data-screen-label="05b Garantías">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md">/ garantías</div>
              <h2 className="h2" style={{maxWidth:'18ch'}}>
                Sin contratos eternos. <span className="it">Sin sorpresas.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="guarantee-list">
                {[
                  ['Primera reunión sin costo','45 min de auditoría aplicable a tu cuenta. Sales con valor incluso si no trabajamos juntos.'],
                  ['Mes a mes desde el mes 4','Compromiso solo durante onboarding. Después, te quedas si funciona.'],
                  ['Reportes con acceso directo','No editamos métricas. Te damos acceso a las plataformas y los dashboards.'],
                  ['Equipo senior nombrado','Sabes desde el día 1 quién ejecuta. Sin freelancers, sin tercerización.'],
                ].map((g,i)=>(
                  <div key={i} className="guarantee-item">
                    <span className="guarantee-num">+0{i+1}</span>
                    <div>
                      <div className="guarantee-title">{g[0]}</div>
                      <p className="guarantee-body">{g[1]}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('guarantees')} className="btn hoverable" style={{marginTop:32}}>
                Agendar primera reunión <span className="arrow" aria-hidden="true">↗</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section tight" data-screen-label="06 Testimonios">
        <div className="container">
          <Reveal>
            <div className="testi-header">
              <div>
                <div className="eyebrow mb-md">/ clientes</div>
                <h2 className="h1" style={{maxWidth:'18ch'}}>
                  Lo que dicen <span className="it">de nosotros.</span>
                </h2>
              </div>
              <a href="https://www.google.com/search?q=intothecom" target="_blank" rel="noopener noreferrer" className="google-badge hoverable">
                <div className="google-badge-stars" aria-hidden="true">★★★★★</div>
                <div className="google-badge-score">5.0 / 5</div>
                <div className="google-badge-meta">17 reseñas verificadas en Google</div>
                <div className="google-badge-cta">Ver todas <span aria-hidden="true">↗</span></div>
              </a>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="testi-grid">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="testi">
                  <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="testi-author">
                    <span className="testi-name">{t.name}</span>
                    <span className="testi-role">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" data-screen-label="06b FAQ">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md">/ preguntas frecuentes</div>
              <h2 className="h1" style={{maxWidth:'18ch'}}>
                Lo que <span className="it">siempre nos preguntan.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Faq items={[
                {q:'¿Cuánto demora ver resultados?', a:'Paid Media: 2–3 semanas. Email: primer flow en vivo en 30 días. Web: 6–12 semanas. Software & IA: prototipo funcional en 3 semanas.'},
                {q:'¿Trabajan con retainer mensual o por proyecto?', a:'Ambos. Servicios continuos (paid, email, community) son retainer 3 meses mín. Web y software son fixed-scope con hito de pago.'},
                {q:'¿Trabajan con clientes fuera de Chile?', a:'60% de nuestros clientes opera en mercados externos. Reuniones por Meet, contratos en USD o moneda local, facturamos como prestador en CL/ES.'},
                {q:'¿Tienen exclusividad por industria?', a:'Sí. Una marca por categoría dentro de un mismo mercado. Pregúntanos por la tuya — si está libre, te avisamos.'},
                {q:'¿Qué pasa si no veo resultados?', a:'Mes 1 es onboarding. Si al mes 3 no se cumplieron los KPIs acordados por escrito, devolvemos el último mes o ajustamos scope sin costo.'},
                {q:'¿Quién ejecuta mi cuenta?', a:'Un lead senior + especialista. No tercerizamos a freelancers. La persona que vende es la persona que ejecuta.'},
              ]}/>
            </Reveal>
          </div>
        </div>
      </section>

      {/* MARKETS */}
      <section className="section dark tight" data-screen-label="07 Mercados">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md" style={{opacity:0.55}}>/ donde operamos</div>
              <h2 className="h2">Cuatro mercados,<br/><span className="it">una misma forma</span> de pensar.</h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="markets-grid">
                {[
                  ["—01","Chile","Santiago HQ","Desde 2019"],
                  ["—02","Brasil","São Paulo","Desde 2022"],
                  ["—03","USA","Miami","Desde 2023"],
                  ["—04","España","Madrid","Desde 2024"],
                ].map(m => (
                  <div key={m[1]} className="market-cell">
                    <div className="market-num">{m[0]}</div>
                    <div className="market-name">{m[1]}</div>
                    <div className="market-city">{m[2]}</div>
                    <div className="market-since">{m[3]}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
window.Home = Home;
