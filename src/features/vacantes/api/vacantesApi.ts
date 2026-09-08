<<<<<<< HEAD
import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

type VacanteResponse = components['schemas']['VacanteResponse']
type CrearVacanteRequest = components['schemas']['CrearVacanteRequest']
type ActualizarVacanteRequest = components['schemas']['ActualizarVacanteRequest']
type CargoResponse = components['schemas']['CargoResponse']
type DepartamentoResponse = components['schemas']['DepartamentoResponse']

export type ModalidadVacante = 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO'

export const MODALIDADES: ModalidadVacante[] = ['PRESENCIAL', 'HIBRIDO', 'REMOTO']

export type EstadoVacante = 'BORRADOR' | 'PUBLICADA' | 'PAUSADA' | 'CERRADA' | 'CANCELADA'

export type CargoOpcion = {
  id: string
  nombre: string
  departamento_id: string | null
  departamento_nombre: string
}

export type DepartamentoOpcion = {
  id: string
  nombre: string
}

export type Vacante = {
  id: string
  titulo: string
  cargo_id: string
  departamento_id: string
  descripcion: string
  requisitos: string
  beneficios: string
  cantidad_vacantes: number
  salario_min: number | null
  salario_max: number | null
  mostrar_salario: boolean
  modalidad: ModalidadVacante
  ubicacion: string
  experiencia_min: number
  fecha_cierre: string
  estado: EstadoVacante
}

export type VacanteListItem = Vacante & {
  cargo_nombre: string
  departamento_nombre: string
  postulantes_count: number | null
}

export type VacanteFormData = CrearVacanteRequest

export type VacantesFilters = {
  estado?: EstadoVacante | 'TODAS'
  departamento_id?: string | 'TODOS'
  busqueda?: string
  page?: number
  per_page?: number
  empresa_id?: string
}

export type PaginatedVacantes = {
  items: VacanteListItem[]
  total: number
  all_total: number
  counts: Record<EstadoVacante, number>
  page: number
  per_page: number
  total_pages: number
}

function scopedPath(path: string, empresaId?: string) {
  return empresaId ? `${path}?empresa_id=${encodeURIComponent(empresaId)}` : path
}

function toVacante(item: VacanteResponse): Vacante {
  return {
    id: item.id,
    titulo: item.titulo,
    cargo_id: item.cargo_id,
    departamento_id: item.departamento_id,
    descripcion: item.descripcion,
    requisitos: item.requisitos ?? '',
    beneficios: item.beneficios ?? '',
    cantidad_vacantes: item.cantidad_vacantes,
    salario_min: item.salario_min == null ? null : Number(item.salario_min),
    salario_max: item.salario_max == null ? null : Number(item.salario_max),
    mostrar_salario: item.mostrar_salario,
    modalidad: item.modalidad as ModalidadVacante,
    ubicacion: item.ubicacion ?? '',
    experiencia_min: item.experiencia_min,
    fecha_cierre: item.fecha_cierre ?? '',
    estado: item.estado as EstadoVacante,
  }
}

export async function getCargosOpcion(empresaId?: string): Promise<CargoOpcion[]> {
  const [cargos, departamentos] = await Promise.all([
    apiRequest<CargoResponse[]>(scopedPath('/api/v1/cargos', empresaId)),
    apiRequest<DepartamentoResponse[]>(scopedPath('/api/v1/departamentos', empresaId)),
  ])
  const nombres = new Map(departamentos.map((item) => [item.id, item.nombre]))
  return cargos.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    departamento_id: item.departamento_id,
    departamento_nombre: item.departamento_id
      ? (nombres.get(item.departamento_id) ?? 'Departamento no disponible')
      : 'Sin departamento',
  }))
}

export async function getDepartamentosOpcion(empresaId?: string): Promise<DepartamentoOpcion[]> {
  const departamentos = await apiRequest<DepartamentoResponse[]>(
    scopedPath('/api/v1/departamentos', empresaId),
  )
  return departamentos.map(({ id, nombre }) => ({ id, nombre }))
}

export async function getVacante(id: string, empresaId?: string): Promise<Vacante> {
  const item = await apiRequest<VacanteResponse>(
    scopedPath(`/api/v1/vacantes/${encodeURIComponent(id)}`, empresaId),
  )
  return toVacante(item)
}

