# SSAS RRHH — Catálogo del Sistema Visual y Guía de Estilos

**Proyecto:** SSAS RRHH · Grupo 12 · INF 412-SA · UAGRM  
**Fecha:** Octubre 2026  
**Regla fundamental:** Ningún componente o archivo fuera de `src/shared/styles/tokens.css` puede declarar `:root`, colores literales (`#hex`, `rgb`, `hsl`), o estilos en línea `style={{}}` (salvo valores puramente dinámicos como indicadores de empresa).

---

## 1. Tokens de Diseño (CSS Custom Properties)

Todos los valores visuales se consumen mediante variables CSS declaradas en `src/shared/styles/tokens.css`.

### 1.1 Paleta de Color de Marca
| Token | Valor Claro | Uso |
|---|---|---|
| `--brand-900` | `#0f3b2a` | Fondos de alto contraste, sidebar |
| `--brand-800` | `#13543b` | Estados hover de superficies oscuras |
| `--brand-700` | `#176b4b` | **Color principal de marca**, botones primarios |
| `--brand-600` | `#1f8259` | Hover de botones primarios, bordes activos |
| `--brand-500` | `#289969` | Acentos en modo oscuro |
| `--accent` | `#d9f36f` | Acento lima de marca (badges, detalles) |

### 1.2 Tonos Semánticos
| Token de Fondo | Token de Texto | Propósito |
|---|---|---|
| `--success-bg` (`#def2e4`) | `--success-ink` (`#14532d`) | Éxito, activos, confirmados |
| `--warning-bg` (`#fef3c7`) | `--warning-ink` (`#92400e`) | Advertencia, pendientes, en revisión |
| `--danger-bg` (`#fee2e2`) | `--danger-ink` (`#991b1b`) | Error, cancelados, acciones destructivas |
| `--info-bg` (`#e0f2fe`) | `--info-ink` (`#075985`) | Información, notas, guías |

### 1.3 Superficies y Neutros
| Token | Modo Claro | Modo Oscuro | Rol |
|---|---|---|---|
| `--bg-app` | `--surface` (`#f4f6f4`) | `#0f1411` | Fondo general de la ventana |
| `--bg-surface` | `--paper` (`#ffffff`) | `#151b17` | Fondo de tarjetas, modales, paneles |
| `--bg-sunken` | `--surface-2` (`#e9ede9`) | `#1a221d` | Cabeceras de tabla, barras de herramientas |
| `--ink` | `#17211b` | `#e8efe9` | Texto principal (alto contraste) |
| `--ink-2` | `#3e4e44` | `#b9c6bd` | Texto secundario y etiquetas |
| `--muted` | `#66716a` | `#8b9790` | Textos de ayuda, metadatos |
| `--line` | `#dce2dc` | `#2a332d` | Bordes sutiles y divisores |
| `--line-strong`| `#b4c0b6` | `#3b463f` | Bordes de inputs y tablas |

### 1.4 Puntos de Quiebre (Breakpoints)
La escala es **móvil-primero** (`min-width`) y utiliza exclusivamente 4 escalones:
- `640px` (`sm`): Teléfono grande
- `768px` (`md`): Tableta vertical / pantalla mediana
- `1024px` (`lg`): Tableta horizontal / portátil compacto
- `1280px` (`xl`): Escritorio estándar

---

## 2. Clases de Utilidad (`utilities.css`)

Para evitar dependencias externas como Tailwind y mantener consistencia, se proporcionan 18 utilidades esenciales:

### 2.1 Disposición (Layout)
| Clase | Propósito | Ejemplo de uso |
|---|---|---|
| `.stack` | Apilado vertical con gap regular (`16px`) | `<div className="stack">{children}</div>` |
| `.stack-sm` | Apilado vertical compacto (`8px`) | `<div className="stack-sm">{items}</div>` |
| `.stack-lg` | Apilado vertical amplio (`24px`) | `<div className="stack-lg">{sections}</div>` |
| `.row` | Fila horizontal centrada (`12px` gap) | `<div className="row"><Icon /><span>Texto</span></div>` |
| `.row-between`| Fila justificada a los extremos | `<div className="row-between"><h3>Título</h3><Badge /></div>` |
| `.row-wrap` | Fila flexible que salta de línea | `<div className="row-wrap">{tags}</div>` |
| `.grid-2` | 1 columna en móvil, 2 columnas en `≥768px` | `<div className="grid-2"><Field /><Field /></div>` |
| `.grid-auto` | Rejilla auto-ajustable (mínimo 240px) | `<div className="grid-auto">{cards}</div>` |
| `.col-span-full`| Ocupa todo el ancho en rejilla grid | `<div className="col-span-full">{fullWidthItem}</div>` |

