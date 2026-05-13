/* admin.jsx — SPA del admin panel.
   Flow: LoginGate -> ArticleList -> ArticleEditor.
   Auth: cookie httpOnly JWT (api/auth/*). Datos: api/articles/list + save. */

const { useState, useEffect, useRef, useCallback } = React;

const SECTION_TYPES = [
  {value: 'h2', label: 'Subtítulo H2'},
  {value: 'h3', label: 'Sub-subtítulo H3'},
  {value: 'p', label: 'Párrafo'},
  {value: 'list', label: 'Lista (bullet)'},
  {value: 'table', label: 'Tabla'},
  {value: 'cta', label: 'CTA WhatsApp'}
];

const CATEGORIES = ['Estrategia', 'Software & IA', 'Paid Media', 'Email Marketing', 'Desarrollo Web', 'Community Management'];
const INTENTS = ['Informational', 'Commercial/Informational', 'Commercial', 'Transactional'];
const WA_KEYS = ['default', 'software-ia', 'paid-media', 'email-marketing', 'desarrollo-web', 'community-management'];

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

function SectionEditor({section, onChange, onDelete, onMoveUp, onMoveDown}) {
  const update = (k, v) => onChange({...section, [k]: v});

  let body;
  if (section.type === 'h2' || section.type === 'h3') {
    body = (
      <>
        <div className="form-field">
          <label>Texto del {section.type.toUpperCase()}</label>
          <input value={section.text || ''} onChange={e => update('text', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Anchor ID (opcional, auto-genera del texto)</label>
          <input value={section.id || ''} onChange={e => update('id', e.target.value)} placeholder={slugify(section.text || '')} />
        </div>
      </>
    );
  } else if (section.type === 'p') {
    body = (
      <div className="form-field">
        <label>Párrafo (usa **negrita** con dobles asteriscos)</label>
        <textarea value={section.text || ''} onChange={e => update('text', e.target.value)} rows={4} />
      </div>
    );
  } else if (section.type === 'list') {
    const items = section.items || [];
    return (
      <div className="section-block">
        <div className="section-block-head">
          <span>Lista</span>
          <div className="row-buttons">
            <button onClick={onMoveUp}>↑</button>
            <button onClick={onMoveDown}>↓</button>
            <button onClick={onDelete} className="danger">eliminar</button>
          </div>
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
          <span>Tabla</span>
          <div className="row-buttons">
            <button onClick={onMoveUp}>↑</button>
            <button onClick={onMoveDown}>↓</button>
            <button onClick={onDelete} className="danger">eliminar</button>
          </div>
        </div>
        <div className="form-field">
          <label>Headers (separados por |)</label>
          <input
            value={headers.join(' | ')}
            onChange={e => update('headers', e.target.value.split('|').map(s => s.trim()))}
          />
        </div>
        <div className="form-field">
          <label>Filas (cada fila en línea aparte, columnas separadas por |)</label>
          <textarea
            rows={Math.max(3, rows.length)}
            value={rows.map(r => r.join(' | ')).join('\n')}
            onChange={e => {
              const next = e.target.value.split('\n').filter(l => l.trim()).map(l => l.split('|').map(s => s.trim()));
              update('rows', next);
            }}
            style={{fontFamily:'JetBrains Mono, monospace',fontSize:12}}
          />
        </div>
      </div>
    );
  } else if (section.type === 'cta') {
    body = (
      <>
        <div className="form-field">
          <label>Texto del botón</label>
          <input value={section.text || ''} onChange={e => update('text', e.target.value)} placeholder="Cotizar por WhatsApp" />
        </div>
        <div className="form-field">
          <label>WhatsApp key (cuál mensaje pre-llenado)</label>
          <select value={section.waKey || 'default'} onChange={e => update('waKey', e.target.value)}>
            {WA_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </>
    );
  }

  return (
    <div className="section-block">
      <div className="section-block-head">
        <span>{section.type.toUpperCase()}</span>
        <div className="row-buttons">
          <button onClick={onMoveUp}>↑</button>
          <button onClick={onMoveDown}>↓</button>
          <button onClick={onDelete} className="danger">eliminar</button>
        </div>
      </div>
      {body}
    </div>
  );
}

function ArticleEditor({article, onSave, onCancel, isNew}) {
  const [draft, setDraft] = useState(article);
  const [saving, setSaving] = useState(false);
  const update = (k, v) => setDraft(d => ({...d, [k]: v}));

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

  const handleSave = async () => {
    if (!draft.title || !draft.slug || !draft.description) {
      showToast('Faltan campos obligatorios: title, slug, description', 'error');
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="header-row">
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
        <strong>Antes de publicar</strong>: el cambio se commitea a GitHub con tu email y Vercel redeploya producción en ~30-60s. Verifica todo dos veces.
      </div>

      <div className="h2-section">Metadata</div>
      <div className="form-grid-2">
        <div className="form-field">
          <label>Título (H1 del artículo)</label>
          <input
            value={draft.title || ''}
            onChange={e => {
              update('title', e.target.value);
              if (isNew && !draft.slug) update('slug', slugify(e.target.value) + '-2026');
            }}
          />
        </div>
        <div className="form-field">
          <label>Slug (URL /recursos/<b>{draft.slug || 'slug'}</b>)</label>
          <input value={draft.slug || ''} onChange={e => update('slug', slugify(e.target.value))} disabled={!isNew}/>
        </div>
      </div>
      <div className="form-field">
        <label>Meta description (150-160 chars, aparece en Google y previews)</label>
        <textarea value={draft.description || ''} onChange={e => update('description', e.target.value)} rows={2}/>
      </div>
      <div className="form-grid-2">
        <div className="form-field">
          <label>Categoría</label>
          <select value={draft.category || 'Estrategia'} onChange={e => update('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Intent</label>
          <select value={draft.intent || 'Informational'} onChange={e => update('intent', e.target.value)}>
            {INTENTS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Reading time (ej: "14 min")</label>
          <input value={draft.readingTime || ''} onChange={e => update('readingTime', e.target.value)}/>
        </div>
        <div className="form-field">
          <label>Word count (estimado)</label>
          <input type="number" value={draft.wordCount || 0} onChange={e => update('wordCount', parseInt(e.target.value) || 0)}/>
        </div>
        <div className="form-field">
          <label>Author name</label>
          <input value={draft.author || 'Ignacio Blanco'} onChange={e => update('author', e.target.value)}/>
        </div>
        <div className="form-field">
          <label>Author role</label>
          <input value={draft.authorRole || 'Co-founder & Strategy Lead'} onChange={e => update('authorRole', e.target.value)}/>
        </div>
        <div className="form-field">
          <label>Author slug (interno)</label>
          <input value={draft.authorSlug || 'ignacio-blanco'} onChange={e => update('authorSlug', e.target.value)}/>
        </div>
        <div className="form-field">
          <label>Hero image path</label>
          <input value={draft.heroImage || ''} onChange={e => update('heroImage', e.target.value)} placeholder={`/assets/blog/${draft.slug || 'slug'}.jpg`}/>
        </div>
      </div>

      <div className="form-field">
        <label>Keyword principal</label>
        <input value={draft.keyword || ''} onChange={e => update('keyword', e.target.value)}/>
      </div>
      <div className="form-field">
        <label>Secondary keywords (separadas por coma)</label>
        <input
          value={(draft.secondaryKeywords || []).join(', ')}
          onChange={e => update('secondaryKeywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
        />
      </div>
      <div className="form-field">
        <label>Tags (separados por coma)</label>
        <input
          value={(draft.tags || []).join(', ')}
          onChange={e => update('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
        />
      </div>

      <div className="h2-section">TL;DR (200-300 palabras, primer párrafo &lt;80 palabras para ventana extracción LLM)</div>
      <div className="form-field">
        <textarea value={draft.tldr || ''} onChange={e => update('tldr', e.target.value)} rows={5}/>
      </div>

      <div className="h2-section">Secciones del artículo ({(draft.sections || []).length})</div>
      {(draft.sections || []).map((s, i) => (
        <SectionEditor
          key={i}
          section={s}
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

      <div className="h2-section">FAQ (mínimo 5 preguntas reales)</div>
      {(draft.faq || []).map((qa, i) => (
        <div key={i} className="section-block">
          <div className="section-block-head">
            <span>FAQ {i+1}</span>
            <button onClick={() => removeFaq(i)} className="btn-danger" style={{padding:'4px 10px',fontSize:11,fontFamily:'JetBrains Mono, monospace',textTransform:'uppercase',letterSpacing:1,borderRadius:4,border:'none',cursor:'pointer'}}>eliminar</button>
          </div>
          <div className="form-field">
            <label>Pregunta</label>
            <input value={qa.q} onChange={e => updateFaq(i, 'q', e.target.value)}/>
          </div>
          <div className="form-field">
            <label>Respuesta (50-150 palabras)</label>
            <textarea value={qa.a} onChange={e => updateFaq(i, 'a', e.target.value)} rows={3}/>
          </div>
        </div>
      ))}
      <button onClick={addFaq} className="add-section">+ Pregunta FAQ</button>

      <div className="h2-section">Sources externas (mínimo 3 — sube citation rate en LLMs +115%)</div>
      {(draft.sources || []).map((s, i) => (
        <div key={i} className="section-block">
          <div className="section-block-head">
            <span>Source {i+1}</span>
            <button onClick={() => removeSource(i)} className="btn-danger" style={{padding:'4px 10px',fontSize:11,fontFamily:'JetBrains Mono, monospace',textTransform:'uppercase',letterSpacing:1,borderRadius:4,border:'none',cursor:'pointer'}}>eliminar</button>
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Nombre de la fuente</label>
              <input value={s.name} onChange={e => updateSource(i, 'name', e.target.value)}/>
            </div>
            <div className="form-field">
              <label>URL</label>
              <input value={s.url} onChange={e => updateSource(i, 'url', e.target.value)}/>
            </div>
          </div>
        </div>
      ))}
      <button onClick={addSource} className="add-section">+ Source</button>

      <div className="h2-section">Related slugs (cross-link a otros artículos)</div>
      <div className="form-field">
        <input
          value={(draft.relatedSlugs || []).join(', ')}
          onChange={e => update('relatedSlugs', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="marketing-digital-b2b-latam-2026, agentes-ia-para-empresas-2026"
        />
      </div>

      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:32,paddingTop:24,borderTop:'1px solid rgba(0,0,0,0.08)'}}>
        <button onClick={onCancel} className="btn btn-ghost" style={{color:'#1a1a1d',borderColor:'rgba(0,0,0,0.15)'}}>Cancelar</button>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar y publicar'}
        </button>
      </div>
    </div>
  );
}

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
    wordCount: 2000,
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

function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [plannedPillars, setPlannedPillars] = useState([]);
  const [sha, setSha] = useState(null);
  const [view, setView] = useState('list'); // list | editor
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
    if (editing.isNew && !updated.publishedAt) {
      updated.publishedAt = updated.updatedAt;
    }

    let nextArticles;
    if (editing.isNew) {
      if (articles.some(a => a.slug === updated.slug)) {
        showToast('Ya existe un articulo con ese slug', 'error');
        return;
      }
      nextArticles = [...articles, updated];
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
      showToast('Guardado. Vercel redeployara en 30-60s.', 'success');
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

  if (loading) {
    return <div style={{padding:40,textAlign:'center',color:'rgba(0,0,0,0.5)'}}>Cargando...</div>;
  }

  if (!user) {
    return <LoginScreen/>;
  }

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
          <a className="admin-nav-item" href="https://github.com/imc400/intothecom/commits/main" target="_blank" rel="noopener noreferrer">
            🔍 Ver commits en GitHub
          </a>
          <a className="admin-nav-item" href="https://vercel.com/ignacios-projects-91899df9/intothecom/deployments" target="_blank" rel="noopener noreferrer">
            🚀 Ver deploys Vercel
          </a>
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
            {articles.length === 0 && (
              <div className="empty-state">
                No hay artículos. Click "Nuevo artículo" para crear el primero.
              </div>
            )}
            <div className="article-list">
              {articles.map(a => (
                <div key={a.slug} className="article-item">
                  <div className="article-item-title">{a.title}</div>
                  <div className="article-item-meta">
                    {a.category} · {a.readingTime} · {a.wordCount} palabras · slug: {a.slug}
                  </div>
                  <div style={{fontSize:13,color:'rgba(0,0,0,0.65)',marginTop:4}}>{a.description?.substring(0, 160)}{a.description?.length > 160 ? '…' : ''}</div>
                  <div className="row-buttons" style={{marginTop:8}}>
                    <button onClick={() => handleEdit(a)}>editar</button>
                    <a href={`https://intothecom.com/recursos/${a.slug}`} target="_blank" rel="noopener noreferrer" style={{display:'inline-block',background:'rgba(26,26,29,0.05)',color:'#1a1a1d',padding:'4px 10px',fontSize:11,fontFamily:'JetBrains Mono, monospace',textTransform:'uppercase',letterSpacing:1,border:'1px solid transparent',borderRadius:4,textDecoration:'none'}}>ver público</a>
                    <button onClick={() => handleDelete(a.slug)} className="danger">eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'editor' && editing && (
          <ArticleEditor
            article={editing.article}
            isNew={editing.isNew}
            onSave={handleSave}
            onCancel={() => {setView('list'); setEditing(null);}}
          />
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('admin-root'));
root.render(<AdminApp/>);
