/* page-recursos.jsx — Blog hub + Article renderer
   Rutas:
   - /recursos          → RecursosHub (listing de articulos publicados + planificados)
   - /recursos/<slug>   → ResourceArticle (lectura individual)
*/

// Hook que se re-renderiza cuando articles.json llega via fetch async
function useArticles() {
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    if (window.ARTICLES_READY) return;
    const handler = () => forceUpdate(v => v + 1);
    window.addEventListener('articles-ready', handler);
    return () => window.removeEventListener('articles-ready', handler);
  }, []);
  return {
    articles: window.ARTICLES || [],
    planned: window.PLANNED_PILLARS || [],
    ready: window.ARTICLES_READY === true
  };
}

// Parser de markdown inline: **bold** + [text](url). Internal links se vuelven <a>
// con onClick para navegación SPA (sin reload); externos abren en nueva pestaña.
function parseInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2" data-spa="1">$1</a>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function RecursosHub({ navigate }) {
  const { articles, planned, ready } = useArticles();

  return (
    <>
      <section className="hero" data-screen-label="00 Recursos" style={{paddingBottom:48}}>
        <DarkCanvas density={0.8}/>
        <div className="hero-inner">
          <div className="hero-top">
            <span>Recursos</span>
            <span>Estudio digital · est. 2019</span>
            <span>Chile · USA · España · Colombia · Perú</span>
          </div>
          <h1 className="hero-headline" style={{maxWidth:'22ch'}}>
            Guías técnicas y análisis <span className="it">de marketing B2B real.</span>
          </h1>
        </div>
        <div className="hero-inner">
          <div className="hero-bottom" style={{gridTemplateColumns:'1fr', gap:0}}>
            <p className="lead" style={{maxWidth:'62ch'}}>
              Pillar pages, casos de estudio y benchmarks LATAM editados por consultores con +100 implementaciones reales. Sin slop, sin SEO games, sin "10 razones por las que".
            </p>
          </div>
        </div>
      </section>

      <section className="section tight" data-screen-label="01 Publicados">
        <div className="container">
          <Reveal>
            <div className="eyebrow mb-md">/ publicados</div>
          </Reveal>
          <div className="services">
            {articles.length === 0 ? (
              <p className="body" style={{opacity:0.6, marginTop:24}}>
                Primer artículo publicado próximamente. Suscríbete vía LinkedIn (link próximamente) para recibirlo.
              </p>
            ) : articles.map((a, i) => (
              <a href={`/recursos/${a.slug}`} key={a.slug}
                 onClick={(e)=>{e.preventDefault();navigate(`/recursos/${a.slug}`);}}
                 className="service-row">
                <span className="num">{String(i+1).padStart(2,'0')}</span>
                <h3 className="title">{a.title}</h3>
                <p className="desc">{a.description}</p>
                <span className="go">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {planned.length > 0 && (
        <section className="section dark tight" data-screen-label="02 Próximos">
          <div className="container">
            <Reveal>
              <div className="eyebrow mb-md" style={{opacity:0.55}}>/ próximos pillars</div>
              <h2 className="h2" style={{maxWidth:'22ch'}}>
                En desarrollo. <span className="it">Lanzando 2 por semana.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="process">
                {planned.map((p, i) => (
                  <div key={p.slug} className="process-step">
                    <span className="step-num">0{i+1}</span>
                    <div>
                      <h4>{p.title}</h4>
                      <p>{p.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split-title">
              <div className="eyebrow mb-md">/ ¿quieres recibirlos antes?</div>
              <h2 className="h2" style={{maxWidth:'20ch'}}>
                Hablemos sin <span className="it">compromiso.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="body-lg" style={{maxWidth:'48ch'}}>
                Si quieres aplicar este framework a tu empresa, agenda una reunión sin costo de 45 min. Auditamos tu setup actual y entregamos un plan accionable, encajemos o no.
              </p>
              <div style={{display:'flex', gap:14, flexWrap:'wrap', marginTop:32}}>
                <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('recursos-cta')} className="btn hoverable">
                  Cotizar por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
                </a>
                <a href="/hablemos"
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

function ResourceArticle({ navigate, slug }) {
  const { articles, ready } = useArticles();
  const article = articles.find(a => a.slug === slug);

  React.useEffect(() => {
    if (!article) return;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', article.description);
    document.title = `${article.title} | Recursos Intothecom`;
  }, [slug, article]);

  // Loading state mientras articles.json se descarga (fetch async)
  if (!ready) {
    return (
      <section className="section">
        <div className="container" style={{paddingTop:120, paddingBottom:120, textAlign:'center'}}>
          <div className="eyebrow mb-md">/ cargando</div>
          <p className="body" style={{opacity:0.5}}>Cargando recurso…</p>
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="section">
        <div className="container" style={{paddingTop:120, paddingBottom:120, textAlign:'center'}}>
          <div className="eyebrow mb-md">/ 404</div>
          <h1 className="h-display" style={{maxWidth:'18ch', margin:'0 auto'}}>Artículo no encontrado.</h1>
          <p className="body-lg" style={{maxWidth:'48ch', margin:'24px auto', opacity:0.6}}>
            El recurso que buscas no existe o aún no está publicado.
          </p>
          <a href="/recursos" onClick={(e)=>{e.preventDefault();navigate('/recursos');}} className="btn hoverable" style={{marginTop:24}}>
            Volver a recursos <span className="arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    );
  }

  return (
    <>
      <article className="article">
        {/* Article hero */}
        <section className="article-hero">
          <div className="container">
            <nav aria-label="Breadcrumb" className="article-breadcrumb">
              <a href="/" onClick={(e)=>{e.preventDefault();navigate('/');}}>Inicio</a>
              <span aria-hidden="true">·</span>
              <a href="/recursos" onClick={(e)=>{e.preventDefault();navigate('/recursos');}}>Recursos</a>
              <span aria-hidden="true">·</span>
              <span aria-current="page" style={{opacity:0.7}}>{article.category}</span>
            </nav>
            <div className="eyebrow mb-md">/ {article.category} · {article.readingTime} de lectura</div>
            <h1 className="article-h1" style={{maxWidth:'24ch'}}>{article.title}</h1>
            <p className="article-tldr">
              <strong>TL;DR.</strong> {article.tldr}
            </p>
            <div className="article-meta">
              <span><strong>{article.author}</strong> · {article.authorRole}</span>
              <span className="article-meta-sep">·</span>
              <span>Publicado {new Date(article.publishedAt).toLocaleDateString('es-CL', {year:'numeric',month:'long',day:'numeric'})}</span>
              {article.updatedAt !== article.publishedAt && (
                <>
                  <span className="article-meta-sep">·</span>
                  <span>Actualizado {new Date(article.updatedAt).toLocaleDateString('es-CL', {year:'numeric',month:'long',day:'numeric'})}</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Article body */}
        <section className="article-body">
          <div className="container">
            <div className="article-prose">
              {article.sections.map((s, i) => {
                if (s.type === 'h2') return <h2 key={i} id={s.id}>{s.text}</h2>;
                if (s.type === 'h3') return <h3 key={i} id={s.id}>{s.text}</h3>;
                if (s.type === 'p') return <p key={i} dangerouslySetInnerHTML={{__html: s.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}}/>;
                if (s.type === 'list') return (
                  <ul key={i}>
                    {s.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{__html: it.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}}/>)}
                  </ul>
                );
                if (s.type === 'table') return (
                  <div key={i} className="article-table-wrap">
                    <table className="article-table">
                      <thead>
                        <tr>{s.headers.map((h, j) => <th key={j}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {s.rows.map((row, j) => (
                          <tr key={j}>{row.map((cell, k) => <td key={k}>{cell}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
                if (s.type === 'cta') return (
                  <div key={i} style={{margin:'48px 0'}}>
                    <a href={waLink(s.waKey || 'default')} target="_blank" rel="noopener noreferrer"
                       onClick={onWaClick(`article-${article.slug}-cta`)} className="btn hoverable">
                      {s.text} <span className="arrow" aria-hidden="true">↗</span>
                    </a>
                  </div>
                );
                return null;
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        {article.faq && article.faq.length > 0 && (
          <section className="section">
            <div className="container">
              <Reveal>
                <div className="eyebrow mb-md">/ preguntas frecuentes</div>
                <h2 className="h2" style={{maxWidth:'22ch', marginBottom:32}}>
                  Lo que más nos <span className="it">preguntan.</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <Faq items={article.faq.map(qa => ({q: qa.q, a: qa.a}))}/>
              </Reveal>
            </div>
          </section>
        )}

        {/* Sources */}
        {article.sources && article.sources.length > 0 && (
          <section className="section tight">
            <div className="container">
              <Reveal>
                <div className="eyebrow mb-md">/ fuentes citadas</div>
                <h2 className="h3" style={{maxWidth:'22ch', marginBottom:24}}>
                  Investigación con <span className="it">fuentes verificables.</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <ol className="article-sources">
                  {article.sources.map((src, i) => (
                    <li key={i}>
                      <a href={src.url} target="_blank" rel="noopener noreferrer">{src.name}</a>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </section>
        )}

        {/* CTA final */}
        <section className="section dark">
          <div className="container">
            <div className="split">
              <Reveal className="split-title">
                <div className="eyebrow mb-md" style={{opacity:0.55}}>/ siguiente paso</div>
                <h2 className="h2" style={{maxWidth:'18ch'}}>
                  ¿Te aplica este caso a <span className="it">tu empresa?</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="body-lg" style={{maxWidth:'48ch'}}>
                  Auditamos tu setup actual y te entregamos un plan accionable en 45 minutos, sin costo. Si encajamos, seguimos. Si no, te sales con valor.
                </p>
                <div style={{display:'flex', gap:14, flexWrap:'wrap', marginTop:32}}>
                  <a href={waLink('default')} target="_blank" rel="noopener noreferrer"
                     onClick={onWaClick(`article-${article.slug}-bottom-cta`)} className="btn invert hoverable">
                    Cotizar por WhatsApp <span className="arrow" aria-hidden="true">↗</span>
                  </a>
                  <a href="/recursos"
                     onClick={(e)=>{e.preventDefault();navigate('/recursos');}}
                     className="btn ghost hoverable">
                    Más recursos <span className="arrow">↗</span>
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

window.RecursosHub = RecursosHub;
window.ResourceArticle = ResourceArticle;
