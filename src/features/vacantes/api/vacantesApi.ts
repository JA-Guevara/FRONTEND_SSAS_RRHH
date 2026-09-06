import { ApiError } from '../../../shared/api/httpClient'

export type ModalidadVacante = 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO' | 'VIRTUAL'

export const MODALIDADES: ModalidadVacante[] = [
  'PRESENCIAL',
  'HIBRIDO',
  'REMOTO',
  'VIRTUAL',
]

export type EstadoVacante = 'BORRADOR' | 'PUBLICADA' | 'PAUSADA' | 'CERRADA'

export const ESTADOS_VACANTE: EstadoVacante[] = [
  'BORRADOR',
  'PUBLICADA',
  'PAUSADA',
  'CERRADA',
]

export type CargoOpcion = {
  id: number
  nombre: string
  departamento_id: number
  departamento_nombre: string
}

export type DepartamentoOpcion = {
  id: number
  nombre: string
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
  estado: EstadoVacante
}

export type VacanteListItem = Vacante & {
  cargo_nombre: string
  departamento_nombre: string
  postulantes_count: number
}

export type VacanteFormData = Omit<Vacante, 'id' | 'departamento_id' | 'estado'>

export type VacantesFilters = {
  estado?: EstadoVacante | 'TODAS'
  departamento_id?: number | 'TODOS'
  busqueda?: string
  page?: number
  per_page?: number
}

