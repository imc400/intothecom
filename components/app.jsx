/* App entry — mounted in index.html.
   Routing, route-meta and Pixel page-tracking lives here. */

const ROUTE_META = {
  '/': {
    title: 'Intothecom · Marketing, software & IA para crecer en serio',
    description: 'Estudio digital con +100 negocios asesorados. Paid media, email, web, community y agentes de IA a medida. Chile, USA, España, Colombia, Perú.'
  },
  '/servicios': {
    title: 'Servicios · Marketing digital, software e IA | Intothecom',
    description: '5 servicios integrados: paid media, email marketing, desarrollo web, community y software & IA. Diseñados para escalar tu negocio con datos.'
  },
  '/software-ia': {
    title: 'Software & IA a medida · Agentes y automatizaciones | Intothecom',
    description: 'Construimos agentes conversacionales, copilotos internos, RAG sobre tu data y dashboards de decisión. De idea a producción en 6 semanas.'
  },
  '/paid-media': {
    title: 'Paid Media · Google, Meta, TikTok y LinkedIn | Intothecom',
    description: 'Campañas con foco en ROAS y CAC. Tracking server-side, creatividades A/B y reportes con decisiones. Escalamos lo que funciona, no impresiones.'
  },
  '/email-marketing': {
    title: 'Email Marketing · Klaviyo, HubSpot y flows que venden | Intothecom',
    description: 'Email marketing con segmentación quirúrgica, automatizaciones y A/B test continuo. Convierte 4–6× más que social. Tu canal más rentable.'
  },
  '/desarrollo-web': {
    title: 'Diseño y Desarrollo Web · Next.js y Shopify Headless | Intothecom',
    description: 'Sitios y e-commerce con Lighthouse 90+, SEO técnico y CMS editable por tu equipo. UI/UX y código bajo el mismo techo, listos para vender.'
  },
  '/community-management': {
    title: 'Community Management · Contenido editorial y comunidad real | Intothecom',
    description: 'Línea editorial documentada, producción mensual de foto y video, gestión de DMs y crisis. Comunidad que compra, no vanity metrics.'
  },
  '/nosotros': {
    title: 'Nosotros · Estudio digital desde 2019 | Intothecom',
    description: '+5 años, +100 negocios y 4 mercados. Una agencia con obsesión por los datos: si no se puede medir, no lo hacemos. Equipo senior dedicado.'
  },
  '/hablemos': {
    title: 'Hablemos · Cotiza tu proyecto en menos de 1 hora | Intothecom',
    description: 'Escríbenos por WhatsApp o brief. Respuesta < 1h hábil. Primera reunión sin costo de 45 min con auditoría aplicable. Lun–Vie 9–19 SCL.'
  },
  '/contacto': {
    title: 'Contacto · Oficina, WhatsApp, email | Intothecom',
    description: 'Almirante Pastene 333, of. 402, Providencia, Santiago. WhatsApp +56 9 7414 3642 · info@intothecom.com · ignacio@intothecom.com.'
  },
  '/casos': {
    title: 'Casos de éxito · Resultados verificables | Intothecom',
    description: 'Casos seleccionados con métricas reales. Equifax, Bullpadel, Imanix y +100 marcas. Cuando los datos hablan, la propuesta sobra.'
  },
  '/recursos': {
    title: 'Recursos · Guías técnicas de marketing B2B LATAM | Intothecom',
    description: 'Pillar pages, casos de estudio y benchmarks de marketing digital B2B, GEO, AEO, paid media, email automation y desarrollo web. Editados por consultores con +100 implementaciones reales.'
  }
};

const { useState: _useState, useEffect: _useEffect } = React;

/* Migración hash router → History API (mayo 2026).
   Razones: con hash, Google solo indexa el home. Con History API + Vercel SPA rewrites,
   cada ruta es indexable independientemente.
   Backward compat: si llegan con #/ruta legado, los redirigimos a /ruta. */

