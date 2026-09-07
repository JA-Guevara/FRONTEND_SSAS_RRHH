import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export type Departamento = components['schemas']['DepartamentoResponse']
export type Cargo = components['schemas']['CargoResponse']

type DepartamentoRequest = components['schemas']['CrearDepartamentoRequest']
type CargoRequest = components['schemas']['CrearCargoRequest']

function scopedPath(path: string, empresaId?: string) {
  return empresaId ? `${path}?empresa_id=${encodeURIComponent(empresaId)}` : path
}

export function getDepartamentos(empresaId?: string) {
  return apiRequest<Departamento[]>(scopedPath('/api/v1/departamentos', empresaId))
}

export function crearDepartamento(data: DepartamentoRequest) {
  return apiRequest<Departamento>('/api/v1/departamentos', { method: 'POST', body: data })
}

export function actualizarDepartamento(id: string, data: Partial<DepartamentoRequest>) {
  return apiRequest<Departamento>(`/api/v1/departamentos/${id}`, { method: 'PUT', body: data })
}

export function getCargos(empresaId?: string) {
  return apiRequest<Cargo[]>(scopedPath('/api/v1/cargos', empresaId))
}

export function crearCargo(data: CargoRequest) {
  return apiRequest<Cargo>('/api/v1/cargos', { method: 'POST', body: data })
}

export function actualizarCargo(id: string, data: Partial<CargoRequest>) {
  return apiRequest<Cargo>(`/api/v1/cargos/${id}`, { method: 'PUT', body: data })
}