export type PaginatedVacantes = {
  items: VacanteListItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const DEPARTAMENTOS_OPCION: DepartamentoOpcion[] = [
  { id: 1, nombre: 'Gerencia General' },
  { id: 2, nombre: 'Recursos Humanos' },
  { id: 3, nombre: 'Tecnología' },
  { id: 4, nombre: 'Desarrollo' },
  { id: 5, nombre: 'Contabilidad' },
]

export const CARGOS_OPCION: CargoOpcion[] = [
  { id: 1, nombre: 'Gerente General', departamento_id: 1, departamento_nombre: 'Gerencia General' },
  { id: 2, nombre: 'Analista de RRHH', departamento_id: 2, departamento_nombre: 'Recursos Humanos' },
  { id: 3, nombre: 'Desarrollador Backend', departamento_id: 4, departamento_nombre: 'Desarrollo' },
  { id: 4, nombre: 'Soporte Técnico', departamento_id: 3, departamento_nombre: 'Tecnología' },
  { id: 5, nombre: 'Desarrollador Frontend React', departamento_id: 4, departamento_nombre: 'Desarrollo' },
  { id: 6, nombre: 'Especialista en Selección', departamento_id: 2, departamento_nombre: 'Recursos Humanos' },
  { id: 7, nombre: 'Contador General', departamento_id: 5, departamento_nombre: 'Contabilidad' },
]

let vacantes: Vacante[] = [
  {
    id: 1,
    titulo: 'Desarrollador Backend Semi Senior',
    cargo_id: 3,
    departamento_id: 4,
    descripcion: 'Diseño y desarrollo de APIs RESTful, optimización de consultas SQL y microservicios en Python/FastAPI.',
    requisitos: 'Licenciatura en Ingeniería de Sistemas o afín. Mínimo 2 años de experiencia en backend.',
    beneficios: 'Seguro de salud privado, horario flexible, bono por desempeño y capacitaciones continuas.',
    cantidad_vacantes: 2,
    salario_min: 5500,
    salario_max: 8500,
    mostrar_salario: true,
    modalidad: 'HIBRIDO',
    ubicacion: 'Santa Cruz de la Sierra',
    experiencia_min: 2,
    fecha_cierre: '2026-09-30',
    estado: 'PUBLICADA',
  },
  {
    id: 2,
    titulo: 'Analista de Reclutamiento y Selección',
    cargo_id: 2,
    departamento_id: 2,
    descripcion: 'Gestión integral del ciclo de selección de talento, entrevistas por competencias y publicación de convocatorias.',
    requisitos: 'Licenciatura en Psicología Organizacional o Administración. Manejo de pruebas psicotécnicas.',
    beneficios: 'Bono de alimentación, día libre de cumpleaños y capacitaciones.',
    cantidad_vacantes: 1,
    salario_min: 4000,
    salario_max: 6000,
    mostrar_salario: true,
    modalidad: 'PRESENCIAL',
    ubicacion: 'La Paz',
    experiencia_min: 1,
    fecha_cierre: '2026-09-25',
    estado: 'PUBLICADA',
  },
  {
    id: 3,
    titulo: 'Desarrollador Frontend Senior React',
    cargo_id: 5,
    departamento_id: 4,
    descripcion: 'Construcción de interfaces de usuario avanzadas con React, TypeScript y arquitecturas limpias.',
    requisitos: '4+ años de experiencia sólida en frontend con React, CSS moderno y testing.',
    beneficios: 'Modalidad 100% remota, presupuesto anual de equipamiento y seguro médico.',
    cantidad_vacantes: 3,
    salario_min: 9000,
    salario_max: 14000,
    mostrar_salario: false,
    modalidad: 'REMOTO',
    ubicacion: 'Cochabamba / Remoto',
    experiencia_min: 4,
    fecha_cierre: '2026-10-15',
    estado: 'BORRADOR',
  },
  {
    id: 4,
    titulo: 'Especialista en Soporte Técnico N2',
    cargo_id: 4,
    departamento_id: 3,
    descripcion: 'Atención a incidentes informáticos, mantenimiento preventivo de redes e infraestructura local.',
    requisitos: 'Técnico superior o egresado en Redes y Telecomunicaciones o Sistemas.',
    beneficios: 'Refrigerio provisto por la empresa y horas extra remuneradas.',
    cantidad_vacantes: 1,
    salario_min: 3200,
    salario_max: 4200,
    mostrar_salario: true,
    modalidad: 'PRESENCIAL',
    ubicacion: 'Santa Cruz de la Sierra',
    experiencia_min: 1,
    fecha_cierre: '2026-09-20',
    estado: 'PAUSADA',
  },
  {
    id: 5,
    titulo: 'Contador General para Cierre de Gestión',
    cargo_id: 7,
    departamento_id: 5,
    descripcion: 'Supervisión de estados financieros, balances impositivos y auditoría tributaria periódica.',
    requisitos: 'Contador Público Autorizado (CPA) con registro profesional vigente.',
    beneficios: 'Estabilidad laboral, subsidios y convenios corporativos.',
    cantidad_vacantes: 1,
    salario_min: 6500,
    salario_max: 9500,
    mostrar_salario: true,
    modalidad: 'PRESENCIAL',
    ubicacion: 'La Paz',
    experiencia_min: 3,
    fecha_cierre: '2026-08-30',
    estado: 'CERRADA',
  },
  {
    id: 6,
    titulo: 'Auxiliar de Recursos Humanos (Sin descripción)',
    cargo_id: 6,
    departamento_id: 2,
    descripcion: '', // Vacante en borrador sin descripción para probar y verificar el 422
    requisitos: 'Estudiante de últimos semestres en RRHH.',
    beneficios: 'Convenio de pasantía remunerada.',
    cantidad_vacantes: 1,
    salario_min: 2500,
    salario_max: 3000,
    mostrar_salario: true,
    modalidad: 'HIBRIDO',
    ubicacion: 'Santa Cruz de la Sierra',
    experiencia_min: 0,
    fecha_cierre: '2026-10-01',
    estado: 'BORRADOR',
  },
]

export async function getCargosOpcion() {
  await delay(100)
  return [...CARGOS_OPCION]
}

export async function getDepartamentosOpcion() {
  await delay(100)
  return [...DEPARTAMENTOS_OPCION]
}

export async function getVacante(id: number): Promise<Vacante> {
  await delay(150)
  const vacante = vacantes.find((v) => v.id === id)
  if (!vacante) throw new ApiError('Vacante no encontrada', 404)
  return { ...vacante }
}

export async function getVacantes(filters: VacantesFilters = {}): Promise<PaginatedVacantes> {
  await delay(200)
  const {
    estado = 'TODAS',
    departamento_id = 'TODOS',
    busqueda = '',
    page = 1,
    per_page = 10,
  } = filters

  let list = vacantes.map((v) => {
    const cargo = CARGOS_OPCION.find((c) => c.id === v.cargo_id)
    const dep = DEPARTAMENTOS_OPCION.find((d) => d.id === v.departamento_id)
    return {
      ...v,
      cargo_nombre: cargo?.nombre ?? 'Cargo sin asignar',
      departamento_nombre: dep?.nombre ?? cargo?.departamento_nombre ?? 'Departamento sin asignar',
      postulantes_count: v.id === 1 ? 6 : v.id === 2 ? 4 : v.id === 4 ? 2 : 0,
    } as VacanteListItem
  })

  // Filtro por Estado
  if (estado && estado !== 'TODAS') {
    list = list.filter((v) => v.estado === estado)
  }

  // Filtro por Departamento
  if (departamento_id && departamento_id !== 'TODOS') {
    const depId = Number(departamento_id)
    list = list.filter((v) => v.departamento_id === depId)
  }

  // Filtro por Búsqueda textual
  if (busqueda && busqueda.trim()) {
    const query = busqueda.trim().toLowerCase()
    list = list.filter((v) =>
      v.titulo.toLowerCase().includes(query) ||
      v.cargo_nombre.toLowerCase().includes(query) ||
      v.departamento_nombre.toLowerCase().includes(query) ||
      v.ubicacion.toLowerCase().includes(query) ||
      v.descripcion.toLowerCase().includes(query)
    )
  }

  const total = list.length
  const total_pages = Math.max(1, Math.ceil(total / per_page))
  const safePage = Math.min(Math.max(1, page), total_pages)
  const startIndex = (safePage - 1) * per_page
  const items = list.slice(startIndex, startIndex + per_page)

  return {
    items,
    total,
    page: safePage,
    per_page,
    total_pages,
  }
}

export async function crearVacante(data: VacanteFormData): Promise<Vacante> {
  await delay(250)
  const cargo = CARGOS_OPCION.find((c) => c.id === data.cargo_id)
  if (!cargo) {
    const error = new ApiError('Departamento o cargo inválido', 400) as ApiError & { fields?: Record<string, string> }
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

export async function actualizarVacante(id: number, data: VacanteFormData): Promise<Vacante> {
  await delay(250)
  const cargo = CARGOS_OPCION.find((c) => c.id === data.cargo_id)
  if (!cargo) {
    const error = new ApiError('Departamento o cargo inválido', 400) as ApiError & { fields?: Record<string, string> }
    error.fields = { cargo_id: 'Selecciona un cargo válido' }
    throw error
  }
  const index = vacantes.findIndex((v) => v.id === id)
  if (index === -1) throw new ApiError('Vacante no encontrada', 404)

  vacantes[index] = {
    ...vacantes[index],
    ...data,
    departamento_id: cargo.departamento_id,
  }
  return { ...vacantes[index] }
}

/**
 * T1-14: Publicar vacante.
 * Validación 422: No permite publicar si la vacante no cuenta con descripción.
 */
export async function publicarVacante(id: number): Promise<Vacante> {
  await delay(300)
  const index = vacantes.findIndex((v) => v.id === id)
  if (index === -1) throw new ApiError('Vacante no encontrada', 404)

  const vacante = vacantes[index]

  if (!vacante.descripcion || !vacante.descripcion.trim()) {
    throw new ApiError('No se puede publicar la vacante sin una descripción completa y detallada.', 422)
  }

  vacantes[index] = { ...vacante, estado: 'PUBLICADA' }
  return { ...vacantes[index] }
}

/**
 * T1-14: Pausar vacante.
 */
export async function pausarVacante(id: number): Promise<Vacante> {
  await delay(250)
  const index = vacantes.findIndex((v) => v.id === id)
  if (index === -1) throw new ApiError('Vacante no encontrada', 404)

  const vacante = vacantes[index]
  vacantes[index] = { ...vacante, estado: 'PAUSADA' }
  return { ...vacantes[index] }
}

/**
 * T1-14: Cerrar vacante.
 */
export async function cerrarVacante(id: number): Promise<Vacante> {
  await delay(250)
  const index = vacantes.findIndex((v) => v.id === id)
  if (index === -1) throw new ApiError('Vacante no encontrada', 404)

  const vacante = vacantes[index]
  vacantes[index] = { ...vacante, estado: 'CERRADA' }
  return { ...vacantes[index] }
}