function App() {
  const getInitialRoute = () => {
    // Si llega con hash legado #/ruta → migrar a pathname
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const legacyRoute = window.location.hash.replace('#','');
      window.history.replaceState({}, '', legacyRoute);
      return legacyRoute;
    }
    return window.location.pathname || '/';
  };

  const [route, setRoute] = _useState(getInitialRoute());
  const [transitioning, setTransitioning] = _useState(false);

  _useEffect(() => {
    const onPopState = () => {
      setTransitioning(true);
      setTimeout(() => {
        const newRoute = window.location.pathname || '/';
        setRoute(newRoute);
        window.scrollTo(0, 0);
        if (window.fbqTrack) window.fbqTrack('PageView', { route: newRoute });
        setTimeout(() => setTransitioning(false), 50);
      }, 480);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  _useEffect(() => {
    /* NO sobreescribir title/meta para rutas /recursos/<slug>:
       ResourceArticle se encarga de actualizar title/desc segun el articulo.
       Si App lo sobreescribe aqui despues que el child lo seteo, el title flickea. */
    const isArticleRoute = route.startsWith('/recursos/') && route !== '/recursos';
    if (isArticleRoute) {
      /* Solo actualizar canonical + og:url segun la ruta (esos no varian por articulo) */
      const url = `https://www.intothecom.com${route}`;
      const setMeta = (sel, attr, value) => {
        const el = document.querySelector(sel);
        if (el) el.setAttribute(attr, value);
      };
      setMeta('meta[property="og:url"]', 'content', url);
      setMeta('link[rel="canonical"]', 'href', url);
    } else {
      const meta = ROUTE_META[route] || ROUTE_META['/'];
      document.title = meta.title;
      const setMeta = (sel, attr, value) => {
        const el = document.querySelector(sel);
        if (el) el.setAttribute(attr, value);
      };
      setMeta('meta[name="description"]', 'content', meta.description);
      setMeta('meta[property="og:title"]', 'content', meta.title);
      setMeta('meta[property="og:description"]', 'content', meta.description);
      const url = `https://www.intothecom.com${route === '/' ? '/' : route}`;
      setMeta('meta[property="og:url"]', 'content', url);
      setMeta('link[rel="canonical"]', 'href', url);
      setMeta('meta[name="twitter:title"]', 'content', meta.title);
      setMeta('meta[name="twitter:description"]', 'content', meta.description);
    }

    /* Update BreadcrumbList schema dinámicamente según ruta */
    const bcEl = document.getElementById('ld-breadcrumb');
    if (bcEl) {
      const crumbs = [{name: 'Inicio', path: '/'}];
      if (route !== '/') {
        const ROUTE_LABELS = {
          '/servicios': 'Servicios',
          '/software-ia': 'Software & IA',
          '/paid-media': 'Paid Media',
          '/email-marketing': 'Email Marketing',
          '/desarrollo-web': 'Desarrollo Web',
          '/community-management': 'Community Management',
          '/nosotros': 'Nosotros',
          '/casos': 'Casos de éxito',
          '/hablemos': 'Hablemos',
          '/contacto': 'Contacto',
          '/recursos': 'Recursos'
        };
        const label = ROUTE_LABELS[route] || route.replace('/','').replace(/-/g,' ');
        // Si es un servicio detalle, agregar Servicios como nivel intermedio
        if (['/software-ia','/paid-media','/email-marketing','/desarrollo-web','/community-management'].includes(route)) {
          crumbs.push({name: 'Servicios', path: '/servicios'});
        }
        crumbs.push({name: label, path: route});
      }
      bcEl.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": crumbs.map((c, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": c.name,
          "item": `https://www.intothecom.com${c.path === '/' ? '/' : c.path}`
        }))
      });
    }
  }, [route]);

  _useEffect(() => {
    const boot = document.getElementById('boot');
    if (boot) {
      boot.classList.add('gone');
      setTimeout(() => boot.remove(), 500);
    }
  }, []);

  const navigate = (path) => {
    if (path === route) return;
    window.history.pushState({}, '', path);
    setTransitioning(true);
    setTimeout(() => {
      setRoute(path);
      window.scrollTo(0, 0);
      if (window.fbqTrack) window.fbqTrack('PageView', { route: path });
      setTimeout(() => setTransitioning(false), 50);
    }, 480);
  };

  const currentNav = (() => {
    if (route === '/') return 'home';
    if (route === '/software-ia') return 'software-ia';
    if (route === '/nosotros') return 'nosotros';
    if (route === '/contacto') return 'contacto';
    if (route === '/servicios' || SERVICE_DATA[route.replace('/','')]) return 'servicios';
    return '';
  })();

  let page;
  if (route === '/') page = <Home navigate={navigate}/>;
  else if (route === '/software-ia') page = <SoftwareIA navigate={navigate}/>;
  else if (route === '/nosotros') page = <Nosotros navigate={navigate}/>;
  else if (route === '/hablemos') page = <Hablemos navigate={navigate}/>;
  else if (route === '/contacto') page = <Contacto navigate={navigate}/>;
  else if (route === '/casos') page = <Casos navigate={navigate}/>;
  else if (route === '/servicios') page = <Servicios navigate={navigate}/>;
  else if (route === '/recursos') page = <RecursosHub navigate={navigate}/>;
  else if (route.startsWith('/recursos/')) {
    const slug = route.replace('/recursos/', '');
    page = <ResourceArticle navigate={navigate} slug={slug}/>;
  }
  else if (SERVICE_DATA[route.replace('/','')]) {
    page = <ServicePage navigate={navigate} data={SERVICE_DATA[route.replace('/','')]}/>;
  } else page = <Home navigate={navigate}/>;

  const waKey = (() => {
    const r = route.replace('/','');
    if (['paid-media','email-marketing','desarrollo-web','community-management','software-ia'].includes(r)) return r;
    return 'default';
  })();

  return (
    <>
      <Ambient/>
      <Cursor/>
      <StatusBar/>
      <Nav currentNav={currentNav} navigate={navigate}/>
      <main id="main" tabIndex="-1">{page}</main>
      <Footer navigate={navigate}/>
      <FloatingWhatsApp serviceKey={waKey}/>
      <div className={`page-transition ${transitioning ? 'in' : 'out'}`}></div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
