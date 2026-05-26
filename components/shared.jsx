/* shared components — v3 */
const { useState, useEffect, useRef } = React;

/* === WhatsApp config — single source of truth === */
const WA_NUMBER = "56974143642";
const WA_MESSAGES = {
  default: "Hola Intothecom, vi su sitio y me gustaría conversar sobre un proyecto para mi empresa. ¿Tienen disponibilidad esta semana?",
  'paid-media': "Hola, vengo de la página de Paid Media. Estoy invirtiendo en anuncios y quiero revisar mi ROAS. ¿Pueden auditar mi cuenta?",
  'email-marketing': "Hola, llegué desde la página de Email Marketing. Quiero mejorar mis flows de conversión. ¿Cómo empezamos?",
  'desarrollo-web': "Hola, vi su sección de Desarrollo Web. Estoy evaluando rehacer mi sitio o lanzar e-commerce. ¿Pueden enviarme una propuesta?",
  'community-management': "Hola, vengo desde Community Management. Quiero levantar la marca en redes con criterio editorial. ¿Cómo trabajamos?",
  'software-ia': "Hola, vengo desde la página de Software & IA. Tenemos un proceso interno que queremos automatizar con un agente. ¿Pueden agendar una llamada de discovery?",
};
const waLink = (key = 'default') => {
  const msg = WA_MESSAGES[key] || WA_MESSAGES.default;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
};
const trackWhatsAppClick = (source = 'unknown') => {
  if (window.fbqTrack) window.fbqTrack('Contact', { method: 'whatsapp', source });
  if (window.fbqTrackCustom) window.fbqTrackCustom('WhatsAppClick', { source });
  // Google Ads conversion: WhatsApp Click (secundaria — no se usa para optimizar pujas,
  // solo se registra como dato observacional bajo "Contacto" en AW-16641850844)
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: 'AW-16641850844/I5_ZCMH05bMcENz7uf89',
      value: 1000.0,
      currency: 'CLP',
    });
  }
};
const onWaClick = (source) => () => trackWhatsAppClick(source);
window.waLink = waLink;
window.trackWhatsAppClick = trackWhatsAppClick;
window.onWaClick = onWaClick;
window.WA_NUMBER_DISPLAY = "+56 9 7414 3642";
window.WA_NUMBER_RAW = "+56974143642";
window.OFFICE_ADDRESS = "Almirante Pastene 333, oficina 402, Providencia, Santiago, Chile";
window.CONTACT_EMAILS = ["info@intothecom.com", "ignacio@intothecom.com"];

// Detecta touch / mobile / reduced-motion para no montar canvases ni RAF en device sin cursor
function shouldSkipMotion() {
  if (typeof window === 'undefined') return true;
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints > 0);
  return isMobile || isTouch;
}
function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    // Fix Agent5 #3: en mobile/touch el cursor custom no se ve (CSS lo oculta) pero el JS+RAF seguía
    // corriendo gastando INP. Ahora no montamos listeners ni RAF en mobile/touch.
    if (shouldSkipMotion()) return;
    const el = ref.current;
    if (!el) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf;
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    const onOver = (e) => {
      const t = e.target;
      if (t.closest && t.closest("a, button, input, textarea, select, .hoverable")) {
        el.classList.add("is-hover");
      } else {
        el.classList.remove("is-hover");
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);
  return <div className="cursor" ref={ref}></div>;
}

