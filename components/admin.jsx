/* admin.jsx — SPA del admin panel (v2: enterprise UX)
   Flow: LoginGate -> ArticleList (con quality badges) -> ArticleEditor (tooltips + QualityScoreCard).
   Auth: cookie httpOnly JWT (api/auth/*). Datos: api/articles/list + save. */

const { useState, useEffect, useRef, useCallback, useMemo } = React;

const SECTION_TYPES = [
  {value: 'h2', label: 'H2'},
  {value: 'h3', label: 'H3'},
  {value: 'p', label: 'Párrafo'},
  {value: 'list', label: 'Lista'},
  {value: 'table', label: 'Tabla'},
  {value: 'cta', label: 'CTA WhatsApp'}
];

const CATEGORIES = ['Estrategia', 'Software & IA', 'Paid Media', 'Email Marketing', 'Desarrollo Web', 'Community Management', 'Operaciones', 'Tech Stack', 'Growth', 'Demand Generation', 'Social Media', 'Industria'];
const INTENTS = ['Informational', 'Commercial/Informational', 'Commercial', 'Transactional'];
const WA_KEYS = ['default', 'software-ia', 'paid-media', 'email-marketing', 'desarrollo-web', 'community-management'];
const ARTICLE_TYPES = ['pillar', 'cluster'];

// ============================================================================
// Quality Score System — heurísticas para detectar gaps que requieren intervención humana
// ============================================================================
function countWordsInSections(sections) {
  if (!Array.isArray(sections)) return 0;
  let total = 0;
  for (const s of sections) {
    if (s.type === 'p' || s.type === 'h2' || s.type === 'h3') total += (s.text || '').split(/\s+/).filter(Boolean).length;
    else if (s.type === 'list') total += (s.items || []).reduce((a, it) => a + (it || '').split(/\s+/).filter(Boolean).length, 0);
    else if (s.type === 'table') {
      total += (s.headers || []).reduce((a, h) => a + (h || '').split(/\s+/).filter(Boolean).length, 0);
      total += (s.rows || []).reduce((a, r) => a + r.reduce((x, c) => x + (c || '').split(/\s+/).filter(Boolean).length, 0), 0);
    }
  }
  return total;
}

function countWords(str) {
  return (str || '').split(/\s+/).filter(Boolean).length;
}

function hasInternalLinks(article) {
  const all = [
    article.tldr || '',
    ...(article.sections || []).map(s => s.text || ''),
    ...(article.sections || []).flatMap(s => s.items || []),
    ...(article.faq || []).flatMap(qa => [qa.q || '', qa.a || ''])
  ].join(' ');
  return /\[[^\]]+\]\(\/recursos\/[^)]+\)/.test(all);
}

// Calcula quality score 0-100 + array de issues priorizados que requieren intervención humana
function computeQualityScore(article) {
  const issues = [];
  let score = 100;

  // Metadata crítica
  const titleLen = (article.title || '').length;
  if (!article.title) { issues.push({sev: 'critical', msg: 'Falta título (H1).'}); score -= 25; }
  else if (titleLen < 40) { issues.push({sev: 'warn', msg: `Título corto (${titleLen} chars). Ideal: 50-70.`}); score -= 8; }
  else if (titleLen > 80) { issues.push({sev: 'warn', msg: `Título largo (${titleLen} chars). Google trunca >70.`}); score -= 5; }

  const descLen = (article.description || '').length;
  if (!article.description) { issues.push({sev: 'critical', msg: 'Falta meta description.'}); score -= 20; }
  else if (descLen < 120) { issues.push({sev: 'warn', msg: `Description corta (${descLen} chars). Ideal: 150-160.`}); score -= 5; }
  else if (descLen > 170) { issues.push({sev: 'warn', msg: `Description larga (${descLen} chars). Google trunca >160.`}); score -= 3; }

  if (!article.slug || !/^[a-z0-9-]+$/.test(article.slug)) { issues.push({sev: 'critical', msg: 'Slug inválido. Solo a-z, 0-9, guiones.'}); score -= 15; }

  // TL;DR — ventana extracción LLM crítica
  const tldrWords = countWords(article.tldr);
  if (!article.tldr) { issues.push({sev: 'critical', msg: 'Falta TL;DR. Es la ventana donde LLMs extraen tu respuesta.'}); score -= 20; }
  else if (tldrWords < 50) { issues.push({sev: 'warn', msg: `TL;DR corto (${tldrWords} palabras). Ideal: 60-80 para LLM extraction.`}); score -= 8; }
  else if (tldrWords > 100) { issues.push({sev: 'warn', msg: `TL;DR largo (${tldrWords} palabras). LLMs prefieren respuestas concisas.`}); score -= 4; }

  // WordCount
  const sectionsWords = countWordsInSections(article.sections);
  const declaredWc = article.wordCount || 0;
  if (!article.sections || article.sections.length < 4) { issues.push({sev: 'critical', msg: `Solo ${(article.sections || []).length} secciones. Mínimo 4 H2 + contenido.`}); score -= 15; }
  if (sectionsWords < 1500) { issues.push({sev: 'warn', msg: `Solo ${sectionsWords} palabras en secciones. Pillars necesitan 2,000+, clusters 1,500+.`}); score -= 10; }
  if (Math.abs(sectionsWords - declaredWc) > 300 && declaredWc > 0) {
    issues.push({sev: 'info', msg: `WordCount declarado (${declaredWc}) ≠ palabras reales (${sectionsWords}). Sugiero actualizar.`});
  }

  // Secciones obligatorias
  const h2Count = (article.sections || []).filter(s => s.type === 'h2').length;
  if (h2Count < 4) { issues.push({sev: 'warn', msg: `Solo ${h2Count} H2. Ideal: 5-8 para topic coverage.`}); score -= 6; }

  // FAQ
  const faqCount = (article.faq || []).length;
  if (faqCount === 0) { issues.push({sev: 'critical', msg: 'Sin FAQ. Schema FAQPage requiere mínimo 1.'}); score -= 12; }
  else if (faqCount < 5) { issues.push({sev: 'warn', msg: `Solo ${faqCount} FAQs. Ideal: 5-7 (más rich results en Google).`}); score -= 5; }

  // Sources
  const srcCount = (article.sources || []).length;
  if (srcCount === 0) { issues.push({sev: 'critical', msg: 'Sin sources externas. Sube citation rate en LLMs +115%.'}); score -= 10; }
  else if (srcCount < 3) { issues.push({sev: 'warn', msg: `Solo ${srcCount} sources. Ideal: 5+ para autoridad.`}); score -= 4; }
  else if (srcCount < 5) { issues.push({sev: 'info', msg: `${srcCount} sources OK. Apuntar a 5+ es mejor.`}); }

  // Internal linking
  if (!hasInternalLinks(article)) {
    issues.push({sev: 'warn', msg: 'Sin internal links. Mínimo 2 links a otros /recursos/ con [texto](/recursos/slug).'});
    score -= 6;
  }

  // Hero image
  if (!article.heroImage) { issues.push({sev: 'info', msg: 'Falta heroImage path. Default: /assets/blog/<slug>.jpg'}); }

  // Keyword
  if (!article.keyword) { issues.push({sev: 'warn', msg: 'Falta keyword principal.'}); score -= 4; }
  if (!article.secondaryKeywords || article.secondaryKeywords.length < 3) {
    issues.push({sev: 'info', msg: 'Pocas secondary keywords. Ideal: 4-6.'});
  }

  // CTA
  const hasCta = (article.sections || []).some(s => s.type === 'cta');
  if (!hasCta) { issues.push({sev: 'warn', msg: 'Sin CTA WhatsApp al final. Reduce conversión.'}); score -= 4; }

  // Author
  if (!article.author || !article.authorRole) {
    issues.push({sev: 'warn', msg: 'Author + role obligatorios para schema Person + BlogPosting.'});
    score -= 4;
  }

  // Tabla o lista para riqueza visual
  const hasTable = (article.sections || []).some(s => s.type === 'table');
  const hasList = (article.sections || []).some(s => s.type === 'list');
  if (!hasTable && !hasList) {
    issues.push({sev: 'info', msg: 'Sin tablas ni listas. Mejoran scanability y dwell time.'});
  }

  // Sort: critical → warn → info
  const order = {critical: 0, warn: 1, info: 2};
  issues.sort((a, b) => order[a.sev] - order[b.sev]);

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    counts: {
      criticalCount: issues.filter(i => i.sev === 'critical').length,
      warnCount: issues.filter(i => i.sev === 'warn').length,
      infoCount: issues.filter(i => i.sev === 'info').length,
      wordCount: sectionsWords,
      tldrWords,
      faqCount,
      sourcesCount: srcCount,
      h2Count
    }
  };
}

