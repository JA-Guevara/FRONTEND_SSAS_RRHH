export type TipoEntrevista =
  | 'TECNICA'
  | 'TELEFONICA'
  | 'VIRTUAL'
  | 'PRESENCIAL'
  | 'PSICOLOGICA'

export type ModalidadEntrevista = 'VIRTUAL' | 'PRESENCIAL' | 'TELEFONICA'

export const TIPOS_ENTREVISTA: TipoEntrevista[] = [
  'TECNICA',
  'TELEFONICA',
  'VIRTUAL',
  'PRESENCIAL',
  'PSICOLOGICA',
]

export const MODALIDADES_ENTREVISTA: ModalidadEntrevista[] = [
  'VIRTUAL',
  'PRESENCIAL',
  'TELEFONICA',
]

export type Entrevistador = {
  id: number
  nombre: string
  rol: 'RECLUTADOR' | 'JEFE_AREA'
}

export type PostulacionOpcion = {
  id: number
  nombre_postulante: string
  vacante: string
}

export type Entrevista = {
  id: number
  postulacion_id: number
  entrevistador_id: number
  tipo: TipoEntrevista
  fecha_hora: string
  duracion_min: number | null
  modalidad: ModalidadEntrevista
  enlace_reunion: string
  lugar: string
}

export type EntrevistaFormData = Omit<Entrevista, 'id'>

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

export const ENTREVISTADORES: Entrevistador[] = [
  { id: 2, nombre: 'Carlos Fernández', rol: 'RECLUTADOR' },
  { id: 8, nombre: 'Ana López', rol: 'RECLUTADOR' },
  { id: 4, nombre: 'Juan Pérez', rol: 'JEFE_AREA' },
]

export const POSTULACIONES: PostulacionOpcion[] = [
  { id: 5, nombre_postulante: 'Diego Roca', vacante: 'Desarrollador Backend' },
  { id: 4, nombre_postulante: 'Renata Suárez', vacante: 'Desarrollador Backend' },
  { id: 6, nombre_postulante: 'Pablo Arias', vacante: 'Auxiliar Contable' },
]

let entrevistas: Entrevista[] = [
  {
    id: 1,
    postulacion_id: 5,
    entrevistador_id: 2,
    tipo: 'TECNICA',
    fecha_hora: '2026-09-20T10:00',
    duracion_min: 45,
    modalidad: 'VIRTUAL',
    enlace_reunion: 'https://meet.ssah.app/drc-102',
    lugar: '',
  },
]

export async function getEntrevistadores() {
  await delay()
  return [...ENTREVISTADORES]
}

export async function getPostulacionesOpcion() {
  await delay()
  return [...POSTULACIONES]
}

export async function getEntrevistas() {
  await delay()
  return [...entrevistas]
}

export async function getEntrevista(id: number) {
  await delay()
  const item = entrevistas.find((e) => e.id === id)
  if (!item) throw new Error('Entrevista no encontrada')
  return { ...item }
}

export async function crearEntrevista(data: EntrevistaFormData) {
  await delay()
  const nueva: Entrevista = { ...data, id: Date.now() }
  entrevistas = [nueva, ...entrevistas]
  return nueva
}

export async function actualizarEntrevista(id: number, data: EntrevistaFormData) {
  await delay()
  entrevistas = entrevistas.map((e) => (e.id === id ? { ...e, ...data } : e))
  const item = entrevistas.find((e) => e.id === id)
  if (!item) throw new Error('Entrevista no encontrada')
  return item
}