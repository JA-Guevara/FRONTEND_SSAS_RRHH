export type ModalidadVacante = 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO' | 'VIRTUAL'

export const MODALIDADES: ModalidadVacante[] = [
  'PRESENCIAL',
  'HIBRIDO',
  'REMOTO',
  'VIRTUAL',
]

export type CargoOpcion = {
  id: number
  nombre: string
  departamento_id: number
  departamento_nombre: string
}

export type Vacante = {
  id: number
  titulo: string
  cargo_id: number
  departamento_id: number
  descripcion: string
  requisitos: string
  beneficios: string
  cantidad_vacantes: number
  salario_min: number | null
  salario_max: number | null
  mostrar_salario: boolean
  modalidad: ModalidadVacante
  ubicacion: string
  experiencia_min: number | null
  fecha_cierre: string
  estado: 'BORRADOR' | 'PUBLICADA'
}

export type VacanteFormData = Omit<Vacante, 'id' | 'departamento_id' | 'estado'>

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export const CARGOS_OPCION: CargoOpcion[] = [
  { id: 1, nombre: 'Gerente General', departamento_id: 1, departamento_nombre: 'Gerencia General' },
  { id: 2, nombre: 'Analista de RRHH', departamento_id: 2, departamento_nombre: 'Recursos Humanos' },
  { id: 3, nombre: 'Desarrollador Backend', departamento_id: 4, departamento_nombre: 'Desarrollo' },
  { id: 4, nombre: 'Soporte Técnico', departamento_id: 3, departamento_nombre: 'Tecnología' },
]

let vacantes: Vacante[] = [
  {
    id: 1,
    titulo: 'Desarrollador Backend Semi Senior',
    cargo_id: 3,
    departamento_id: 4,
    descripcion: 'Desarrollo de APIs y servicios internos.',
    requisitos: 'Licenciatura en Sistemas o afín.',
    beneficios: 'Seguro de salud, horario flexible',
    cantidad_vacantes: 2,
    salario_min: 5500,
    salario_max: 8500,
    mostrar_salario: true,
    modalidad: 'HIBRIDO',
    ubicacion: 'Santa Cruz',
    experiencia_min: 2,
    fecha_cierre: '2026-09-10',
    estado: 'PUBLICADA',
  },
]

export async function getCargosOpcion() {
  await delay()
  return [...CARGOS_OPCION]
}

export async function getVacante(id: number) {
  await delay()
  const vacante = vacantes.find((v) => v.id === id)
  if (!vacante) throw new Error('Vacante no encontrada')
  return { ...vacante }
}

export async function crearVacante(data: VacanteFormData) {
  await delay()
  const cargo = CARGOS_OPCION.find((c) => c.id === data.cargo_id)
  if (!cargo) {
    const error = new Error('Departamento o cargo inválido') as Error & { fields?: Record<string, string> }
    error.fields = { cargo_id: 'Selecciona un cargo válido' }
    throw error
  }
  const nueva: Vacante = {
    ...data,
    id: Date.now(),
    departamento_id: cargo.departamento_id,
    estado: 'BORRADOR',
  }
  vacantes = [nueva, ...vacantes]
  return nueva
}

export async function actualizarVacante(id: number, data: VacanteFormData) {
  await delay()
  const cargo = CARGOS_OPCION.find((c) => c.id === data.cargo_id)
  if (!cargo) {
    const error = new Error('Departamento o cargo inválido') as Error & { fields?: Record<string, string> }
    error.fields = { cargo_id: 'Selecciona un cargo válido' }
    throw error
  }
  vacantes = vacantes.map((v) =>
    v.id === id ? { ...v, ...data, departamento_id: cargo.departamento_id } : v,
  )
  const actualizada = vacantes.find((v) => v.id === id)
  if (!actualizada) throw new Error('Vacante no encontrada')
  return actualizada
}