function getScoreColor(score) {
  if (score >= 85) return '#2e7d32'; // green
  if (score >= 65) return '#f39200'; // orange
  return '#c62828'; // red
}
function getScoreLabel(score) {
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Bueno';
  if (score >= 50) return 'Necesita mejoras';
  return 'Crítico — no publicar';
}

// ============================================================================
// Generic UI helpers
// ============================================================================
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Tooltip: hover icon con explicación contextual
function Tooltip({text}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="tooltip-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span className="tooltip-icon" tabIndex={0} aria-label="Ayuda">?</span>
      {open && <span className="tooltip-body" role="tooltip">{text}</span>}
    </span>
  );
}

// Form field con tooltip + char/word counter opcional
function Field({label, tooltip, children, hint, charCount, wordCount, idealMin, idealMax, value}) {
  const len = (value || '').length;
  const words = wordCount ? countWords(value) : null;
  let counterClass = 'field-counter';
  if (idealMin != null && idealMax != null && charCount) {
    if (len === 0) counterClass += ' is-empty';
    else if (len < idealMin) counterClass += ' is-low';
    else if (len > idealMax) counterClass += ' is-high';
    else counterClass += ' is-ok';
  }
  return (
    <div className="form-field">
      <label>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      {children}
      <div className="field-hint-row">
        {hint && <span className="field-hint">{hint}</span>}
        {charCount && <span className={counterClass}>{len} chars</span>}
        {wordCount && <span className={counterClass}>{words} palabras</span>}
      </div>
    </div>
  );
}

// Collapsible section block
function Collapsible({title, defaultOpen = true, badge, children}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="collapsible">
      <button className="collapsible-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="collapsible-chevron">{open ? '▾' : '▸'}</span>
        <span className="collapsible-title">{title}</span>
        {badge && <span className="collapsible-badge">{badge}</span>}
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </section>
  );
}

