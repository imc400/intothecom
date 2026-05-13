# Edición de contenido — Guía para el equipo de IntoTheCom

Workflow para crear y editar artículos del blog sin tocar terminal.

---

## 🎯 Quién puede editar

Cualquier persona del equipo IntoTheCom con cuenta GitHub que sea **collaborator** del repo `imc400/intothecom`.

Para añadir un collaborator:
1. Owner del repo → Settings → Collaborators
2. Invite by username
3. La persona acepta la invitación por email

---

## ✍️ Crear un artículo nuevo

### Paso 1: Abrir el archivo de artículos en GitHub

Ir a [github.com/imc400/intothecom/blob/main/data/articles.js](https://github.com/imc400/intothecom/blob/main/data/articles.js)

Click en el **lápiz** (icono Edit, top-right del archivo).

### Paso 2: Copiar la plantilla

Busca el final del array `ARTICLES` (justo antes del `]` que cierra el array, alrededor de la línea 270). Copia esta plantilla **dentro del array**, después de una coma:

```javascript
,
{
  slug: 'mi-articulo-nuevo-2026',                     // URL: /recursos/mi-articulo-nuevo-2026
  type: 'pillar',                                      // 'pillar' o 'cluster'
  cluster: 'marketing-digital-latam',                  // nombre del cluster
  title: 'Título del artículo: subtítulo descriptivo',
  description: 'Meta description 150-160 caracteres. Esto aparece en Google y en previews sociales.',
  publishedAt: '2026-05-13',                           // YYYY-MM-DD
  updatedAt: '2026-05-13',
  author: 'Ignacio Blanco',                            // Nombre completo
  authorRole: 'Co-founder & Strategy Lead',
  authorSlug: 'ignacio-blanco',
  category: 'Estrategia',                              // Para el breadcrumb
  readingTime: '12 min',
  wordCount: 2500,
  keyword: 'keyword principal',
  secondaryKeywords: [
    'variante 1',
    'variante 2',
    'variante 3'
  ],
  intent: 'Informational',                             // Informational, Commercial, Transactional
  tags: ['Tag1', 'Tag2'],
  heroImage: '/assets/blog/mi-articulo-nuevo-2026.jpg',
  tldr: 'Resumen ejecutivo de 200-300 palabras. Este es el bloque que LLMs y AI Overviews usan más para citar. Empezar con una respuesta directa a la pregunta principal del artículo. Después contexto y por qué importa.',
  sections: [
    { type: 'h2', id: 'primera-seccion', text: '¿Pregunta del primer H2?' },
    { type: 'p', text: 'Párrafo de respuesta. Si quieres **negrita** úsala con dobles asteriscos.' },
    { type: 'p', text: 'Otro párrafo.' },
    { type: 'h3', id: 'sub-seccion', text: 'Sub-sección H3' },
    { type: 'list', items: [
      '**Item 1**: descripción con negrita en el comienzo.',
      'Item 2 sin negrita.',
      'Item 3.'
    ] },
    { type: 'h2', id: 'segunda-seccion', text: 'Segundo H2' },
    { type: 'p', text: 'Más contenido.' },
    { type: 'table',
      headers: ['Col 1', 'Col 2', 'Col 3'],
      rows: [
        ['Fila 1 col 1', 'Fila 1 col 2', 'Fila 1 col 3'],
        ['Fila 2 col 1', 'Fila 2 col 2', 'Fila 2 col 3']
      ]
    },
    { type: 'cta', text: 'Cotizar por WhatsApp', waKey: 'default' }  // waKey: default, paid-media, email-marketing, desarrollo-web, community-management, software-ia
  ],
  faq: [
    { q: '¿Pregunta 1?', a: 'Respuesta 1 con 50-100 palabras.' },
    { q: '¿Pregunta 2?', a: 'Respuesta 2.' },
    { q: '¿Pregunta 3?', a: 'Respuesta 3.' },
    { q: '¿Pregunta 4?', a: 'Respuesta 4.' },
    { q: '¿Pregunta 5?', a: 'Respuesta 5.' }
  ],
  relatedSlugs: [],
  sources: [
    { name: 'Nombre de la fuente externa', url: 'https://ejemplo.com/articulo' },
    { name: 'Otra fuente', url: 'https://otro.com' }
  ]
}
```

### Paso 3: Llenar el contenido

Reemplaza todos los placeholders con tu contenido real. Reglas:

| Campo | Reglas |
|---|---|
| `slug` | kebab-case, sin tildes, único, NO cambiar después de publicar |
| `title` | 50-70 caracteres ideal, debe incluir el keyword principal |
| `description` | 150-160 caracteres, debe convencer click |
| `tldr` | 200-300 palabras, primer párrafo <80 palabras (ventana de extracción LLM) |
| `sections` | Mínimo 6 H2, máximo 12 |
| `faq` | Mínimo 5 preguntas reales (no inventadas) |
| `sources` | Mínimo 3 fuentes externas creíbles (papers, gov, .edu, .org, medios) |
| `wordCount` | Pillar 2,500-4,000 / Cluster 1,500-2,500 |

### Paso 4: Preview antes de commit

GitHub no tiene preview del artículo renderizado (porque es JS, no MD). Para previewar:

**Opción A**: Crear branch nuevo desde la UI de GitHub
1. Antes de commit, abajo del editor selecciona **"Create a new branch for this commit and start a pull request"**
2. Pon un nombre descriptivo: `post/mi-articulo-nuevo`
3. Click **Propose changes**
4. Click **Create pull request**
5. Vercel deploya preview URL automáticamente
6. Comentas, ajustas si es necesario

**Opción B** (solo si confías en tu contenido): commit directo a `main`. Vercel deploya producción directamente.

### Paso 5: Update sitemap.xml

Después de publicar el artículo, agregar su URL al [sitemap.xml](https://github.com/imc400/intothecom/blob/main/sitemap.xml). Antes de `</urlset>` agrega:

```xml
<url>
  <loc>https://intothecom.com/recursos/MI-SLUG</loc>
  <lastmod>2026-05-13</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.85</priority>
</url>
```

Commit y Vercel deploya. Google detecta el nuevo URL en la próxima visita a sitemap.xml.

---

## 🖼️ Subir imagen hero del artículo

Las imágenes hero van en `/assets/blog/`. Para subir desde GitHub web:

1. Ir a [github.com/imc400/intothecom/tree/main/assets/blog](https://github.com/imc400/intothecom/tree/main/assets/blog) (crea el folder si no existe yendo a `/assets/` y agregando `/blog/`)
2. Click **Add file → Upload files**
3. Drag tu imagen 1200×675 px (WebP o JPG)
4. Naming: usar el mismo slug del artículo: `mi-articulo-nuevo-2026.webp`
5. Commit

Referenciarla en el artículo: `heroImage: '/assets/blog/mi-articulo-nuevo-2026.webp'`

---

## ✏️ Editar un artículo existente

1. Ir a [github.com/imc400/intothecom/blob/main/data/articles.js](https://github.com/imc400/intothecom/blob/main/data/articles.js)
2. Click lápiz → editar el objeto del artículo (buscar por su `slug`)
3. Actualizar `updatedAt: '2026-MM-DD'` (importante para freshness signal)
4. Si cambios son sustanciales, también actualizar `<lastmod>` en sitemap.xml
5. Commit → Vercel redeploya

**Por qué importa `updatedAt`**: Google y AI search priorizan contenido fresh. Perplexity cita 82% de URLs <30 días. Refresh quarterly da +42% lift vs annual.

---

## 🔄 Workflow recomendado (cadencia 2 piezas/semana)

| Día | Tarea |
|---|---|
| Lunes | Brief del artículo del martes (research + outline) |
| Martes | Escribir + commit + publish artículo 1 |
| Miércoles | Distribuir artículo 1 (LinkedIn, X, IG, newsletter) |
| Jueves | Escribir + commit + publish artículo 2 |
| Viernes | Distribuir artículo 2 + plan siguiente semana |

---

## ❓ FAQ del editor

**¿Y si rompo la sintaxis JS?**
Vercel detecta el error en el build y NO deploya el sitio roto. El sitio sigue funcionando con la versión anterior. Tú ves el error en GitHub Actions o en Vercel dashboard.

**¿Cuántas personas pueden editar al mismo tiempo?**
GitHub permite ediciones concurrentes. Si dos personas editan el mismo archivo, la segunda recibe un merge conflict y debe resolverlo. Coordinación informal por Slack/WhatsApp suficiente para equipos chicos.

**¿Hay versionado / rollback?**
Sí, automático vía Git. En el repo: cada commit es una versión. Para revertir: ir al commit anterior y restore.

**¿Cómo veo el artículo antes de publicarlo en producción?**
Crea PR (no commit a main). Vercel genera preview URL en el PR. Comparte ese URL con stakeholders. Cuando todos OK, merge a main.

**¿El sitio se rompe si elimino un artículo?**
No. Si eliminas un objeto del array, el artículo deja de aparecer en `/recursos` y su URL `/recursos/SLUG` muestra 404 elegante. Si quieres que la URL permanezca con redirect, hay que agregar regla en `vercel.json`.

---

## 📞 Soporte

- Issues técnicos: crear issue en [github.com/imc400/intothecom/issues](https://github.com/imc400/intothecom/issues)
- Dudas editoriales: pregunta directa en el canal del equipo
