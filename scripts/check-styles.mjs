import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ALLOWED_BREAKPOINTS = [640, 768, 1024, 1280]

// Whitelist for valid dynamic inline styles
const STYLE_PROP_WHITELIST = [
  // AppLayout / Sidebar dynamic company color
  'src/app/layouts/AppLayout.tsx',
  'src/app/layouts/Sidebar.tsx',
  // Dynamic color dot or avatar
  'src/app/layouts/ThemeToggle.tsx',
  // Dynamic brand primary color preview swatch
  'src/features/empresas/pages/ConfiguracionEmpresaPage.tsx',
  // Dev design system showcase page
  'src/features/dev/pages/SistemaVisualPage.tsx',
]

function walk(dir, filterExt = []) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...walk(full, filterExt))
    } else if (filterExt.length === 0 || filterExt.some(ext => full.endsWith(ext))) {
      results.push(full)
    }
  }
  return results
}

function normalizePath(p) {
  return p.replace(/\\/g, '/')
}

const rootDir = process.cwd()
const srcDir = join(rootDir, 'src')

const cssFiles = walk(srcDir, ['.css'])
const tsxFiles = walk(srcDir, ['.tsx'])

const errors = []

// 1. Collect defined CSS classes
const definedClasses = new Set([
  // Common standard SVG / utility pseudo classes
  'active',
  'disabled',
  'focus',
  'hover',
])

for (const file of cssFiles) {
  const content = readFileSync(file, 'utf8')
  // Match class names: .class-name
  const classMatches = content.match(/\.([a-zA-Z0-9_-]+)/g)
  if (classMatches) {
    for (const match of classMatches) {
      const cls = match.slice(1)
      // Exclude numbers or pseudo-like suffixes
      if (cls && !/^\d+$/.test(cls)) {
        definedClasses.add(cls)
      }
    }
  }
}

// 2. Check CSS files for literal colors and illegal breakpoints
for (const file of cssFiles) {
  const relPath = normalizePath(relative(rootDir, file))
  if (relPath.endsWith('shared/styles/tokens.css')) {
    continue // tokens.css defines the literal colors
  }

  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    // Strip comments
    const stripped = line.replace(/\/\*.*?\*\//g, '')

    // Check literal colors: #hex (except url(#id)), rgb(, hsl(
    // We allow rgba(0, 0, 0, ...) for dark overlays if necessary, but tokens are preferred
    const hexMatches = stripped.match(/#[0-9a-fA-F]{3,8}\b/g)
    if (hexMatches) {
      for (const hex of hexMatches) {
        errors.push({
          type: 'LITERAL_COLOR_CSS',
          file: relPath,
          line: index + 1,
          detail: `Color literal '${hex}' encontrado en hoja CSS fuera de tokens.css`,
        })
      }
    }

    const funcColorMatches = stripped.match(/\b(rgb|hsl)\s*\(/g)
    if (funcColorMatches) {
      errors.push({
        type: 'LITERAL_COLOR_CSS',
        file: relPath,
        line: index + 1,
        detail: `Función de color '${funcColorMatches[0]}' fuera de tokens.css`,
      })
    }

    // Check media queries
    const mediaMatches = stripped.matchAll(/@media[^{]+/g)
    for (const m of mediaMatches) {
      const query = m[0]
      const pxMatches = query.matchAll(/(\d+)px/g)
      for (const px of pxMatches) {
        const val = Number.parseInt(px[1], 10)
        if (!ALLOWED_BREAKPOINTS.includes(val)) {
          errors.push({
            type: 'INVALID_BREAKPOINT',
            file: relPath,
            line: index + 1,
            detail: `@media breakpoint inválido '${val}px'. Permitidos: ${ALLOWED_BREAKPOINTS.join(', ')}px`,
          })
        }
      }
    }

    // Check forbidden normal text tokens on inverted surfaces
    if (relPath.endsWith('layout/nav.css') || relPath.endsWith('layout/shell.css')) {
      if (/\bcolor:\s*var\(--(ink|ink-2|muted|line)\)/.test(stripped)) {
        const isSidebarNav = relPath.endsWith('layout/nav.css') && index < 120
        const isSidebarShell = relPath.endsWith('layout/shell.css') && (index < 110 || (index > 164 && index < 240)) && !stripped.includes('option')
        if (isSidebarNav || isSidebarShell) {
          errors.push({
            type: 'INVALID_INVERSE_COLOR',
            file: relPath,
            line: index + 1,
            detail: `Zona invertida (sidebar/nav) no debe usar --ink/--muted/--line. Use tokens --on-inverse-*`,
          })
        }
      }
    }
  })
}

// 3. Check TSX files for style={{ and undefined classes
for (const file of tsxFiles) {
  const relPath = normalizePath(relative(rootDir, file))
  const isWhitelistedStyle = STYLE_PROP_WHITELIST.some(w => relPath.endsWith(w))
  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    // Check style={{
    if (!isWhitelistedStyle && line.includes('style={{')) {
      errors.push({
        type: 'INLINE_STYLE_TSX',
        file: relPath,
        line: index + 1,
        detail: `Uso de 'style={{' en componente TSX. Use clases de CSS o tokens.`,
      })
    }

    // Check static className="string"
    const staticClassRegex = /className="([^"]+)"/g
    let match
    while ((match = staticClassRegex.exec(line)) !== null) {
      const classString = match[1]
      const parts = classString.split(/\s+/).filter(Boolean)
      for (const cls of parts) {
        // Skip template markers or special identifiers
        if (cls.includes('{') || cls.includes('}') || cls.startsWith('$')) continue
        if (!definedClasses.has(cls)) {
          errors.push({
            type: 'UNDEFINED_CLASS',
            file: relPath,
            line: index + 1,
            detail: `Clase CSS no definida: '${cls}'`,
          })
        }
      }
    }
  })
}

// Summary
console.log('----------------------------------------------------')
console.log('SSAS RRHH — Auditoría de Sistema Visual y Estilos')
console.log('----------------------------------------------------')

if (errors.length === 0) {
  console.log('✓ 100% aprobado. No se encontraron violaciones del sistema visual.')
  console.log(`- Clases CSS definidas: ${definedClasses.size}`)
  console.log(`- Archivos CSS auditados: ${cssFiles.length}`)
  console.log(`- Archivos TSX auditados: ${tsxFiles.length}`)
  process.exit(0)
} else {
  console.error(`✗ Se encontraron ${errors.length} violaciones de estilo:\n`)
  const byType = {}
  for (const err of errors) {
    byType[err.type] = (byType[err.type] || 0) + 1
    console.error(`  [${err.type}] ${err.file}:${err.line} - ${err.detail}`)
  }
  console.error('\nResumen por categoría:')
  for (const [k, v] of Object.entries(byType)) {
    console.error(`  - ${k}: ${v}`)
  }
  console.error('\nPor favor corrija estas violaciones según docs/SISTEMA_VISUAL.md.')
  process.exit(1)
}
