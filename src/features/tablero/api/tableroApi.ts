export type Etapa = {
  id: number
  nombre: string
  orden: number
  color: string
}

export type TarjetaPostulacion = {
  id: number
  etapa_id: number
  nombre_postulante: string
  fecha_postulacion: string
  puntaje_manual: number | null
}

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export const ETAPAS: Etapa[] = [
  { id: 1, nombre: 'Postulación', orden: 1, color: '#E7EFE6' },
  { id: 2, nombre: 'Preselección', orden: 2, color: '#E7EFE6' },
  { id: 3, nombre: 'Entrevista', orden: 3, color: '#E7EFE6' },
  { id: 4, nombre: 'Oferta', orden: 4, color: '#E7EFE6' },
  { id: 5, nombre: 'Contratado', orden: 5, color: '#E7EFE6' },
]

let postulaciones: TarjetaPostulacion[] = [
  { id: 1, etapa_id: 1, nombre_postulante: 'Julia Quispe', fecha_postulacion: '2026-08-20', puntaje_manual: 80 },
  { id: 2, etapa_id: 1, nombre_postulante: 'Marco Terceros', fecha_postulacion: '2026-08-21', puntaje_manual: 70 },
  { id: 3, etapa_id: 1, nombre_postulante: 'Rosa Mamani', fecha_postulacion: '2026-08-21', puntaje_manual: 55 },
  { id: 4, etapa_id: 2, nombre_postulante: 'Renata Suárez', fecha_postulacion: '2026-08-18', puntaje_manual: 85 },
  { id: 5, etapa_id: 3, nombre_postulante: 'Diego Roca', fecha_postulacion: '2026-08-16', puntaje_manual: 78 },
  { id: 6, etapa_id: 4, nombre_postulante: 'Pablo Arias', fecha_postulacion: '2026-08-12', puntaje_manual: 90 },
]

export async function getEtapas() {
  await delay()
  return [...ETAPAS].sort((a, b) => a.orden - b.orden)
}

export async function getPostulaciones() {
  await delay()
  return [...postulaciones]
}

export async function moverPostulacion(id: number, etapa_id: number) {
  await delay()
  postulaciones = postulaciones.map((p) => (p.id === id ? { ...p, etapa_id } : p))
  return postulaciones.find((p) => p.id === id)!
}