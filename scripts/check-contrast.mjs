#!/usr/bin/env node
// R4-27 · Barrido de contraste WCAG 2.1 sobre los pares color/fondo
// declarados en shared/styles. Falla si algún par baja de 4.5:1 en
// cualquiera de los temas pedidos:
//
//   node scripts/check-contrast.mjs --theme light --theme dark
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const MIN_RATIO = 4.5
const THEMES_REQUESTED = (() => {
  const argv = process.argv.slice(2)
  const out = []
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--theme' && argv[i + 1]) {
      out.push(argv[i + 1])
      i += 1
    }
  }
  return out.length ? out : ['light', 'dark']
})()

const KNOWN_THEMES = ['light', 'dark']
for (const theme of THEMES_REQUESTED) {
  if (!KNOWN_THEMES.includes(theme)) {
    console.error(`Tema desconocido '${theme}'. Permitidos: ${KNOWN_THEMES.join(', ')}`)
    process.exit(2)
  }
}

// Pares texto/fondo que el sistema de diseño garantiza.
const PAIRS = [
  ['--ink', '--paper'],
  ['--ink', '--surface'],
  ['--ink', '--surface-2'],
  ['--ink-2', '--paper'],
  ['--ink-2', '--surface'],
  ['--ink-2', '--surface-2'],
  ['--muted', '--paper'],
  ['--muted', '--surface'],
  ['--muted', '--surface-2'],
  ['--on-brand', '--brand-600'],
  ['--on-brand', '--brand-700'],
  ['--on-inverse', '--bg-inverse'],
  ['--on-inverse-muted', '--bg-inverse'],
  ['--on-inverse-subtle', '--bg-inverse'],
  ['--success-ink', '--success-bg'],
  ['--warning-ink', '--warning-bg'],
  ['--danger-ink', '--danger-bg'],
  ['--info-ink', '--info-bg'],
  ['--plan-premium-ink', '--brand-900'],
  ['--plan-premium-muted', '--brand-900'],
  ['--plan-basic', '--plan-basic-bg'],
  ['--accent', '--brand-900'],
  ['--ink', '--brand-50'],
  ['--ink-2', '--brand-50'],
  ['--muted', '--brand-50'],
  // Enlaces, errores de campo y títulos de tarjeta (chat-widget, field.css)
  ['--brand-700', '--paper'],
  ['--brand-700', '--surface'],
  ['--brand-700', '--surface-2'],
  ['--danger', '--paper'],
  ['--danger', '--surface'],
]

function parseBlocks(css) {
  const blocks = []
  let depth = 0
  let headerStart = 0
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i]
    if (ch === '{') {
      const header = css.slice(headerStart, i).replace(/\/\*[\s\S]*?\*\//g, '').trim()
      blocks.push({ header, bodyStart: i + 1, depth })
      depth += 1
      headerStart = i + 1
    } else if (ch === '}') {
      depth -= 1
      const open = [...blocks].reverse().find((b) => b.bodyStart > 0 && b.depth === depth && b.end === undefined)
      if (open) open.end = i
      headerStart = i + 1
    }
  }
  const parsed = []
  for (const b of blocks) {
    if (b.end === undefined) continue
    parsed.push({ header: b.header, body: css.slice(b.bodyStart, b.end) })
  }
  return parsed
}

function declarations(body) {
  const map = {}
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi
  let m
  while ((m = re.exec(body)) !== null) {
    map[m[1]] = m[2].trim()
  }
  return map
}

function resolveVars(map) {
  const out = { ...map }
  for (let i = 0; i < 12; i += 1) {
    let changed = false
    for (const [key, value] of Object.entries(out)) {
      const next = value.replace(/var\(\s*(--[a-z0-9-]+)\s*(?:,[^)]+)?\)/gi, (match, name) => {
        const target = out[name]
        return target !== undefined && target !== match ? target : match
      })
      if (next !== value) {
        out[key] = next
        changed = true
      }
    }
    if (!changed) break
  }
  return out
}

