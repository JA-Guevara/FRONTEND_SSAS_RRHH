import { apiRequest, buildQuery } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export type Habilidad = components['schemas']['HabilidadResponse']
export type HabilidadRequest = components['schemas']['HabilidadRequest']

export function listarHabilidades(empresaId?: string) {
  return apiRequest<Habilidad[]>(`/api/v1/habilidades${buildQuery({ empresa_id: empresaId })}`)
}

export function crearHabilidad(data: HabilidadRequest, empresaId?: string) {
  return apiRequest<Habilidad>(`/api/v1/habilidades${buildQuery({ empresa_id: empresaId })}`, { method: 'POST', body: data })
}

export function actualizarHabilidad(id: string, data: Partial<HabilidadRequest>, empresaId?: string) {
  return apiRequest<Habilidad>(`/api/v1/habilidades/${id}${buildQuery({ empresa_id: empresaId })}`, { method: 'PUT', body: data })
}