export async function getVacantes(filters: VacantesFilters = {}): Promise<PaginatedVacantes> {
  const {
    estado = 'TODAS',
    departamento_id = 'TODOS',
    busqueda = '',
    page = 1,
    per_page = 10,
    empresa_id,
  } = filters

  const [rawVacantes, cargos, departamentos] = await Promise.all([
    apiRequest<VacanteResponse[]>(scopedPath('/api/v1/vacantes', empresa_id)),
    apiRequest<CargoResponse[]>(scopedPath('/api/v1/cargos', empresa_id)),
    apiRequest<DepartamentoResponse[]>(scopedPath('/api/v1/departamentos', empresa_id)),
  ])

  const cargosById = new Map(cargos.map((item) => [item.id, item.nombre]))
  const departamentosById = new Map(departamentos.map((item) => [item.id, item.nombre]))
  const allItems: VacanteListItem[] = rawVacantes.map((item) => ({
    ...toVacante(item),
    cargo_nombre: cargosById.get(item.cargo_id) ?? 'Cargo no disponible',
    departamento_nombre: departamentosById.get(item.departamento_id) ?? 'Departamento no disponible',
    postulantes_count: null,
  }))

  const counts: Record<EstadoVacante, number> = {
    BORRADOR: 0,
    PUBLICADA: 0,
    PAUSADA: 0,
    CERRADA: 0,
    CANCELADA: 0,
  }
  allItems.forEach((item) => {
    if (item.estado in counts) counts[item.estado] += 1
  })

  let list = allItems
  if (estado !== 'TODAS') list = list.filter((item) => item.estado === estado)
  if (departamento_id !== 'TODOS') list = list.filter((item) => item.departamento_id === departamento_id)
  if (busqueda.trim()) {
    const query = busqueda.trim().toLowerCase()
    list = list.filter((item) =>
      [item.titulo, item.cargo_nombre, item.departamento_nombre, item.ubicacion, item.descripcion]
        .some((value) => value.toLowerCase().includes(query)),
    )
  }

  const total = list.length
  const total_pages = Math.max(1, Math.ceil(total / per_page))
  const safePage = Math.min(Math.max(1, page), total_pages)
  const startIndex = (safePage - 1) * per_page

  return {
    items: list.slice(startIndex, startIndex + per_page),
    total,
    all_total: allItems.length,
    counts,
    page: safePage,
    per_page,
    total_pages,
=======
import { apiRequest, buildQuery } from '../../../shared/api/httpClient'
import { getCargos, getDepartamentos } from '../../organizacion/api/organizacionApi'
import type { components } from '../../../shared/api/schema'

export type ModalidadVacante = 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO'
export const MODALIDADES: ModalidadVacante[] = ['PRESENCIAL', 'HIBRIDO', 'REMOTO']
export type EstadoVacante = 'BORRADOR' | 'PUBLICADA' | 'PAUSADA' | 'CERRADA'
export const ESTADOS_VACANTE: EstadoVacante[] = ['BORRADOR', 'PUBLICADA', 'PAUSADA', 'CERRADA']

export type CargoOpcion = { id: string; nombre: string; departamento_id: string | null; departamento_nombre: string }
export type DepartamentoOpcion = { id: string; nombre: string }
export type Vacante = components['schemas']['VacanteResponse']
export type VacanteFormData = components['schemas']['CrearVacanteRequest']
export type VacanteListItem = Vacante & { cargo_nombre: string; departamento_nombre: string; postulantes_count: number }
export type VacantesFilters = { estado?: EstadoVacante | 'TODAS'; departamento_id?: string | 'TODOS'; busqueda?: string; page?: number; per_page?: number }
export type PaginatedVacantes = { items: VacanteListItem[]; total: number; page: number; per_page: number; total_pages: number }

function normalize(vacante: Vacante): VacanteListItem {
  return { ...vacante, cargo_nombre: vacante.cargo_id, departamento_nombre: vacante.departamento_id, postulantes_count: 0 }
}

export async function getCargosOpcion(empresaId?: string) {
  const [cargos, departamentos] = await Promise.all([getCargos(empresaId), getDepartamentos(empresaId)])
  return cargos.map((cargo) => ({ id: cargo.id, nombre: cargo.nombre, departamento_id: cargo.departamento_id, departamento_nombre: departamentos.find((d) => d.id === cargo.departamento_id)?.nombre ?? cargo.departamento_id ?? 'Sin departamento' }))
}

export async function getDepartamentosOpcion(empresaId?: string) {
  return (await getDepartamentos(empresaId)).map(({ id, nombre }) => ({ id, nombre }))
}

export function getVacante(id: string) {
  return apiRequest<Vacante>(`/api/v1/vacantes/${id}`)
}

export async function getVacantes(filters: VacantesFilters = {}): Promise<PaginatedVacantes> {
  const items = await apiRequest<Vacante[]>(`/api/v1/vacantes${buildQuery({ estado: filters.estado === 'TODAS' ? undefined : filters.estado })}`)
  let list = items.map(normalize)
  if (filters.departamento_id && filters.departamento_id !== 'TODOS') list = list.filter((item) => item.departamento_id === filters.departamento_id)
  if (filters.busqueda?.trim()) {
    const query = filters.busqueda.trim().toLowerCase()
    list = list.filter((item) => `${item.titulo} ${item.descripcion} ${item.cargo_nombre} ${item.departamento_nombre} ${item.ubicacion ?? ''}`.toLowerCase().includes(query))
>>>>>>> 2d47e47 (mejoras en sprint 1)
  }
  const page = filters.page ?? 1
  const perPage = filters.per_page ?? 10
  const totalPages = Math.max(1, Math.ceil(list.length / perPage))
  const safePage = Math.min(page, totalPages)
  return { items: list.slice((safePage - 1) * perPage, safePage * perPage), total: list.length, page: safePage, per_page: perPage, total_pages: totalPages }
}

<<<<<<< HEAD
export async function crearVacante(data: VacanteFormData, empresaId?: string): Promise<Vacante> {
  const item = await apiRequest<VacanteResponse>(scopedPath('/api/v1/vacantes', empresaId), {
    method: 'POST',
    body: data,
  })
  return toVacante(item)
}

export async function actualizarVacante(
  id: string,
  data: ActualizarVacanteRequest,
  empresaId?: string,
): Promise<Vacante> {
  const item = await apiRequest<VacanteResponse>(
    scopedPath(`/api/v1/vacantes/${encodeURIComponent(id)}`, empresaId),
    { method: 'PUT', body: data },
  )
  return toVacante(item)
}

export async function publicarVacante(id: string, empresaId?: string): Promise<Vacante> {
  const item = await apiRequest<VacanteResponse>(
    scopedPath(`/api/v1/vacantes/${encodeURIComponent(id)}/publicar`, empresaId),
    { method: 'PATCH' },
  )
  return toVacante(item)
}

export async function pausarVacante(id: string, empresaId?: string): Promise<Vacante> {
  const item = await apiRequest<VacanteResponse>(
    scopedPath(`/api/v1/vacantes/${encodeURIComponent(id)}/pausar`, empresaId),
    { method: 'PATCH' },
  )
  return toVacante(item)
}

export async function cerrarVacante(id: string, empresaId?: string): Promise<Vacante> {
  const item = await apiRequest<VacanteResponse>(
    scopedPath(`/api/v1/vacantes/${encodeURIComponent(id)}/cerrar`, empresaId),
    { method: 'PATCH' },
  )
  return toVacante(item)
}

export function eliminarVacante(id: string, empresaId?: string) {
  return apiRequest<void>(
    scopedPath(`/api/v1/vacantes/${encodeURIComponent(id)}`, empresaId),
    { method: 'DELETE' },
  )
=======
export function crearVacante(data: VacanteFormData) {
  return apiRequest<Vacante>('/api/v1/vacantes', { method: 'POST', body: data })
}

export function actualizarVacante(id: string, data: components['schemas']['ActualizarVacanteRequest']) {
  return apiRequest<Vacante>(`/api/v1/vacantes/${id}`, { method: 'PUT', body: data })
}

export function publicarVacante(id: string) {
  return apiRequest<Vacante>(`/api/v1/vacantes/${id}/publicar`, { method: 'PATCH' })
}

export function pausarVacante(id: string) {
  return apiRequest<Vacante>(`/api/v1/vacantes/${id}/pausar`, { method: 'PATCH' })
}

export function cerrarVacante(id: string) {
  return apiRequest<Vacante>(`/api/v1/vacantes/${id}/cerrar`, { method: 'PATCH' })
>>>>>>> 2d47e47 (mejoras en sprint 1)
}