// ============================================================================
// LoginScreen
// ============================================================================
function LoginScreen() {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-title">Admin · Intothecom</div>
        <div className="login-subtitle">Login restringido a emails autorizados</div>
        <a href="/api/auth/login" className="btn-google">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
          </svg>
          Continuar con Google
        </a>
        <p style={{marginTop:24, fontSize:12, color:'rgba(0,0,0,0.5)', lineHeight:1.5}}>
          Solo emails autorizados por el administrador pueden ingresar.
          Si tu email no está en la lista, contacta a Ignacio.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SectionEditor (con tooltips)
// ============================================================================
function SectionEditor({section, index, onChange, onDelete, onMoveUp, onMoveDown}) {
  const update = (k, v) => onChange({...section, [k]: v});

  const headerLabel = {h2: 'Subtítulo H2', h3: 'Sub-subtítulo H3', p: 'Párrafo', list: 'Lista', table: 'Tabla', cta: 'CTA WhatsApp'}[section.type] || section.type.toUpperCase();

  let body;
  if (section.type === 'h2' || section.type === 'h3') {
    body = (
      <>
        <Field
          label={`Texto del ${section.type.toUpperCase()}`}
          tooltip="Subtítulo visible. Aparece en TOC y como anchor para deep-links. Debe ser descriptivo, no decorativo."
        >
          <input value={section.text || ''} onChange={e => update('text', e.target.value)} />
        </Field>
        <Field
          label="Anchor ID"
          tooltip="ID HTML para que se pueda linkear con /recursos/slug#anchor. Si lo dejás vacío, se auto-genera del texto."
          hint={`Auto: ${slugify(section.text || '') || '(escribí el texto primero)'}`}
        >
          <input value={section.id || ''} onChange={e => update('id', e.target.value)} placeholder={slugify(section.text || '')} />
        </Field>
      </>
    );
  } else if (section.type === 'p') {
    body = (
      <Field
        label="Párrafo"
        tooltip="Soporta **negrita** con asteriscos dobles y [texto](/recursos/slug) para internal links. Texto plano sin HTML."
        wordCount
        value={section.text}
      >
        <textarea value={section.text || ''} onChange={e => update('text', e.target.value)} rows={5} />
      </Field>
    );
  } else if (section.type === 'list') {
    const items = section.items || [];
    return (
      <div className="section-block">
        <div className="section-block-head">
          <span>#{index + 1} · {headerLabel} ({items.length} items)</span>
          <div className="row-buttons">
            <button onClick={onMoveUp} title="Subir">↑</button>
            <button onClick={onMoveDown} title="Bajar">↓</button>
            <button onClick={onDelete} className="danger">eliminar</button>
          </div>
        </div>
        <div className="field-hint" style={{marginBottom:8}}>
          Soporta **negrita** y [texto](/recursos/slug) en cada item.
        </div>
        {items.map((it, i) => (
          <div key={i} style={{display:'flex',gap:6,marginBottom:6}}>
            <textarea
              value={it}
              onChange={e => {
                const next = [...items]; next[i] = e.target.value;
                update('items', next);
              }}
              rows={2}
              style={{flex:1,padding:'8px',border:'1px solid rgba(0,0,0,0.15)',borderRadius:4,fontFamily:'inherit',fontSize:13}}
            />
            <button onClick={() => update('items', items.filter((_,j)=>j!==i))} className="btn btn-ghost" style={{background:'#eee',color:'#c62828',padding:'4px 10px'}}>×</button>
          </div>
        ))}
        <button onClick={() => update('items', [...items, ''])} className="btn btn-ghost" style={{background:'#eee',color:'#1a1a1d',marginTop:4}}>+ item</button>
      </div>
    );
  } else if (section.type === 'table') {
    const headers = section.headers || [];
    const rows = section.rows || [];
    return (
      <div className="section-block">
        <div className="section-block-head">
          <span>#{index + 1} · {headerLabel} ({headers.length} cols × {rows.length} filas)</span>
          <div className="row-buttons">
            <button onClick={onMoveUp} title="Subir">↑</button>
            <button onClick={onMoveDown} title="Bajar">↓</button>
            <button onClick={onDelete} className="danger">eliminar</button>
          </div>
        </div>
        <Field
          label="Headers"
          tooltip="Encabezados de columna separados por |. Ej: Agencia | Especialidad | Precio"
        >
          <input
            value={headers.join(' | ')}
            onChange={e => update('headers', e.target.value.split('|').map(s => s.trim()))}
          />
        </Field>
        <Field
          label="Filas"
          tooltip="Una fila por línea. Columnas separadas por |. Ej: Loup | Consultoría B2B | USD 5K+/mes"
        >
          <textarea
            rows={Math.max(3, rows.length)}
            value={rows.map(r => r.join(' | ')).join('\n')}
            onChange={e => {
              const next = e.target.value.split('\n').filter(l => l.trim()).map(l => l.split('|').map(s => s.trim()));
              update('rows', next);
            }}
            style={{fontFamily:'JetBrains Mono, monospace',fontSize:12}}
          />
        </Field>
      </div>
    );
  } else if (section.type === 'cta') {
    body = (
      <>
        <Field
          label="Texto del botón"
          tooltip="Llamado a la acción visible. Ej: 'Cotizar con IntoTheCom', 'Auditemos tu stack'."
        >
          <input value={section.text || ''} onChange={e => update('text', e.target.value)} placeholder="Cotizar por WhatsApp" />
        </Field>
        <Field
          label="WhatsApp key"
          tooltip="Determina qué mensaje pre-llenado abre el WhatsApp. 'default' es genérico; los otros son específicos por servicio."
        >
          <select value={section.waKey || 'default'} onChange={e => update('waKey', e.target.value)}>
            {WA_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
      </>
    );
  }

  return (
    <div className="section-block">
      <div className="section-block-head">
        <span>#{index + 1} · {headerLabel}</span>
        <div className="row-buttons">
          <button onClick={onMoveUp} title="Subir">↑</button>
          <button onClick={onMoveDown} title="Bajar">↓</button>
          <button onClick={onDelete} className="danger">eliminar</button>
        </div>
      </div>
      {body}
    </div>
  );
}

// ============================================================================
// QualityScoreCard — sidebar flotante con score + issues
// ============================================================================
function QualityScoreCard({article, otherSlugs, onInsertLink}) {
  const {score, issues, counts} = useMemo(() => computeQualityScore(article), [article]);
  const [showLinks, setShowLinks] = useState(false);

  return (
    <aside className="qs-card">
      <div className="qs-score-circle" style={{borderColor: getScoreColor(score)}}>
        <div className="qs-score-num" style={{color: getScoreColor(score)}}>{score}</div>
        <div className="qs-score-label">/ 100</div>
      </div>
      <div className="qs-status" style={{color: getScoreColor(score)}}>{getScoreLabel(score)}</div>

      <div className="qs-counts">
        <div><strong>{counts.wordCount}</strong> palabras</div>
        <div><strong>{counts.tldrWords}</strong> palabras TL;DR</div>
        <div><strong>{counts.h2Count}</strong> H2 · <strong>{counts.faqCount}</strong> FAQ · <strong>{counts.sourcesCount}</strong> sources</div>
      </div>

      {issues.length > 0 && (
        <div className="qs-issues">
          <div className="qs-issues-title">
            ⚠️ Requiere intervención humana ({counts.criticalCount} crítico{counts.criticalCount === 1 ? '' : 's'} · {counts.warnCount} advertencia{counts.warnCount === 1 ? '' : 's'} · {counts.infoCount} sugerencia{counts.infoCount === 1 ? '' : 's'})
          </div>
          <ul className="qs-issues-list">
            {issues.map((iss, i) => (
              <li key={i} className={`qs-issue qs-issue-${iss.sev}`}>
                <span className="qs-issue-sev">{iss.sev === 'critical' ? '🔴' : iss.sev === 'warn' ? '🟡' : 'ℹ️'}</span>
                <span className="qs-issue-msg">{iss.msg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {issues.length === 0 && (
        <div className="qs-all-good">✅ Sin issues detectadas. Listo para publicar.</div>
      )}

      {/* Helper: insertar link interno */}
      {otherSlugs && otherSlugs.length > 0 && (
        <div className="qs-helper">
          <button className="qs-helper-toggle" onClick={() => setShowLinks(!showLinks)}>
            {showLinks ? '▾' : '▸'} Insertar internal link
          </button>
          {showLinks && (
            <div className="qs-helper-body">
              <div className="field-hint" style={{marginBottom:6}}>Copia y pega en cualquier párrafo o lista:</div>
              {otherSlugs.map(s => (
                <div key={s.slug} className="qs-helper-link">
                  <code>[{s.title.substring(0, 35)}{s.title.length > 35 ? '…' : ''}](/recursos/{s.slug})</code>
                  <button
                    className="qs-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(`[${s.title}](/recursos/${s.slug})`);
                      showToast('Link copiado al portapapeles', 'success');
                    }}
                  >copiar</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="qs-legend">
        <div><strong>🔴 Crítico</strong>: bloquea publicación, schema inválido o falta requerida.</div>
        <div><strong>🟡 Advertencia</strong>: penaliza ranking/citation rate. Recomendable arreglar.</div>
        <div><strong>ℹ️ Sugerencia</strong>: optimización menor, opcional.</div>
      </div>
    </aside>
  );
}

// ============================================================================
// ArticleEditor — refactor enterprise
// ============================================================================
function ArticleEditor({article, onSave, onCancel, isNew, allArticles}) {
  const [draft, setDraft] = useState(article);
  const [saving, setSaving] = useState(false);
  const update = (k, v) => setDraft(d => ({...d, [k]: v}));

  // Otros artículos para internal linking (excluir current)
  const otherSlugs = useMemo(() => (allArticles || []).filter(a => a.slug !== draft.slug).map(a => ({slug: a.slug, title: a.title})), [allArticles, draft.slug]);

  const addSection = (type) => {
    const base = {type, id: ''};
    if (type === 'h2' || type === 'h3') Object.assign(base, {text: ''});
    else if (type === 'p') Object.assign(base, {text: ''});
    else if (type === 'list') Object.assign(base, {items: ['']});
    else if (type === 'table') Object.assign(base, {headers: ['Col 1', 'Col 2'], rows: [['', '']]});
    else if (type === 'cta') Object.assign(base, {text: 'Cotizar por WhatsApp', waKey: 'default'});
    update('sections', [...(draft.sections || []), base]);
  };

  const updateSection = (i, newSection) => {
    const next = [...draft.sections];
    next[i] = newSection;
    update('sections', next);
  };

  const deleteSection = (i) => {
    if (!confirm('¿Eliminar esta sección?')) return;
    update('sections', draft.sections.filter((_, j) => j !== i));
  };

  const moveSection = (i, dir) => {
    const next = [...draft.sections];
    const newIdx = i + dir;
    if (newIdx < 0 || newIdx >= next.length) return;
    [next[i], next[newIdx]] = [next[newIdx], next[i]];
    update('sections', next);
  };

  const updateFaq = (i, k, v) => {
    const next = [...(draft.faq || [])];
    next[i] = {...next[i], [k]: v};
    update('faq', next);
  };
  const addFaq = () => update('faq', [...(draft.faq || []), {q: '', a: ''}]);
  const removeFaq = (i) => update('faq', draft.faq.filter((_, j) => j !== i));

  const updateSource = (i, k, v) => {
    const next = [...(draft.sources || [])];
    next[i] = {...next[i], [k]: v};
    update('sources', next);
  };
  const addSource = () => update('sources', [...(draft.sources || []), {name: '', url: ''}]);
  const removeSource = (i) => update('sources', draft.sources.filter((_, j) => j !== i));

  const recalculateWordCount = () => {
    const wc = countWordsInSections(draft.sections);
    update('wordCount', wc);
    showToast(`WordCount actualizado a ${wc}`, 'info');
  };

  const handleSave = async () => {
    const {score, issues} = computeQualityScore(draft);
    const critical = issues.filter(i => i.sev === 'critical');
    if (critical.length > 0) {
      if (!confirm(`Hay ${critical.length} issues críticos sin resolver:\n\n${critical.map(i => '• ' + i.msg).join('\n')}\n\n¿Publicar igual?`)) return;
    }
    if (score < 70) {
      if (!confirm(`Quality Score: ${score}/100 (${getScoreLabel(score)}). ¿Publicar igual?`)) return;
    }
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  const titleLen = (draft.title || '').length;
  const descLen = (draft.description || '').length;
  const tldrWords = countWords(draft.tldr);
  const sectionsWords = countWordsInSections(draft.sections);

  return (
    <div className="editor-shell">
      <div className="editor-main">
        <div className="header-row sticky">
          <div>
            <div className="h1">{isNew ? 'Nuevo artículo' : 'Editar artículo'}</div>
            <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:11,color:'rgba(0,0,0,0.5)',marginTop:4,textTransform:'uppercase',letterSpacing:1}}>
              {draft.slug || '(slug pendiente)'}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={onCancel} className="btn btn-ghost" style={{color:'#1a1a1d',borderColor:'rgba(0,0,0,0.15)'}}>Cancelar</button>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar y publicar'}
            </button>
          </div>
        </div>

        <div className="pre-publish-check">
          <strong>Flujo al guardar</strong>: 1) commit a GitHub con tu email, 2) Vercel redeploya producción en ~30-60s, 3) IndexNow notifica a Bing/Yandex/Naver/DuckDuckGo en segundos, 4) Google detecta cambio en 2-24h.
        </div>

        {/* === METADATA === */}
        <Collapsible title="1. Metadata SEO" defaultOpen badge="crítico">
          <div className="form-grid-2">
            <Field
              label="Título (H1 + <title>)"
              tooltip="El H1 visible del artículo Y el <title> de la página. 50-70 chars ideal. Google trunca >70. Debe incluir keyword principal."
              charCount idealMin={40} idealMax={80} value={draft.title}
            >
              <input
                value={draft.title || ''}
                onChange={e => {
                  update('title', e.target.value);
                  if (isNew && !draft.slug) update('slug', slugify(e.target.value));
                }}
              />
            </Field>
            <Field
              label="Slug (URL)"
              tooltip="Aparece en la URL /recursos/<slug>. Solo a-z, 0-9, guiones. No se puede cambiar después de publicar para no romper enlaces."
              hint={`/recursos/${draft.slug || 'slug'}`}
            >
              <input value={draft.slug || ''} onChange={e => update('slug', slugify(e.target.value))} disabled={!isNew}/>
            </Field>
          </div>
          <Field
            label="Meta description"
            tooltip="Aparece en Google SERP y en preview Twitter/LinkedIn al compartir el link. 150-160 chars. Debe convencer al click."
            charCount idealMin={120} idealMax={170} value={draft.description}
          >
            <textarea value={draft.description || ''} onChange={e => update('description', e.target.value)} rows={2}/>
          </Field>
          <div className="form-grid-2">
            <Field label="Categoría" tooltip="Sección del blog. Aparece como breadcrumb y filtro.">
              <select value={draft.category || 'Estrategia'} onChange={e => update('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Tipo" tooltip="Pillar = artículo principal de un cluster (2,000+ palabras). Cluster = artículo de profundización (1,500+ palabras) que linkea al pillar.">
              <select value={draft.type || 'pillar'} onChange={e => update('type', e.target.value)}>
                {ARTICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Intent" tooltip="Intención de búsqueda. Informational: aprender. Commercial: comparar opciones. Transactional: cotizar/comprar.">
              <select value={draft.intent || 'Informational'} onChange={e => update('intent', e.target.value)}>
                {INTENTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Reading time" tooltip="Estimación. Regla simple: wordCount / 200 palabras/min. Ej: 2,400 palabras = '12 min'.">
              <input value={draft.readingTime || ''} onChange={e => update('readingTime', e.target.value)}/>
            </Field>
            <Field label="Word count" tooltip="Total de palabras del artículo. Click el botón para recalcular automáticamente.">
              <div style={{display:'flex',gap:6}}>
                <input type="number" value={draft.wordCount || 0} onChange={e => update('wordCount', parseInt(e.target.value) || 0)} style={{flex:1}}/>
                <button onClick={recalculateWordCount} className="btn btn-ghost" style={{padding:'8px 12px',fontSize:11}}>Auto ({sectionsWords})</button>
              </div>
            </Field>
            <Field label="Hero image" tooltip="Path absoluto a la imagen. Default si vacío: /assets/blog/<slug>.jpg. Generar con scripts/generate-hero-images.js.">
              <input value={draft.heroImage || ''} onChange={e => update('heroImage', e.target.value)} placeholder={`/assets/blog/${draft.slug || 'slug'}.jpg`}/>
            </Field>
          </div>
          <div className="form-grid-2">
            <Field label="Cluster" tooltip="Slug del cluster temático al que pertenece este artículo. Ej: stack-b2b, growth-b2b.">
              <input value={draft.cluster || ''} onChange={e => update('cluster', e.target.value)}/>
            </Field>
            <Field label="Pillar (si es cluster)" tooltip="Slug del pillar madre al que este cluster pertenece. Solo si type=cluster.">
              <input value={draft.pillar || ''} onChange={e => update('pillar', e.target.value)} placeholder="marketing-digital-b2b-latam-2026"/>
            </Field>
          </div>
        </Collapsible>

        {/* === SEO KEYWORDS === */}
        <Collapsible title="2. Keywords + autor" defaultOpen={false}>
          <Field label="Keyword principal" tooltip="La palabra clave para la que querés rankear. Aparecerá en title, description, H1, primera línea y al menos 2 H2.">
            <input value={draft.keyword || ''} onChange={e => update('keyword', e.target.value)}/>
          </Field>
          <Field label="Secondary keywords" tooltip="Variaciones long-tail separadas por coma. Cada una debería aparecer naturalmente 1-2 veces en el artículo." hint="Separadas por coma">
            <input
              value={(draft.secondaryKeywords || []).join(', ')}
              onChange={e => update('secondaryKeywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
          </Field>
          <Field label="Tags" tooltip="Etiquetas temáticas. Aparecen como chips visuales. Ej: B2B, Growth, SaaS." hint="Separadas por coma">
            <input
              value={(draft.tags || []).join(', ')}
              onChange={e => update('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
          </Field>
          <div className="form-grid-2">
            <Field label="Author name" tooltip="Aparece en schema Person + BlogPosting + visible en el artículo. Default: Ignacio Blanco.">
              <input value={draft.author || 'Ignacio Blanco'} onChange={e => update('author', e.target.value)}/>
            </Field>
            <Field label="Author role" tooltip="Cargo del autor. Visible en el artículo + schema BlogPosting.">
              <input value={draft.authorRole || 'Co-founder & Strategy Lead'} onChange={e => update('authorRole', e.target.value)}/>
            </Field>
          </div>
          <Field label="Author slug" tooltip="Identificador interno del autor. Usado para anclar schema Person.">
            <input value={draft.authorSlug || 'ignacio-blanco'} onChange={e => update('authorSlug', e.target.value)}/>
          </Field>
        </Collapsible>

        {/* === TL;DR === */}
        <Collapsible title="3. TL;DR — ventana extracción LLM" defaultOpen badge="crítico">
          <Field
            label="TL;DR (60-80 palabras es lo óptimo)"
            tooltip="ESTA es la ventana que ChatGPT, Claude, Perplexity y Copilot extraen como respuesta cuando alguien pregunta. Debe responder la query principal directamente, en 60-80 palabras, con números/specifics."
            wordCount value={draft.tldr}
          >
            <textarea value={draft.tldr || ''} onChange={e => update('tldr', e.target.value)} rows={6}/>
          </Field>
        </Collapsible>

        {/* === SECCIONES === */}
        <Collapsible title={`4. Secciones (${(draft.sections || []).length} bloques · ${sectionsWords} palabras)`} defaultOpen>
          <div className="field-hint" style={{marginBottom:12}}>
            Soportan markdown inline: <code>**negrita**</code> y <code>[texto](/recursos/slug)</code> para internal links.
            Estructura ideal: 5-8 H2 + 1 tabla + 1-2 listas + 1 CTA al final.
          </div>
          {(draft.sections || []).map((s, i) => (
            <SectionEditor
              key={i}
              section={s}
              index={i}
              onChange={(ns) => updateSection(i, ns)}
              onDelete={() => deleteSection(i)}
              onMoveUp={() => moveSection(i, -1)}
              onMoveDown={() => moveSection(i, 1)}
            />
          ))}
          <div style={{display:'grid',gridTemplateColumns:'repeat(6, 1fr)',gap:8,marginTop:12}}>
            {SECTION_TYPES.map(t => (
              <button key={t.value} onClick={() => addSection(t.value)} className="add-section" style={{padding:'10px 8px',fontSize:12}}>
                + {t.label}
              </button>
            ))}
          </div>
        </Collapsible>

        {/* === FAQ === */}
        <Collapsible title={`5. FAQ (${(draft.faq || []).length} preguntas · mínimo 5 para FAQPage schema)`} defaultOpen={false}>
          <div className="field-hint" style={{marginBottom:12}}>
            Las FAQs generan rich results en Google (acordeón) y son extraídas frecuentemente por LLMs. Cada respuesta: 50-150 palabras, autocontenida.
          </div>
          {(draft.faq || []).map((qa, i) => (
            <div key={i} className="section-block">
              <div className="section-block-head">
                <span>FAQ {i+1}</span>
                <button onClick={() => removeFaq(i)} className="btn-danger" style={{padding:'4px 10px',fontSize:11,fontFamily:'JetBrains Mono, monospace',textTransform:'uppercase',letterSpacing:1,borderRadius:4,border:'none',cursor:'pointer'}}>eliminar</button>
              </div>
              <Field
                label="Pregunta"
                tooltip="Debe empezar con palabra interrogativa (¿Qué, ¿Cómo, ¿Cuánto, ¿Cuándo). Tono natural, conversacional."
              >
                <input value={qa.q} onChange={e => updateFaq(i, 'q', e.target.value)}/>
              </Field>
              <Field
                label="Respuesta"
                tooltip="50-150 palabras. Debe responder directamente la pregunta en la primera frase. Incluir cifras/specifics."
                wordCount value={qa.a}
              >
                <textarea value={qa.a} onChange={e => updateFaq(i, 'a', e.target.value)} rows={3}/>
              </Field>
            </div>
          ))}
          <button onClick={addFaq} className="add-section">+ Pregunta FAQ</button>
        </Collapsible>

        {/* === SOURCES === */}
        <Collapsible title={`6. Sources externas (${(draft.sources || []).length} · sube citation rate +115% en LLMs)`} defaultOpen={false}>
          <div className="field-hint" style={{marginBottom:12}}>
            URLs reales y verificables (HBR, McKinsey, Gartner, papers, vendor docs). Aparecen al final del artículo como "Fuentes citadas".
          </div>
          {(draft.sources || []).map((s, i) => (
            <div key={i} className="section-block">
              <div className="section-block-head">
                <span>Source {i+1}</span>
                <button onClick={() => removeSource(i)} className="btn-danger" style={{padding:'4px 10px',fontSize:11,fontFamily:'JetBrains Mono, monospace',textTransform:'uppercase',letterSpacing:1,borderRadius:4,border:'none',cursor:'pointer'}}>eliminar</button>
              </div>
              <div className="form-grid-2">
                <Field label="Nombre" tooltip="Título de la fuente. Ej: 'HBR - How to Run a Kickoff Meeting'."><input value={s.name} onChange={e => updateSource(i, 'name', e.target.value)}/></Field>
                <Field label="URL" tooltip="URL completa con https://"><input value={s.url} onChange={e => updateSource(i, 'url', e.target.value)}/></Field>
              </div>
            </div>
          ))}
          <button onClick={addSource} className="add-section">+ Source</button>
        </Collapsible>

        {/* === Related === */}
        <Collapsible title="7. Related slugs (opcional)" defaultOpen={false}>
          <Field label="Slugs relacionados" tooltip="Cross-links a otros artículos. Aparecen al final como 'Recursos relacionados'. Separados por coma." hint="Ej: marketing-digital-b2b-latam-2026, kick-off-proyecto-guia-completa-2026">
            <input
              value={(draft.relatedSlugs || []).join(', ')}
              onChange={e => update('relatedSlugs', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
          </Field>
        </Collapsible>

        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:32,paddingTop:24,borderTop:'1px solid rgba(0,0,0,0.08)'}}>
          <button onClick={onCancel} className="btn btn-ghost" style={{color:'#1a1a1d',borderColor:'rgba(0,0,0,0.15)'}}>Cancelar</button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar y publicar'}
          </button>
        </div>
      </div>

      <QualityScoreCard article={draft} otherSlugs={otherSlugs} />
    </div>
  );
}

// ============================================================================
// newArticle factory
// ============================================================================
function newArticle() {
  return {
    slug: '',
    type: 'pillar',
    cluster: '',
    title: '',
    description: '',
    publishedAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    author: 'Ignacio Blanco',
    authorRole: 'Co-founder & Strategy Lead',
    authorSlug: 'ignacio-blanco',
    category: 'Estrategia',
    readingTime: '10 min',
    wordCount: 0,
    keyword: '',
    secondaryKeywords: [],
    intent: 'Informational',
    tags: [],
    heroImage: '',
    tldr: '',
    sections: [],
    faq: [],
    relatedSlugs: [],
    sources: []
  };
}

// ============================================================================
// SeoDashboard — consume /api/seo/dashboard y muestra métricas GSC
// ============================================================================
function SeoDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(28);
  const [health, setHealth] = useState(null);

  const load = useCallback((d = days) => {
    setLoading(true);
    setError(null);
    fetch(`/api/seo/dashboard?days=${d}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) setError(json.error);
        else setData(json);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [days]);

  useEffect(() => {
    load(days);
    // health check sin auth para mostrar status
    fetch('/api/seo/health').then(r => r.json()).then(setHealth).catch(()=>{});
  }, [days, load]);

  const fmtPct = (n) => `${(n * 100).toFixed(2)}%`;
  const fmtPos = (n) => n ? n.toFixed(1) : '-';
  const fmtNum = (n) => (n || 0).toLocaleString('es-CL');

  const gscStatus = data?.sources?.gsc;

  return (
    <div>
      <div className="header-row">
        <div className="h1">📊 SEO Dashboard</div>
        <div style={{display:'flex',gap:8}}>
          {[7, 28, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`btn ${days === d ? 'btn-primary' : 'btn-ghost'}`}
              style={{padding:'8px 14px',fontSize:13, color: days === d ? '#0a0a0b' : '#1a1a1d', borderColor: days === d ? 'transparent' : 'rgba(0,0,0,0.15)'}}
            >Últimos {d}d</button>
          ))}
          <button onClick={() => load()} className="btn btn-ghost" style={{padding:'8px 14px',fontSize:13, color: '#1a1a1d', borderColor: 'rgba(0,0,0,0.15)'}}>🔄 Refresh</button>
        </div>
      </div>

      {/* Health status */}
      {health && (
        <div className="dashboard-health">
          <span className="dh-pill" style={{background: health.gscConfig === 'ok' ? 'rgba(46,125,50,0.1)' : 'rgba(198,40,40,0.1)', color: health.gscConfig === 'ok' ? '#2e7d32' : '#c62828'}}>
            GSC config: {health.gscConfig}
          </span>
          <span className="dh-pill" style={{background: health.authToken === 'ok' ? 'rgba(46,125,50,0.1)' : 'rgba(198,40,40,0.1)', color: health.authToken === 'ok' ? '#2e7d32' : '#c62828'}}>
            Auth Google: {health.authToken}
          </span>
          <span className="dh-pill" style={{background: health.env.BING_API_KEY === 'present' ? 'rgba(46,125,50,0.1)' : 'rgba(243,146,0,0.1)', color: health.env.BING_API_KEY === 'present' ? '#2e7d32' : '#c66800'}}>
            Bing API: {health.env.BING_API_KEY}
          </span>
          <span className="dh-pill-mono">{health.serviceAccountEmail}</span>
        </div>
      )}

      {loading && <div className="empty-state">Cargando data de GSC…</div>}

      {error && (
        <div className="dashboard-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && gscStatus !== 'ok' && gscStatus !== 'no_data' && (
        <div className="dashboard-error">
          <strong>GSC no devuelve data todavía.</strong>
          <p>Status: <code>{gscStatus}</code>. Razones posibles:</p>
          <ul style={{marginLeft:20,marginTop:8}}>
            <li>El service account <code>{health?.serviceAccountEmail}</code> aún no está agregado en GSC → Settings → Users (permission Restricted).</li>
            <li>Propagación de Google está tardando (esperar 5-10 min después de agregarlo).</li>
            <li>La property <code>{data.range && process.env.GSC_PROPERTY_URL}</code> no existe o no es la correcta.</li>
          </ul>
          {data.errors.length > 0 && (
            <pre style={{marginTop:12,padding:12,background:'rgba(0,0,0,0.05)',borderRadius:6,fontSize:11,overflow:'auto'}}>
              {JSON.stringify(data.errors, null, 2)}
            </pre>
          )}
        </div>
      )}

      {data && data.summary && (gscStatus === 'ok' || gscStatus === 'no_data') && (
        <>
          <div className="stats-grid" style={{marginTop:24}}>
            <div className="stat-card">
              <div className="stat-label">Clicks</div>
              <div className="stat-value">{fmtNum(data.summary.clicks)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Impresiones</div>
              <div className="stat-value">{fmtNum(data.summary.impressions)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">CTR</div>
              <div className="stat-value">{fmtPct(data.summary.ctr)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Posición promedio</div>
              <div className="stat-value">{fmtPos(data.summary.position)}</div>
            </div>
          </div>

          <div className="dashboard-row">
            <div className="dashboard-card">
              <div className="dashboard-card-head">
                <span>Top queries (búsquedas que te encuentran)</span>
                <Tooltip text="Las palabras o frases que los usuarios buscaron en Google y aparecieron una página tuya en los resultados. Ordenadas por clicks." />
              </div>
              {data.topQueries.length === 0 && <div className="dashboard-empty">Sin data aún. GSC tarda 24-48h en mostrar queries para nuevas URLs.</div>}
              {data.topQueries.length > 0 && (
                <table className="dashboard-table">
                  <thead><tr><th>Query</th><th>Clicks</th><th>Impr.</th><th>CTR</th><th>Pos</th></tr></thead>
                  <tbody>
                    {data.topQueries.map((q, i) => (
                      <tr key={i}>
                        <td className="dt-query">{q.query}</td>
                        <td className="dt-num">{fmtNum(q.clicks)}</td>
                        <td className="dt-num">{fmtNum(q.impressions)}</td>
                        <td className="dt-num">{fmtPct(q.ctr)}</td>
                        <td className="dt-num">{fmtPos(q.position)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-head">
                <span>Top páginas (las que reciben más impresiones)</span>
                <Tooltip text="URLs de tu sitio que más aparecen en resultados de Google. Si una página tiene muchas impresiones pero pocos clicks, optimiza el title y la description (CTR bajo)." />
              </div>
              {data.topPages.length === 0 && <div className="dashboard-empty">Sin data aún.</div>}
              {data.topPages.length > 0 && (
                <table className="dashboard-table">
                  <thead><tr><th>Página</th><th>Clicks</th><th>Impr.</th><th>CTR</th><th>Pos</th></tr></thead>
                  <tbody>
                    {data.topPages.map((p, i) => (
                      <tr key={i}>
                        <td className="dt-query"><a href={p.page} target="_blank" rel="noopener noreferrer">{p.page.replace('https://www.intothecom.com', '')}</a></td>
                        <td className="dt-num">{fmtNum(p.clicks)}</td>
                        <td className="dt-num">{fmtNum(p.impressions)}</td>
                        <td className="dt-num">{fmtPct(p.ctr)}</td>
                        <td className="dt-num">{fmtPos(p.position)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="dashboard-row">
            <div className="dashboard-card">
              <div className="dashboard-card-head">
                <span>Por dispositivo</span>
                <Tooltip text="Cómo se distribuyen tus clicks entre mobile, desktop y tablet. Si mobile pesa más pero su CTR es bajo, revisa diseño responsive." />
              </div>
              {data.byDevice.length === 0 && <div className="dashboard-empty">Sin data aún.</div>}
              {data.byDevice.length > 0 && (
                <table className="dashboard-table">
                  <thead><tr><th>Device</th><th>Clicks</th><th>Impr.</th><th>CTR</th></tr></thead>
                  <tbody>
                    {data.byDevice.map((d, i) => (
                      <tr key={i}>
                        <td>{d.device}</td>
                        <td className="dt-num">{fmtNum(d.clicks)}</td>
                        <td className="dt-num">{fmtNum(d.impressions)}</td>
                        <td className="dt-num">{fmtPct(d.ctr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-head">
                <span>Top países</span>
                <Tooltip text="Países desde los que recibís clicks. Útil para validar tus mercados objetivo (CL, US, ES, CO, PE). Si aparece otro país con peso, podrías expandir contenido." />
              </div>
              {data.byCountry.length === 0 && <div className="dashboard-empty">Sin data aún.</div>}
              {data.byCountry.length > 0 && (
                <table className="dashboard-table">
                  <thead><tr><th>País</th><th>Clicks</th><th>Impr.</th></tr></thead>
                  <tbody>
                    {data.byCountry.map((c, i) => (
                      <tr key={i}>
                        <td>{c.country.toUpperCase()}</td>
                        <td className="dt-num">{fmtNum(c.clicks)}</td>
                        <td className="dt-num">{fmtNum(c.impressions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {data.sitemaps && data.sitemaps.length > 0 && (
            <div className="dashboard-card" style={{marginTop:16}}>
              <div className="dashboard-card-head">
                <span>Sitemaps</span>
                <Tooltip text="Estado de los sitemaps submitidos a Google. lastDownloaded indica la última vez que Google lo descargó. warnings o errors >0 requieren revisar." />
              </div>
              <table className="dashboard-table">
                <thead><tr><th>Path</th><th>Last submitted</th><th>Last downloaded</th><th>Warnings</th><th>Errors</th></tr></thead>
                <tbody>
                  {data.sitemaps.map((s, i) => (
                    <tr key={i}>
                      <td><a href={s.path} target="_blank" rel="noopener noreferrer">{s.path.replace('https://www.intothecom.com', '')}</a></td>
                      <td className="dt-num">{s.lastSubmitted ? new Date(s.lastSubmitted).toLocaleDateString('es-CL') : '-'}</td>
                      <td className="dt-num">{s.lastDownloaded ? new Date(s.lastDownloaded).toLocaleDateString('es-CL') : '-'}</td>
                      <td className="dt-num" style={{color: s.warnings > 0 ? '#c66800' : 'inherit'}}>{s.warnings || 0}</td>
                      <td className="dt-num" style={{color: s.errors > 0 ? '#c62828' : 'inherit'}}>{s.errors || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// HealthCenter — dashboard "Estado SEO" con 6 cards + hero + lista del día
// ============================================================================
function HealthCard({title, tooltip, mainValue, mainLabel, subItems, verdict, action, loading}) {
  const colors = {
    ok: '#2e7d32', warn: '#f39200', critical: '#c62828', loading: 'rgba(0,0,0,0.3)'
  };
  const icons = { ok: '✅', warn: '⚠️', critical: '🔴', loading: '⏳' };
  const labels = { ok: 'Saludable', warn: 'Revisar', critical: 'Acción urgente', loading: 'Cargando…' };
  const color = colors[verdict] || colors.loading;

  return (
    <div className="health-card">
      <div className="health-card-head">
        <span className="health-card-icon">{icons[verdict] || icons.loading}</span>
        <span className="health-card-title">{title}</span>
        {tooltip && <Tooltip text={tooltip} />}
        <span className="health-card-verdict" style={{color}}>{labels[verdict] || ''}</span>
      </div>
      <div className="health-card-main" style={{color}}>{loading ? '—' : mainValue}</div>
      <div className="health-card-mainlabel">{mainLabel}</div>
      {subItems && subItems.length > 0 && (
        <ul className="health-card-subs">
          {subItems.map((s, i) => <li key={i}><span className="hsub-label">{s.label}:</span> <span className="hsub-value">{s.value}</span></li>)}
        </ul>
      )}
      {action && verdict !== 'ok' && (
        <div className="health-card-action">→ {action}</div>
      )}
    </div>
  );
}

function HealthCenter() {
  const [trends, setTrends] = useState(null);
  const [quickwins, setQuickwins] = useState(null);
  const [contentHealth, setContentHealth] = useState(null);
  const [technical, setTechnical] = useState(null);
  const [penalties, setPenalties] = useState(null);
  const [aiSearch, setAiSearch] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadAll = useCallback(() => {
    setRefreshing(true);
    Promise.allSettled([
      fetch('/api/seo/trends').then(r => r.json()).then(setTrends),
      fetch('/api/seo/quickwins').then(r => r.json()).then(setQuickwins),
      fetch('/api/seo/content-health').then(r => r.json()).then(setContentHealth),
      fetch('/api/seo/technical').then(r => r.json()).then(setTechnical),
      fetch('/api/seo/penalties').then(r => r.json()).then(setPenalties),
      fetch('/api/seo/ai-search').then(r => r.json()).then(setAiSearch)
    ]).finally(() => {
      setRefreshing(false);
      setLastUpdate(new Date());
    });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const fmtPct = (n) => `${(n * 100).toFixed(2)}%`;
  const fmtNum = (n) => (n || 0).toLocaleString('es-CL');
  const fmtDelta = (n, isPct) => {
    if (n == null || isNaN(n)) return '—';
    const sign = n > 0 ? '+' : '';
    return `${sign}${isPct ? n.toFixed(1) + '%' : Math.round(n)}`;
  };

  // ========= Card A: Penalizaciones =========
  const penaltiesVerdict = !penalties ? 'loading'
    : penalties.summary?.overallVerdict === 'critical' ? 'critical'
    : penalties.issues?.length > 0 ? 'warn'
    : 'ok';

  // ========= Card B: Performance vs mes pasado =========
  let perfVerdict = 'loading';
  if (trends) {
    const dc = trends.deltas?.clicksPct;
    const dp = trends.deltas?.position;
    if (dc <= -10 || dp >= 1.0) perfVerdict = 'critical';
    else if (dc >= 5 || dp <= -0.3) perfVerdict = 'ok';
    else perfVerdict = 'warn';
  }

  // ========= Card C: Acción urgente HOY =========
  const totalOps = quickwins?.totalOpportunities || 0;
  const urgentVerdict = !quickwins ? 'loading'
    : totalOps >= 6 ? 'critical' : totalOps >= 2 ? 'warn' : 'ok';

  // ========= Card D: Salud técnica =========
  let techVerdict = 'loading';
  if (technical) techVerdict = technical.summary?.overallVerdict || 'loading';

  // ========= Card E: Calidad contenido =========
  let contentVerdict = 'loading';
  if (contentHealth) {
    if (contentHealth.avgScore >= 80 && contentHealth.daysSinceLastPublish <= 30) contentVerdict = 'ok';
    else if (contentHealth.avgScore < 60 || contentHealth.daysSinceLastPublish > 60) contentVerdict = 'critical';
    else contentVerdict = 'warn';
  }

  // ========= Card F: AI Search =========
  let aiVerdict = 'loading';
  if (aiSearch) aiVerdict = aiSearch.summary?.verdict || 'loading';

  // ========= Hero box =========
  const allVerdicts = [penaltiesVerdict, perfVerdict, urgentVerdict, techVerdict, contentVerdict, aiVerdict];
  const criticalCount = allVerdicts.filter(v => v === 'critical').length;
  const warnCount = allVerdicts.filter(v => v === 'warn').length;
  const loadingCount = allVerdicts.filter(v => v === 'loading').length;

  let heroEmoji, heroMsg, heroColor;
  if (loadingCount === 6) {
    heroEmoji = '⏳'; heroMsg = 'Cargando data de todas las fuentes…'; heroColor = 'rgba(0,0,0,0.3)';
  } else if (criticalCount > 0) {
    heroEmoji = '🔴'; heroMsg = `${criticalCount} ${criticalCount === 1 ? 'item' : 'items'} requieren acción urgente`; heroColor = '#c62828';
  } else if (warnCount > 0) {
    heroEmoji = '⚠️'; heroMsg = `${warnCount} ${warnCount === 1 ? 'item' : 'items'} necesitan revisión esta semana`; heroColor = '#f39200';
  } else {
    heroEmoji = '✅'; heroMsg = 'Todo saludable — sitio en buen estado'; heroColor = '#2e7d32';
  }

  // ========= "Tu lista del día" =========
  const todayList = [];
  if (penalties?.issues?.length > 0) {
    penalties.issues.slice(0, 2).forEach(i => todayList.push({ sev: i.sev, msg: i.msg, source: 'Penalizaciones' }));
  }
  if (quickwins?.strikingDistance?.length > 0) {
    quickwins.strikingDistance.slice(0, 2).forEach(q => todayList.push({
      sev: 'warn',
      msg: `Query "${q.query}" en posición ${q.position.toFixed(1)}. Quick win: subir a top 5 = +${Math.round(q.impressions * 0.04)} clicks/mes.`,
      source: 'Quick Wins'
    }));
  }
  if (trends?.droppedPages?.length > 0) {
    trends.droppedPages.slice(0, 1).forEach(p => todayList.push({
      sev: 'critical',
      msg: `Página ${p.page.replace('https://www.intothecom.com', '')} bajó ${Math.abs(p.deltaClicks)} clicks vs mes pasado.`,
      source: 'Trends'
    }));
  }
  if (contentHealth?.bottomArticles?.[0]?.score < 70) {
    todayList.push({
      sev: 'warn',
      msg: `Artículo "${contentHealth.bottomArticles[0].title}" tiene Quality Score ${contentHealth.bottomArticles[0].score}/100. Issues: ${contentHealth.bottomArticles[0].topIssues.join('; ')}.`,
      source: 'Quality Content'
    });
  }

  return (
    <div>
      <div className="header-row">
        <div className="h1">🎯 Estado SEO</div>
        <button onClick={loadAll} disabled={refreshing} className="btn btn-ghost" style={{padding:'8px 14px',fontSize:13,color:'#1a1a1d',borderColor:'rgba(0,0,0,0.15)'}}>
          {refreshing ? '⏳ Cargando…' : '🔄 Refresh'}
        </button>
      </div>

      {/* Hero box */}
      <div className="health-hero" style={{borderColor: heroColor, background: `${heroColor}0d`}}>
        <div className="health-hero-emoji">{heroEmoji}</div>
        <div className="health-hero-msg" style={{color: heroColor}}>{heroMsg}</div>
        {lastUpdate && <div className="health-hero-update">Actualizado {Math.round((Date.now() - lastUpdate) / 1000)}s atrás</div>}
      </div>

      {/* Grid 3x2 cards */}
      <div className="health-grid">
        <HealthCard
          title="Penalizaciones Google"
          tooltip="Castigos manuales de Google que pueden ocultar tu sitio en búsquedas. Idealmente '0 activas'."
          mainValue={penalties?.errorCount || 0}
          mainLabel={penaltiesVerdict === 'ok' ? 'sin penalizaciones detectadas' : 'errores indexación'}
          verdict={penaltiesVerdict}
          subItems={penalties ? [
            { label: 'URLs muestreadas', value: penalties.sampleSize },
            { label: 'Indexadas OK', value: penalties.indexedCount },
            { label: 'Bloqueadas', value: penalties.blockedCount }
          ] : null}
          action={penalties?.issues?.[0]?.msg ? `Revisar: ${penalties.issues[0].msg}` : null}
          loading={!penalties}
        />

        <HealthCard
          title="Performance vs mes pasado"
          tooltip="Comparación clicks/impresiones/posición últimos 28 días vs los 28 anteriores. Verde si crece >5%, rojo si cae >10%."
          mainValue={trends ? fmtDelta(trends.deltas?.clicksPct, true) : '—'}
          mainLabel="clicks vs mes anterior"
          verdict={perfVerdict}
          subItems={trends ? [
            { label: 'Δ impresiones', value: fmtDelta(trends.deltas?.impressionsPct, true) },
            { label: 'Δ posición', value: fmtDelta(trends.deltas?.position, false) },
            { label: 'Δ CTR', value: trends.deltas?.ctr ? `${(trends.deltas.ctr * 100).toFixed(2)}%` : '—' }
          ] : null}
          action={trends?.droppedPages?.[0] ? `Top caída: ${trends.droppedPages[0].page.replace('https://www.intothecom.com', '')} (${trends.droppedPages[0].deltaClicks} clicks)` : null}
          loading={!trends}
        />

        <HealthCard
          title="Acción urgente HOY"
          tooltip="Quick wins identificados: queries en posición 8-20 (página 2-3 de Google, basta subir un poco para multiplicar clicks 5x) + páginas con CTR sub-óptimo."
          mainValue={totalOps}
          mainLabel={totalOps === 1 ? 'oportunidad activa' : 'oportunidades activas'}
          verdict={urgentVerdict}
          subItems={quickwins ? [
            { label: 'Striking distance', value: quickwins.strikingDistance?.length || 0 },
            { label: 'CTR bajo', value: quickwins.lowCtr?.length || 0 }
          ] : null}
          action={quickwins?.strikingDistance?.[0] ? `Optimizar: "${quickwins.strikingDistance[0].query}" (pos ${quickwins.strikingDistance[0].position.toFixed(1)})` : null}
          loading={!quickwins}
        />

        <HealthCard
          title="Salud técnica"
          tooltip="Velocidad y estabilidad del sitio en mobile/desktop según Core Web Vitals de Google. Verde si todas las métricas están en rango bueno."
          mainValue={technical?.avgScore != null ? technical.avgScore : '—'}
          mainLabel="score Lighthouse promedio"
          verdict={techVerdict}
          subItems={technical?.psiResults ? [
            { label: 'Home mobile', value: technical.psiResults[0]?.data?.score ?? '—' },
            { label: 'Home desktop', value: technical.psiResults[1]?.data?.score ?? '—' },
            { label: 'Errores sitemap', value: technical.sitemaps?.errors || 0 }
          ] : null}
          action={technical?.issues?.[0]?.msg ? technical.issues[0].msg.slice(0, 80) + '…' : null}
          loading={!technical}
        />

        <HealthCard
          title="Calidad del contenido"
          tooltip="Quality Score promedio de todos los artículos publicados (0-100). Verde si avg ≥80 y último publish fue hace <30 días."
          mainValue={contentHealth?.avgScore != null ? `${contentHealth.avgScore}/100` : '—'}
          mainLabel={`${contentHealth?.total || 0} artículos publicados`}
          verdict={contentVerdict}
          subItems={contentHealth ? [
            { label: 'Artículos < 80 score', value: contentHealth.articlesUnder80 },
            { label: 'Último publish', value: contentHealth.daysSinceLastPublish === 0 ? 'hoy' : `hace ${contentHealth.daysSinceLastPublish}d` },
            { label: 'Total críticos', value: contentHealth.totalCriticalIssues }
          ] : null}
          action={contentHealth?.bottomArticles?.[0]?.score < 70 ? `Mejorar: ${contentHealth.bottomArticles[0].title.slice(0, 60)}…` : null}
          loading={!contentHealth}
        />

        <HealthCard
          title="AI Search (ChatGPT/Copilot)"
          tooltip="Cuántas veces tu sitio fue citado en Microsoft Copilot, ChatGPT search y Bing Chat en los últimos 28 días. Verde si ≥50 citations."
          mainValue={aiSearch?.summary?.totalBingClicks ?? '—'}
          mainLabel="clicks desde AI engines"
          verdict={aiVerdict}
          subItems={aiSearch ? [
            { label: 'Impresiones Bing', value: fmtNum(aiSearch.summary?.totalBingImpressions || 0) },
            { label: 'Top grounding queries', value: (aiSearch.summary?.topGroundingQueries || []).length },
            { label: 'API Bing', value: aiSearch.bingApiConfigured ? '✓ configurada' : '⚠ falta key' }
          ] : null}
          action={!aiSearch?.bingApiConfigured ? 'Agregar BING_API_KEY en Vercel env vars' : (aiSearch?.summary?.recommendations?.[0] || null)}
          loading={!aiSearch}
        />
      </div>

      {/* Tu lista del día */}
      {todayList.length > 0 && (
        <div className="health-todo">
          <h2 className="health-todo-title">📋 Tu lista del día</h2>
          <ul className="health-todo-list">
            {todayList.map((item, i) => (
              <li key={i} className={`health-todo-item htodo-${item.sev}`}>
                <span className="htodo-icon">{item.sev === 'critical' ? '🔴' : item.sev === 'warn' ? '🟡' : 'ℹ️'}</span>
                <div className="htodo-body">
                  <div className="htodo-msg">{item.msg}</div>
                  <div className="htodo-source">{item.source}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="health-footer">
        <div>
          Última actualización: {lastUpdate ? `${Math.round((Date.now() - lastUpdate) / 1000)}s atrás` : '—'} ·
          GSC: {trends ? '✓' : '⏳'} ·
          PSI: {technical ? '✓' : '⏳'} ·
          Bing: {aiSearch?.bingApiConfigured ? '✓' : '✗'}
        </div>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="hfooter-link">Abrir GSC</a>
          <a href="https://www.bing.com/webmasters/" target="_blank" rel="noopener noreferrer" className="hfooter-link">Abrir Bing WMT</a>
          <a href="https://www.intothecom.com/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hfooter-link">Ver sitemap</a>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AdminApp (lista + editor + dashboard + health center)
// ============================================================================
function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [plannedPillars, setPlannedPillars] = useState([]);
  const [sha, setSha] = useState(null);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        setUser(d.authenticated ? d : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadArticles = useCallback(() => {
    fetch('/api/articles/list')
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          showToast('Error cargando articulos: ' + d.error, 'error');
          return;
        }
        setArticles(d.articles || []);
        setPlannedPillars(d.plannedPillars || []);
        setSha(d.sha);
      });
  }, []);

  useEffect(() => {
    if (user) loadArticles();
  }, [user, loadArticles]);

  const handleEdit = (article) => {
    setEditing({article: JSON.parse(JSON.stringify(article)), isNew: false});
    setView('editor');
  };
  const handleNew = () => {
    setEditing({article: newArticle(), isNew: true});
    setView('editor');
  };

  const handleSave = async (updated) => {
    updated.updatedAt = new Date().toISOString().split('T')[0];
    if (editing.isNew && !updated.publishedAt) updated.publishedAt = updated.updatedAt;

    let nextArticles;
    if (editing.isNew) {
      if (articles.some(a => a.slug === updated.slug)) {
        showToast('Ya existe un articulo con ese slug', 'error');
        return;
      }
      nextArticles = [updated, ...articles];
    } else {
      nextArticles = articles.map(a => a.slug === updated.slug ? updated : a);
    }

    showToast('Guardando + commit a GitHub...', 'info');
    try {
      const res = await fetch('/api/articles/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({articles: nextArticles, plannedPillars: plannedPillars, sha: sha})
      });
      const d = await res.json();
      if (!res.ok) {
        showToast('Error: ' + (d.error || res.statusText), 'error');
        return;
      }
      showToast('Guardado. Vercel redeployara en 30-60s. IndexNow notificado a Bing/Yandex.', 'success');
      setArticles(nextArticles);
      setSha(d.newSha);
      setView('list');
      setEditing(null);
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm(`¿Eliminar el artículo "${slug}"? Esta acción se commitea a Git y removerá la página de produccion.`)) return;
    const nextArticles = articles.filter(a => a.slug !== slug);
    showToast('Eliminando...', 'info');
    try {
      const res = await fetch('/api/articles/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({articles: nextArticles, plannedPillars: plannedPillars, sha: sha})
      });
      const d = await res.json();
      if (!res.ok) {
        showToast('Error: ' + (d.error || res.statusText), 'error');
        return;
      }
      showToast('Eliminado. Vercel redeployara.', 'success');
      setArticles(nextArticles);
      setSha(d.newSha);
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
  };

  // Stats globales para dashboard
  const stats = useMemo(() => {
    const scores = articles.map(a => computeQualityScore(a));
    const avgScore = scores.length ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0;
    const needsAttention = scores.filter(s => s.counts.criticalCount > 0).length;
    const totalIssues = scores.reduce((sum, s) => sum + s.counts.criticalCount + s.counts.warnCount, 0);
    return {avgScore, needsAttention, totalIssues, total: articles.length};
  }, [articles]);

  if (loading) return <div style={{padding:40,textAlign:'center',color:'rgba(0,0,0,0.5)'}}>Cargando...</div>;
  if (!user) return <LoginScreen/>;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" style={{display:'flex',flexDirection:'column'}}>
        <div className="admin-brand">Intothecom</div>
        <div className="admin-brand-sub">ADMIN · CONTENT</div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${view === 'list' ? 'active' : ''}`} onClick={() => {setView('list'); setEditing(null);}}>
            📝 Artículos ({articles.length})
          </button>
          <button className="admin-nav-item" onClick={handleNew}>
            ＋ Nuevo artículo
          </button>
          <button className={`admin-nav-item ${view === 'health' ? 'active' : ''}`} onClick={() => {setView('health'); setEditing(null);}}>
            🎯 Estado SEO
          </button>
          <button className={`admin-nav-item ${view === 'seo' ? 'active' : ''}`} onClick={() => {setView('seo'); setEditing(null);}}>
            📊 SEO Dashboard
          </button>
          <div className="admin-divider" />
          <a className="admin-nav-item" href="https://github.com/imc400/intothecom/commits/main" target="_blank" rel="noopener noreferrer">
            🔍 Ver commits GitHub
          </a>
          <a className="admin-nav-item" href="https://vercel.com/ignacios-projects-91899df9/intothecom/deployments" target="_blank" rel="noopener noreferrer">
            🚀 Ver deploys Vercel
          </a>
          <a className="admin-nav-item" href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
            🔎 Google Search Console
          </a>
          <a className="admin-nav-item" href="https://www.bing.com/webmasters/" target="_blank" rel="noopener noreferrer">
            🔍 Bing Webmaster
          </a>
          <div className="admin-divider" />
          <a className="admin-nav-item" href="https://intothecom.com" target="_blank" rel="noopener noreferrer">
            🏠 Ver sitio público
          </a>
        </nav>
        <div className="admin-user">
          <div className="admin-user-email">{user.email}</div>
          <a href="/api/auth/logout" style={{color:'#f39200',textDecoration:'none',fontSize:12}}>Cerrar sesión</a>
        </div>
      </aside>

      <main className="admin-main">
        {view === 'list' && (
          <>
            <div className="header-row">
              <div className="h1">Artículos publicados</div>
              <button onClick={handleNew} className="btn btn-primary">＋ Nuevo artículo</button>
            </div>

            {/* Dashboard stats globales */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total artículos</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Quality Score promedio</div>
                <div className="stat-value" style={{color: getScoreColor(stats.avgScore)}}>{stats.avgScore}/100</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Requieren intervención</div>
                <div className="stat-value" style={{color: stats.needsAttention > 0 ? '#c62828' : '#2e7d32'}}>{stats.needsAttention}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total issues abiertas</div>
                <div className="stat-value" style={{color: stats.totalIssues > 0 ? '#f39200' : '#2e7d32'}}>{stats.totalIssues}</div>
              </div>
            </div>

            {articles.length === 0 && (
              <div className="empty-state">
                No hay artículos. Click "Nuevo artículo" para crear el primero.
              </div>
            )}
            <div className="article-list">
              {articles.map(a => {
                const {score, counts} = computeQualityScore(a);
                return (
                  <div key={a.slug} className="article-item">
                    <div className="article-item-row">
                      <div style={{flex:1}}>
                        <div className="article-item-title">{a.title}</div>
                        <div className="article-item-meta">
                          {a.type || 'pillar'} · {a.category} · {a.readingTime} · {counts.wordCount} palabras · slug: {a.slug}
                        </div>
                        <div style={{fontSize:13,color:'rgba(0,0,0,0.65)',marginTop:4}}>{a.description?.substring(0, 160)}{a.description?.length > 160 ? '…' : ''}</div>
                      </div>
                      <div className="article-quality-badge" style={{borderColor: getScoreColor(score)}}>
                        <div className="article-quality-score" style={{color: getScoreColor(score)}}>{score}</div>
                        <div className="article-quality-label">/100</div>
                        {counts.criticalCount > 0 && <div className="article-quality-critical">🔴 {counts.criticalCount}</div>}
                        {counts.criticalCount === 0 && counts.warnCount > 0 && <div className="article-quality-warn">🟡 {counts.warnCount}</div>}
                        {counts.criticalCount === 0 && counts.warnCount === 0 && <div className="article-quality-ok">✅</div>}
                      </div>
                    </div>
                    <div className="row-buttons" style={{marginTop:10}}>
                      <button onClick={() => handleEdit(a)}>editar</button>
                      <a href={`https://intothecom.com/recursos/${a.slug}`} target="_blank" rel="noopener noreferrer" style={{display:'inline-block',background:'rgba(26,26,29,0.05)',color:'#1a1a1d',padding:'4px 10px',fontSize:11,fontFamily:'JetBrains Mono, monospace',textTransform:'uppercase',letterSpacing:1,border:'1px solid transparent',borderRadius:4,textDecoration:'none'}}>ver público</a>
                      <button onClick={() => handleDelete(a.slug)} className="danger">eliminar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === 'editor' && editing && (
          <ArticleEditor
            article={editing.article}
            isNew={editing.isNew}
            onSave={handleSave}
            onCancel={() => {setView('list'); setEditing(null);}}
            allArticles={articles}
          />
        )}

        {view === 'health' && <HealthCenter />}
        {view === 'seo' && <SeoDashboard />}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('admin-root'));
root.render(<AdminApp />);
