/** Formato de los datos que ve el candidato: dinero, fechas y etiquetas legibles.
 *  Nada de valores crudos del backend en pantalla. */

const MONEDA = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
  maximumFractionDigits: 0,
})

const FECHA_LARGA = new Intl.DateTimeFormat('es-BO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const MODALIDADES: Record<string, string> = {
  PRESENCIAL: 'Presencial',
  REMOTO: 'Remoto',
  HIBRIDO: 'Híbrido',
}

const NIVELES_EDUCATIVOS: Record<string, string> = {
  SECUNDARIA: 'Secundaria',
  TECNICO: 'Técnico',
  LICENCIATURA: 'Licenciatura',
  MAESTRIA: 'Maestría',
  DOCTORADO: 'Doctorado',
}

/** `PRESENCIAL` -> `Presencial`: los valores del backend llegan en mayúsculas. */
export function enPalabras(valor: string): string {
  const limpio = valor.replace(/_/g, ' ').trim().toLowerCase()
  if (limpio === '') return ''
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

export function etiquetaModalidad(modalidad: string): string {
  return MODALIDADES[modalidad.toUpperCase()] ?? enPalabras(modalidad)
}

export function etiquetaNivelEducativo(nivel: string): string {
  return NIVELES_EDUCATIVOS[nivel.toUpperCase()] ?? enPalabras(nivel)
}

function aNumero(valor: string | null | undefined): number | null {
  if (valor == null || valor.trim() === '') return null
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

/** Importe con separador de miles y moneda. El backend manda cadenas decimales. */
export function formatearMonto(valor: string | null | undefined): string | null {
  const numero = aNumero(valor)
  return numero === null ? null : MONEDA.format(numero)
}

/** Rango salarial legible, o `null` si no hay nada publicado que mostrar. */
export function formatearSalario(
  min: string | null | undefined,
  max: string | null | undefined,
): string | null {
  const desde = formatearMonto(min)
  const hasta = formatearMonto(max)
  if (desde !== null && hasta !== null) {
    return desde === hasta ? desde : `${desde} a ${hasta}`
  }
  if (desde !== null) return `Desde ${desde}`
  if (hasta !== null) return `Hasta ${hasta}`
  return null
}

/** Fechas del backend: `YYYY-MM-DD` o ISO con hora. Se leen en día local, sin
 *  desplazarse un día por la zona horaria. */
export function formatearFecha(valor: string | null | undefined): string | null {
  if (valor == null || valor.trim() === '') return null
  const [anio, mes, dia] = valor.slice(0, 10).split('-').map(Number)
  if (!anio || !mes || !dia) return null
  return FECHA_LARGA.format(new Date(anio, mes - 1, dia))
}
