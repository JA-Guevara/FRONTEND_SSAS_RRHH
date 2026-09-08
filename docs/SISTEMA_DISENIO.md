# Sistema de diseño

Contrato visual único del producto. **Toda pantalla nueva o migrada debe cumplirlo.**

## Reglas duras

1. **Un solo `:root`**: `src/shared/styles/tokens.css`. Ningún otro archivo declara variables globales.
2. **Prohibido el color literal.** Nada de `#176b4b`, `rgb(...)` ni `#fff` fuera de `shared/styles`. Se usa `var(--brand)`, `var(--paper)`, etc.
3. **Prohibido el CSS por feature.** No existen `vacantes.css`, `tablero.css`, `organizacion.css` ni `portal.css`. Lo que una pantalla necesite se añade a `shared/styles/components.css` como componente reutilizable.
4. **Prohibido `style={{ }}` inline** salvo un valor calculado en tiempo de ejecución (por ejemplo el ancho de una barra de progreso).
5. **Prohibido `window.confirm` / `window.alert`.** Se usa `<ConfirmDialog />`.
6. **Prohibido el tamaño en píxeles** para tipografía y espaciado: se usan los tokens `--text-*` y `--space-*`.
7. **Toda lista tiene los cuatro estados**: cargando, error (con reintento), vacío y con datos. `<DataTable />` ya los resuelve.
8. **Todo listado paginado por el backend se pagina en la UI** con `<Pagination />`. Nada de `per_page: 100` fijo.
9. **Un error nunca se muestra como lista vacía** y nunca se traga con `catch {}`.
10. **Toda acción destructiva o de escritura se oculta si falta el permiso**, con `<Can permisos={[...]}>`.

## Archivos de estilo

| Archivo | Contenido |
|---|---|
| `shared/styles/tokens.css` | Único `:root`: color, tipografía, espaciado, radios, sombras, alturas de control, z-index. |
| `shared/styles/base.css` | Reinicio y elementos base. **Aquí vive la escala de títulos**: una página nunca redefine su `h1`. |
| `shared/styles/components.css` | Botones, campos, paneles, tablas, badges, modales, paginación, estados. |
| `shared/styles/layout.css` | `app-shell`, barra lateral, contenido, cabecera de página y pantallas de acceso. |
| `shared/styles/global.css` | Solo los cuatro `@import`. Es lo único que importa `main.tsx`. |

## Componentes disponibles

Todos se importan desde `shared/components`:

```tsx
import { Alert, Badge, Button, ConfirmDialog, DataTable, EmptyState, EstadoBadge,
         Field, LoadingBlock, Modal, PageHeader, Pagination, Panel, Spinner } from '../../../shared/components'
```

| Componente | Props principales |
|---|---|
| `Button` | `variant`: primary \| secondary \| ghost \| danger \| danger-outline \| quiet · `size`: sm \| md \| lg · `loading` · `block` |
| `Field` | `label`, `error`, `hint`; envuelve un `<input>`, `<select>` o `<textarea>` nativo |
| `PageHeader` | `title`, `eyebrow`, `description`, `actions` |
| `Panel` | `title`, `eyebrow`, `count`, `actions` |
| `DataTable` | `columns`, `rows`, `rowKey`, `loading`, `error`, `onRetry`, `emptyMessage`, `caption` |
| `Pagination` | `page`, `perPage`, `total`, `onPageChange`, `onPerPageChange` |
| `Modal` | `title`, `onClose`, `footer`, `size`; cierra con Escape y atrapa el foco |
| `ConfirmDialog` | `title`, `message`, `tone`, `loading`, `error`, `onConfirm`, `onCancel` |
| `Badge` / `EstadoBadge` | `tone` \| `estado` (mapa único estado→color para todo el producto) |
| `EmptyState` | `title`, `message`, `action` |
| `Alert` | `tone`: error \| success \| info |
| `LoadingBlock`, `Spinner` | bloque de carga y spinner |

## Clases utilitarias

`page-stack` (contenedor de página) · `panel` · `card` / `card-grid` · `metric-card` + `metric-value` + `metric-label` · `filters` + `filters-actions` · `table-wrap` · `row-actions` · `badge-*` · `chip` · `tabs` + `tab` · `skeleton` · `form-grid` / `form-stack` / `form-section` / `form-actions` / `form-actions-start` · `check-label` · `check-grid` (rejilla de casillas: roles, permisos, módulos) · `checklist` + `li.cumple` / `li.pendiente` (requisitos cumplidos y pendientes) · `badge-list` · `text-muted` · `sr-only`.

### Tablero de selección (Kanban)

`board` · `board-column` (+ `data-recibiendo="true"` al arrastrar sobre ella) · `board-column-header` + `board-column-count` · `board-cards` · `board-card` (debe ser un `<button>`; `data-arrastrando="true"` mientras se arrastra) · `board-card-top` · `board-card-meta` · `board-card-actions` · `board-empty`.

Ficha de detalle: `detail-grid` · `info-list` + `info-row` + `info-label` + `info-value` · `timeline` + `timeline-item` + `timeline-header` + `timeline-text` · `score-box` + `score-value` + `score-input`.

### Sitio público de empleo

`public-page` · `public-wrap` · `public-header` + `public-brand` + `public-nav` · `public-hero` · `public-job` + `public-job-meta` (tarjeta-enlace del listado) · `public-prose` · `public-footer` · `file-field` + `file-field-name` (carga de CV) · `tracking-code` (código de seguimiento).

## Escala

- **Título de página**: `--text-3xl` (36 px máx.) en todas las pantallas. Solo la portada de acceso usa `--text-display`.
- **Altura de control**: `--control-h` (42 px) para botones e inputs; `--control-h-sm` (36 px) para acciones dentro de tablas.
- **Ancho de contenido**: `--page-max` (1200 px) para todas las páginas.
- **Puntos de corte**: 900 px (colapsa la barra lateral) y 640 px (móvil). No se introducen otros.

## Accesibilidad

- Nada interactivo se construye con `<div onClick>`: se usa `<button>`.
- `role="dialog"` va en el diálogo, nunca en el fondo. `<Modal />` ya lo hace bien.
- Todo control tiene etiqueta asociada (`<Field>` la crea).
- Las tablas anchas van dentro de `table-wrap`, que aporta el desplazamiento horizontal.