/* === Persistent ambient canvas — running in background of whole site === */
function Ambient() {
  const ref = useRef(null);
  useEffect(() => {
    // Fix Agent5 #3: skip canvas si prefers-reduced-motion para mejorar INP
    if (prefersReducedMotion()) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    window.addEventListener("resize", resize);

    let mx = w/2, my = h/2;
    let tmx = mx, tmy = my;
    const onMove = (e) => { tmx = e.clientX; tmy = e.clientY; };
    window.addEventListener("mousemove", onMove, { passive: true });

    // Sample subtle blobs distributed in low frequency
    const N = 5;
    const blobs = Array.from({length: N}, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random()-0.5) * 0.0004,
      vy: (Math.random()-0.5) * 0.0004,
      r: 0.35 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      t += 0.0035;
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;

      // Read CSS to detect dark mode (body has page-dark class on dark sections? we use full canvas always behind paper bg)
      // Background fill paper
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#ededea";
      ctx.fillRect(0,0,w,h);

      // Render organic gray blobs - very subtle so paper still reads paper
      ctx.globalCompositeOperation = "multiply";
      for (const b of blobs) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < -0.3 || b.x > 1.3) b.vx *= -1;
        if (b.y < -0.3 || b.y > 1.3) b.vy *= -1;
        const cx = (b.x + Math.sin(t + b.phase) * 0.05) * w;
        const cy = (b.y + Math.cos(t * 0.8 + b.phase) * 0.05) * h;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, "rgba(190, 188, 180, 1)");
        g.addColorStop(0.4, "rgba(220, 217, 209, 1)");
        g.addColorStop(1, "rgba(255, 255, 255, 1)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouse light - subtle
      ctx.globalCompositeOperation = "multiply";
      const mr = Math.max(w,h) * 0.4;
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
      mg.addColorStop(0, "rgba(250, 248, 242, 1)");
      mg.addColorStop(1, "rgba(220, 217, 209, 1)");
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();

      // Grain
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      for (let i=0; i<60; i++) {
        ctx.fillRect(Math.random()*w, Math.random()*h, 1, 1);
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);
  return <div className="ambient"><canvas ref={ref}></canvas></div>;
}

/* === Dark hero canvas (organic, used inside .hero / .svc-hero) === */
function DarkCanvas({ density = 1.0 }) {
  const ref = useRef(null);
  useEffect(() => {
    // Fix Agent5 #3: respetar reduced-motion
    if (prefersReducedMotion()) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    window.addEventListener("resize", resize);

    let mx = w/2, my = h/2, tmx = mx, tmy = my;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      tmx = e.clientX - r.left; tmy = e.clientY - r.top;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const N = Math.floor(7 * density);
    const blobs = Array.from({length:N}, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random()-0.5) * 0.0006,
      vy: (Math.random()-0.5) * 0.0006,
      r: 0.22 + Math.random() * 0.26,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      t += 0.005;
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0,0,w,h);

      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < -0.3 || b.x > 1.3) b.vx *= -1;
        if (b.y < -0.3 || b.y > 1.3) b.vy *= -1;
        const cx = (b.x + Math.sin(t + b.phase) * 0.06) * w;
        const cy = (b.y + Math.cos(t * 0.8 + b.phase) * 0.06) * h;
        const r = b.r * Math.min(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, "rgba(70, 70, 70, 0.55)");
        g.addColorStop(0.45, "rgba(35, 35, 35, 0.25)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouse light
      const mr = Math.min(w,h) * 0.4;
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
      mg.addColorStop(0, "rgba(237, 237, 234, 0.18)");
      mg.addColorStop(1, "rgba(237,237,234,0)");
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(237,237,234,0.04)";
      for (let i=0; i<70; i++) ctx.fillRect(Math.random()*w, Math.random()*h, 1, 1);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [density]);
  return <canvas ref={ref}></canvas>;
}

function StatusBar() {
  const [time, setTime] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const sclOpts = { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago', hour12: false };
      setTime(d.toLocaleTimeString('en-GB', sclOpts));
      const sclHour = parseInt(d.toLocaleTimeString('en-GB', { hour: '2-digit', timeZone: 'America/Santiago', hour12: false }), 10);
      const sclDay = new Date(d.toLocaleString('en-US', { timeZone: 'America/Santiago' })).getDay();
      const weekday = sclDay >= 1 && sclDay <= 5;
      const inHours = sclHour >= 9 && sclHour < 19;
      setIsOpen(weekday && inHours);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="status-bar">
      <span className={`status-dot ${isOpen ? 'on' : 'off'}`}></span>
      <span className="status-label">{isOpen ? 'En línea ahora' : 'Fuera de horario'}</span>
      <span className="status-sep">·</span>
      <span className="status-meta">Respondemos &lt; 1h hábil</span>
      <span className="status-sep status-hide-sm">·</span>
      <span className="status-meta status-hide-sm">Lun–Vie 9:00–19:00 SCL · {time}</span>
    </div>
  );
}

// Estructura del dropdown Recursos: categorías + top picks (orden por intent comercial)
const RECURSOS_GROUPS = [
  { title: 'Estrategia & Growth', items: [
    { slug: 'marketing-digital-b2b-latam-2026', label: 'Marketing digital B2B LATAM' },
    { slug: 'funnel-aarrr-pirate-b2b-latam-2026', label: 'Funnel AARRR para B2B' },
    { slug: 'buyer-personas-b2b-chile-2026', label: 'Buyer personas B2B Chile' }
  ]},
  { title: 'Tech & IA', items: [
    { slug: 'crm-b2b-que-es-como-elegir-2026', label: 'CRM B2B: cómo elegir' },
    { slug: 'agentes-ia-para-empresas-2026', label: 'Asistente IA para empresas' },
    { slug: 'asistente-ia-atencion-cliente-2026', label: 'Asistente IA atención al cliente' },
    { slug: 'tech-stack-minimo-growth-b2b-latam-2026', label: 'Tech stack mínimo growth' },
    { slug: 'desarrollo-web-headless-nextjs-shopify-2026', label: 'Desarrollo web headless Next.js' }
  ]},
  { title: 'Canales', items: [
    { slug: 'paid-media-b2b-2026', label: 'Paid Media B2B 2026' },
    { slug: 'klaviyo-hubspot-email-automation-2026', label: 'Email automation Klaviyo/HubSpot' },
    { slug: 'community-management-b2b-2026', label: 'Community Management B2B' }
  ]},
  { title: 'Industria', items: [
    { slug: 'kick-off-proyecto-guia-completa-2026', label: 'Kick off meeting B2B' },
    { slug: 'ranking-agencias-marketing-digital-b2b-chile-2026', label: 'Ranking agencias B2B Chile' }
  ]}
];

function RecursosDropdown({ navigate, currentNav }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const closeTimerRef = useRef(null);

  const handleEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  };

  // Delay de 220ms antes de cerrar — tolera micro-gaps del mouse cuando el usuario
  // navega del trigger "Recursos" al contenido del menú, evita cierres por accidente.
  const handleLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  // Limpieza del timer al desmontar
  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const isActive = currentNav === 'recursos';

  return (
    <span className="nav-dropdown-wrap" ref={wrapRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <a
        href="/recursos"
        aria-haspopup="true"
        aria-expanded={open}
        aria-current={isActive ? 'page' : undefined}
        className={`nav-dropdown-trigger ${isActive ? 'active' : ''}`}
        onClick={(e)=>{e.preventDefault(); navigate('/recursos');}}
        onFocus={handleEnter}
      >
        Recursos <span className="nav-dropdown-chev" aria-hidden="true">▾</span>
      </a>
      {open && (
        <div className="nav-dropdown-menu" role="menu">
          <div className="nav-dropdown-grid">
            {RECURSOS_GROUPS.map(group => (
              <div key={group.title} className="nav-dropdown-col">
                <div className="nav-dropdown-coltitle">{group.title}</div>
                <ul className="nav-dropdown-collist">
                  {group.items.map(it => (
                    <li key={it.slug}>
                      <a
                        href={`/recursos/${it.slug}`}
                        onClick={(e)=>{e.preventDefault(); setOpen(false); navigate(`/recursos/${it.slug}`);}}
                        role="menuitem"
                      >{it.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="nav-dropdown-foot">
            <a
              href="/recursos"
              onClick={(e)=>{e.preventDefault(); setOpen(false); navigate('/recursos');}}
            >Ver todos los recursos →</a>
          </div>
        </div>
      )}
    </span>
  );
}

function MobileMenu({ navigate, currentNav, open, onClose }) {
  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  const go = (path) => (e) => { e.preventDefault(); onClose(); navigate(path); };

  return (
    <>
      <div
        className={`mobile-menu-backdrop ${open ? 'in' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`mobile-menu ${open ? 'in' : ''}`}
        aria-hidden={!open}
        aria-label="Menú móvil"
        role="dialog"
      >
        <div className="mobile-menu-head">
          <span className="mobile-menu-eyebrow">/ menú</span>
          <button
            type="button"
            className="mobile-menu-close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6 L18 18 M6 18 L18 6"/>
            </svg>
          </button>
        </div>

        <nav className="mobile-menu-nav" aria-label="Principal móvil">
          <a href="/" className={currentNav==='home'?'active':''} onClick={go('/')}>Inicio</a>
          <a href="/servicios" className={currentNav==='servicios'?'active':''} onClick={go('/servicios')}>Servicios</a>
          <a href="/software-ia" className={currentNav==='software-ia'?'active':''} onClick={go('/software-ia')}>IA &amp; Software</a>
          <a href="/recursos" className={currentNav==='recursos'?'active':''} onClick={go('/recursos')}>Recursos</a>
          <a href="/nosotros" className={currentNav==='nosotros'?'active':''} onClick={go('/nosotros')}>Estudio</a>
          <a href="/contacto" className={currentNav==='contacto'?'active':''} onClick={go('/contacto')}>Contacto</a>
        </nav>

        <div className="mobile-menu-groups">
          <div className="mobile-menu-eyebrow">/ recursos por categoría</div>
          {RECURSOS_GROUPS.map(group => (
            <div key={group.title} className="mobile-menu-group">
              <div className="mobile-menu-group-title">{group.title}</div>
              <ul>
                {group.items.map(it => (
                  <li key={it.slug}>
                    <a
                      href={`/recursos/${it.slug}`}
                      onClick={go(`/recursos/${it.slug}`)}
                    >{it.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mobile-menu-cta">
          <a
            href={waLink('default')}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-menu-wa"
            onClick={(e) => { onClose(); onWaClick('mobile-menu')(e); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
            </svg>
            <span>Cotizar por WhatsApp</span>
          </a>
        </div>
      </aside>
    </>
  );
}

function Nav({ navigate, currentNav }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cerrar el drawer si la ruta cambia (por nav programática externa)
  useEffect(() => { setMobileOpen(false); }, [currentNav]);

  return (
    <>
      <nav className="nav" aria-label="Principal">
        <a href="/" className="nav-logo" onClick={(e)=>{e.preventDefault();navigate('/');}}>
          <span className="mark"><img src="assets/mark-white.png" alt="" aria-hidden="true"/></span>
          <span>Intothecom</span>
        </a>
        <div className="nav-links">
          <a href="/" aria-current={currentNav==='home'?'page':undefined} className={currentNav==='home'?'active':''} onClick={(e)=>{e.preventDefault();navigate('/');}}>Inicio</a>
          <a href="/servicios" aria-current={currentNav==='servicios'?'page':undefined} className={currentNav==='servicios'?'active':''} onClick={(e)=>{e.preventDefault();navigate('/servicios');}}>Servicios</a>
          <a href="/software-ia" aria-current={currentNav==='software-ia'?'page':undefined} className={currentNav==='software-ia'?'active':''} onClick={(e)=>{e.preventDefault();navigate('/software-ia');}}>IA & Software</a>
          <RecursosDropdown navigate={navigate} currentNav={currentNav} />
          <a href="/nosotros" aria-current={currentNav==='nosotros'?'page':undefined} className={currentNav==='nosotros'?'active':''} onClick={(e)=>{e.preventDefault();navigate('/nosotros');}}>Estudio</a>
          <a href="/contacto" aria-current={currentNav==='contacto'?'page':undefined} className={currentNav==='contacto'?'active':''} onClick={(e)=>{e.preventDefault();navigate('/contacto');}}>Contacto</a>
        </div>
        <div className="nav-right">
          <a href={waLink('default')} target="_blank" rel="noopener noreferrer" className="nav-cta hoverable" onClick={onWaClick('nav')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{display:'inline-block', verticalAlign:'middle'}}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
            </svg>
            <span>Cotizar por WhatsApp</span>
          </a>
          <button
            type="button"
            className="nav-burger"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>
      </nav>
      <MobileMenu
        navigate={navigate}
        currentNav={currentNav}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Arm the animation only after first paint, so initial state actually paints
    let raf1, raf2, fallback, obs;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const inView = r.top < vh * 0.95 && r.bottom > 0;
        setArmed(true);
        if (inView) {
          // Tiny delay so the .will-animate (opacity 0) state paints first
          requestAnimationFrame(() => requestAnimationFrame(() => setSeen(true)));
        } else if (typeof IntersectionObserver !== "undefined") {
          obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { setSeen(true); obs.unobserve(el); } });
          }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" });
          obs.observe(el);
          fallback = setTimeout(() => setSeen(true), 2000);
        } else {
          setSeen(true);
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1); cancelAnimationFrame(raf2);
      if (obs) obs.disconnect();
      if (fallback) clearTimeout(fallback);
    };
  }, []);
  return (
    <div ref={ref}
         className={`reveal ${armed && !seen ? "will-animate" : ""} ${seen ? "in" : ""} ${className}`}
         style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Marquee({ items, dark }) {
  return (
    <div className={`marquee ${dark ? "dark" : ""}`}>
      <div className="marquee-track">
        <span>
          {items.map((i, idx) => (
            <React.Fragment key={idx}>
              <span className="it">{i}</span>
              <span className="dot"></span>
            </React.Fragment>
          ))}
        </span>
        <span aria-hidden="true">
          {items.map((i, idx) => (
            <React.Fragment key={"b"+idx}>
              <span className="it">{i}</span>
              <span className="dot"></span>
            </React.Fragment>
          ))}
        </span>
      </div>
    </div>
  );
}

function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-mega">
          ¿Hablamos<span className="it">?</span>
        </div>
      </div>
      <div className="footer-grid container">
        <div className="footer-col">
          <img src="assets/logo-white.png" alt="Intothecom" className="footer-logo"/>
          <p className="body" style={{opacity:0.7, maxWidth:'34ch'}}>
            Marketing digital, desarrollo de software & inteligencia artificial a medida. Operamos en Chile, USA, España, Colombia y Perú.
          </p>
        </div>
        <div className="footer-col">
          <h4>/ Servicios</h4>
          <a href="/paid-media" onClick={(e)=>{e.preventDefault();navigate('/paid-media');}}>Paid Media</a>
          <a href="/email-marketing" onClick={(e)=>{e.preventDefault();navigate('/email-marketing');}}>Email Marketing</a>
          <a href="/desarrollo-web" onClick={(e)=>{e.preventDefault();navigate('/desarrollo-web');}}>Desarrollo Web</a>
          <a href="/community-management" onClick={(e)=>{e.preventDefault();navigate('/community-management');}}>Community</a>
          <a href="/software-ia" onClick={(e)=>{e.preventDefault();navigate('/software-ia');}}>Software & IA</a>
        </div>
        <div className="footer-col">
          <h4>/ Estudio</h4>
          <a href="/nosotros" onClick={(e)=>{e.preventDefault();navigate('/nosotros');}}>Sobre nosotros</a>
          <a href="/casos" onClick={(e)=>{e.preventDefault();navigate('/casos');}}>Casos de éxito</a>
          <a href="/contacto" onClick={(e)=>{e.preventDefault();navigate('/contacto');}}>Contacto</a>
          <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('footer-secondary')}>Cotizar por WhatsApp</a>
        </div>
        <div className="footer-col">
          <h4>/ Contacto</h4>
          <a href="/contacto" onClick={(e)=>{e.preventDefault();navigate('/contacto');}}>Almirante Pastene 333, of. 402<br/>Providencia · Santiago, CL</a>
          <a href="mailto:info@intothecom.com">info@intothecom.com</a>
          <a href="mailto:ignacio@intothecom.com">ignacio@intothecom.com</a>
          <a href={waLink('default')} target="_blank" rel="noopener noreferrer" onClick={onWaClick('footer')}>WhatsApp +56 9 7414 3642</a>
          <a href="https://www.instagram.com/intothecom_/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© 2026 Intothecom · todos los derechos reservados</span>
        <span>Santiago · Miami · Madrid · Bogotá · Lima</span>
      </div>
    </footer>
  );
}

const CLIENTS = [
  { name: 'Equifax', file: 'equifax.svg', url: 'https://sec.equifax.cl' },
  { name: 'Bullpadel', file: 'bullpadel.png', url: 'https://bullpadel.cl' },
  { name: 'Granja Magdalena', file: 'granjamagdalena.png', url: 'https://granjamagdalena.cl' },
  { name: 'Toke', file: 'toke.png', url: 'https://toke.cl' },
  { name: 'Rebels Golf', file: 'rebelsgolf.jpg', url: 'https://rebelsgolf.cl' },
  { name: 'Imanix', file: 'imanix.png', url: 'https://imanix.cl' },
  { name: 'Spot Essence', file: 'spotessence.png', url: 'https://spotessence.cl' },
  { name: 'B Wild', file: 'bwild.png', url: 'https://bwild.cl' },
  { name: 'CJM Digitales', file: 'cjmdigitales.png', url: 'https://cjmdigitales.cl' },
  { name: 'Cocolia', file: 'cocolia.png', url: 'https://cocolia.cl' },
  { name: 'Chile Frutos Secos', file: 'chilefrutossecos.png', url: 'https://chilefrutossecos.cl' },
  { name: 'Dentobal', file: 'dentobal.webp', url: 'https://dentobal.cl' },
  { name: 'Tu Macho Alfa', file: 'tumachoalfa.png', url: 'https://tumachoalfa.cl' },
  { name: 'Terra Firme', file: 'terrafirme.png', url: 'https://terrafirme.cl' },
  { name: 'Proyecta Inmobiliaria', file: 'proyectainmobiliaria.png', url: 'https://proyectainmobiliaria.cl' },
  { name: 'Inmobiliaria HCG', file: 'inmobiliariahcg.png', url: 'https://inmobiliariahcg.cl' },
  { name: 'CIPO', file: 'cipo.png', url: 'https://cipo.cl' },
  { name: 'Parque Termal Botánico', file: 'parquetermalbotanico.svg', url: 'https://parquetermalbotanico.cl' },
  { name: 'Lucrecia Franzoy', file: 'lucreciafranzoy.svg', url: 'https://lucreciafranzoy.cl' },
];

function ClientsMarquee() {
  const mid = Math.ceil(CLIENTS.length / 2);
  const half1 = CLIENTS.slice(0, mid);
  const half2 = CLIENTS.slice(mid);

  const renderRow = (items, reverse) => (
    <div className={`clients-track ${reverse ? 'reverse' : ''}`}>
      <div className="clients-track-inner">
        {[...items, ...items].map((c, i) => (
          <a
            key={i}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="client-link hoverable"
            aria-label={`Visitar sitio de ${c.name}`}
          >
            <img
              src={`assets/clients/${c.file}`}
              alt={c.name}
              className="client-logo"
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <section className="clients" data-screen-label="Clientes">
      <div className="clients-header">
        <div>
          <div className="eyebrow mb-md">/ confían en nosotros</div>
          <h2 className="h2" style={{maxWidth:'22ch'}}>
            Trabajamos con marcas que <span className="it">crecen en serio.</span>
          </h2>
        </div>
        <div className="clients-meta">
          +100 marcas asesoradas · {CLIENTS.length} visibles · CL · BR · US · ES
        </div>
      </div>
      <div className="clients-rows">
        {renderRow(half1, false)}
        {renderRow(half2, true)}
      </div>
    </section>
  );
}

function Faq({ items }) {
  const [open, setOpen] = useState(0);
  const baseId = useRef(`faq-${Math.random().toString(36).slice(2,8)}`).current;
  return (
    <div className="faq-list">
      {items.map((it, i) => {
        const qId = `${baseId}-q-${i}`;
        const aId = `${baseId}-a-${i}`;
        const isOpen = open === i;
        return (
          <div key={i} className={`faq-item ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              id={qId}
              aria-controls={aId}
              aria-expanded={isOpen}
              className="faq-q hoverable"
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span className="faq-q-num">0{i+1}</span>
              <span className="faq-q-text">{it.q}</span>
              <span className="faq-q-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            <div id={aId} role="region" aria-labelledby={qId} hidden={!isOpen} className="faq-a">
              {it.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
window.Faq = Faq;

function FloatingWhatsApp({ serviceKey = 'default' }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <a
      href={waLink(serviceKey)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onWaClick('floating')}
      className={`floating-wa hoverable ${visible ? 'show' : ''}`}
      aria-label="Cotizar por WhatsApp"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
      </svg>
      <span className="floating-wa-label">Cotizar por WhatsApp</span>
    </a>
  );
}

Object.assign(window, { Cursor, Ambient, DarkCanvas, Nav, StatusBar, Reveal, Marquee, Footer, ClientsMarquee, FloatingWhatsApp });