function toRgba(value) {
  const v = value.trim().toLowerCase()
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    const rgb = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
    const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
    return { r: rgb[0], g: rgb[1], b: rgb[2], a: alpha }
  }
  const fn = v.match(/^rgba?\(([^)]+)\)$/)
  if (fn) {
    const parts = fn[1].split(',').map((p) => p.trim())
    const num = (s) => (s.endsWith('%') ? (parseFloat(s) / 100) * 255 : parseFloat(s))
    return {
      r: num(parts[0]),
      g: num(parts[1]),
      b: num(parts[2]),
      a: parts[3] === undefined ? 1 : parseFloat(parts[3]),
    }
  }
  if (v === 'white') return { r: 255, g: 255, b: 255, a: 1 }
  if (v === 'black') return { r: 0, g: 0, b: 0, a: 1 }
  return null
}

function composite(fg, bg) {
  if (fg.a >= 1) return fg
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  }
}

function luminance({ r, g, b }) {
  const channel = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

function buildTheme(tokensPath) {
  const css = readFileSync(tokensPath, 'utf8')
  const blocks = parseBlocks(css)
  const light = {}
  const darkMedia = {}
  const darkAttr = {}
  for (const { header, body } of blocks) {
    const decls = declarations(body)
    if (header === ':root') Object.assign(light, decls)
    else if (header === ":root:not([data-theme='light'])") Object.assign(darkMedia, decls)
    else if (header === ":root[data-theme='dark']") Object.assign(darkAttr, decls)
  }
  const dark = { ...resolveVars({ ...light, ...darkMedia }) }
  return {
    light: resolveVars(light),
    dark,
    darkAttr: resolveVars({ ...light, ...darkAttr }),
  }
}

const tokensPath = join(process.cwd(), 'src', 'shared', 'styles', 'tokens.css')
const themes = buildTheme(tokensPath)

// Los dos selectores oscuros deben coincidir: si no, un tema se aplica a medias.
for (const [key, value] of Object.entries(themes.dark)) {
  if (themes.darkAttr[key] !== undefined && themes.darkAttr[key] !== value && !key.startsWith('--shadow')) {
    console.error(`✗ El token '${key}' difiere entre el modo oscuro por sistema y por conmutador.`)
    process.exit(1)
  }
}

const failures = []
const skipped = []
const rows = []

for (const theme of THEMES_REQUESTED) {
  const tokens = themes[theme]
  for (const [fgToken, bgToken] of PAIRS) {
    const fgRaw = tokens[fgToken]
    const bgRaw = tokens[bgToken]
    if (!fgRaw || !bgRaw) {
      skipped.push(`${theme}: falta ${!fgRaw ? fgToken : bgToken}`)
      continue
    }
    const fg = toRgba(fgRaw)
    const bg = toRgba(bgRaw)
    if (!fg || !bg) {
      skipped.push(`${theme}: ${fgToken} o ${bgToken} no es un color simple`)
      continue
    }
    const ratio = contrast(composite(fg, bg), bg)
    const ok = ratio >= MIN_RATIO
    rows.push({ theme, fgToken, bgToken, ratio, ok })
    if (!ok) failures.push({ theme, fgToken, bgToken, ratio })
  }
}

console.log('----------------------------------------------------')
console.log('SSAS RRHH — Barrido de contraste (WCAG 2.1)')
console.log(`Temas: ${THEMES_REQUESTED.join(', ')} · mínimo ${MIN_RATIO}:1`)
console.log('----------------------------------------------------')

for (const row of rows) {
  const mark = row.ok ? '✓' : '✗'
  const ratio = row.ratio.toFixed(2).padStart(6)
  console.log(`  ${mark} [${row.theme.padEnd(5)}] ${row.fgToken} sobre ${row.bgToken} → ${ratio}:1`)
}

if (skipped.length) {
  console.log('\nSin evaluar:')
  for (const s of [...new Set(skipped)]) console.log(`  - ${s}`)
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} pares por debajo de ${MIN_RATIO}:1:`)
  for (const f of failures) {
    console.error(`  [${f.theme}] ${f.fgToken} sobre ${f.bgToken} → ${f.ratio.toFixed(2)}:1`)
  }
  process.exit(1)
}

console.log(`\n✓ ${rows.length} pares aprobados en ${THEMES_REQUESTED.length} tema(s).`)