### 2.2 Tipografía y Texto
| Clase | Propósito |
|---|---|
| `.text-sm` | Tamaño pequeño (`13px / 0.8125rem`) |
| `.text-lg` | Tamaño grande destacado (`18px / 1.125rem`) |
| `.text-muted` | Color secundario atenuado (`var(--muted)`) |
| `.text-strong` | Peso seminegrita 600 y color de tinta principal |
| `.text-danger` | Color semántico de error/peligro |
| `.truncate` | Trunca texto desbordado con elipsis (`...`) |
| `.visually-hidden` | Oculto visualmente pero accesible para lectores de pantalla |

---

## 3. Primitivos Compartidos (`src/shared/components/`)

| Componente | Props Principales | Descripción |
|---|---|---|
| `Card` | `title?`, `actions?`, `tone?`, `children` | Superficie estándar con cabecera y cuerpo. |
| `Stat` | `label`, `value`, `delta?`, `tone?`, `icon?` | Tarjeta de indicador/métrica para tableros. |
| `Toolbar` | `children`, `dense?` | Barra de controles, filtros y acciones para tablas. |
| `Tabs` | `items`, `active`, `onChange` | Navegación por pestañas con accesibilidad de teclado. |
| `Skeleton` | `rows?`, `variant?` | Marcador de posición animado durante estados de carga. |
| `Toast` | `useToast()` hook | Notificaciones temporales flotantes sin interrumpir al usuario. |
| `Select` | `label`, `options`, `value`, `onChange` | Control select accesible con estilos del sistema. |
| `Drawer` | `open`, `onClose`, `side?` | Panel lateral superpuesto para móvil o detalles. |
| `Breadcrumb` | `items` | Rastro de navegación jerárquico. |
| `FormRow` | `label`, `hint?`, `error?`, `required?` | Fila estructurada de formulario con validación. |
| `DescriptionList`| `items: { label, value }[]` | Lista semántica de pares clave/valor (`<dl>`). |
| `Button` | `variant`, `tone`, `size`, `loading` | Botón interactivo (`primary`, `secondary`, `ghost`). |
| `Badge` | `tone: 'success' \| 'warning' \| 'danger' \| 'info'` | Etiqueta de estado o categoría. |
| `Alert` | `tone`, `title?`, `children` | Mensaje de retroalimentación en contexto. |
| `DataTable` | `columns`, `rows`, `rowKey`, `primaryColumn?` | Tabla con soporte responsivo móvil como tarjetas. |
| `Modal` | `title`, `size`, `onClose`, `actions?` | Ventana de diálogo modal con bloqueo de scroll y trampa de foco. |
| `PageHeader` | `title`, `subtitle?`, `breadcrumb?`, `actions?` | Encabezado estándar unificado para todas las vistas. |

---

## 4. Plantillas de Pantalla (`src/shared/templates/`)

Toda pantalla del sistema debe seguir una de las cuatro plantillas maestras:

1. **`ListPage`**: Para vistas con tablas, búsqueda, filtros y paginación (Vacantes, Postulantes, Usuarios, Empleados, Bitácora).
2. **`DetailPage`**: Para fichas de información detallada organizadas en pestañas y tarjetas (Ficha de empleado, Detalle de vacante).
3. **`FormPage`**: Para pantallas de configuración, altas o edición estructurada en pasos o secciones (Configuración de empresa, Registro).
4. **`DashboardPage`**: Para el tablero de control, métricas `Stat`, gráficos y actividad reciente.

---

## 5. Verificación Automática

Para garantizar que el código cumpla con las normas de estilo, ejecutar:
```bash
npm run check:styles
```
Este comando valida que:
1. No existan colores hexadecimales ni rgb/hsl fuera de `tokens.css`.
2. No existan estilos inline `style={{}}` sin justificación dinámica documentada.
3. Todas las clases usadas en `className="..."` estén declaradas en el sistema.
4. Las media queries utilicen únicamente la escala autorizada (`640px`, `768px`, `1024px`, `1280px`).

---

## 6. Catálogo Interactivo en Desarrollo (`/sistema-visual`)

Disponible en modo desarrollo (`import.meta.env.DEV`), la ruta interactiva `/sistema-visual` proporciona una galería en vivo con:
- Demostración interactiva de los 11 primitivos compartidos (`Card`, `Stat`, `Toolbar`, `Tabs`, `Skeleton`, `Toast`, `Select`, `Drawer`, `Breadcrumb`, `FormRow`, `DescriptionList`).
- Variantes de botones, tamaños y badges semánticos.
- Tokens de superficie, sombras y tipografía.
- Alertas contextuales y disparadores de eventos UI.
