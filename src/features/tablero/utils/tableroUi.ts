/** Constantes y formateadores compartidos por las pantallas del tablero.
 *  Aquí no hay estilos: el aspecto lo aporta íntegramente el sistema de diseño. */

/** Ver el tablero. El permiso de empresa y su equivalente global son alternativos. */
export const PERM_VER = ['postulaciones:ver', 'platform:postulaciones:ver']

/** Mover de etapa, rechazar, puntuar y añadir notas. */
export const PERM_GESTIONAR = ['postulaciones:gestionar', 'platform:postulaciones:gestionar']

/** Editar la vacante desde la cabecera del tablero. */
export const PERM_VACANTES_EDITAR = ['vacantes:editar', 'platform:vacantes:gestionar']

/** El backend nombra el estado de la postulación en femenino («DESCARTADA»),
 *  mientras que el mapa único de colores de `EstadoBadge` usa la forma canónica
 *  del candidato («DESCARTADO»). Se traduce aquí para que el color del estado
 *  siga viniendo de un solo sitio en todo el producto. */
const ESTADO_CANONICO: Record<string, string> = {
  DESCARTADA: 'DESCARTADO',
  CONTRATADA: 'CONTRATADO',
}

export function estadoCanonico(estado: string): string {
  const normalizado = estado.toUpperCase()
  return ESTADO_CANONICO[normalizado] ?? normalizado
}

export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO')
}

export function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-BO')
}
