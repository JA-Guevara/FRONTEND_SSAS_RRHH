import { apiRequest, buildQuery } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export type Habilidad = components['schemas']['HabilidadResponse']
export type HabilidadRequest = components['schemas']['HabilidadRequest']

/**
 * La empresa es el alcance de la operación: se envía siempre para que el
 * backend compruebe el permiso de la sesión sobre esa empresa.
 */
function scoped(path: string, empresaId: string) {
  return `${path}${buildQuery({ empresa_id: empresaId })}`
}

export function listarHabilidades(empresaId: string) {
  return apiRequest<Habilidad[]>(scoped('/api/v1/habilidades', empresaId))
}

export function crearHabilidad(empresaId: string, data: HabilidadRequest) {
  return apiRequest<Habilidad>(scoped('/api/v1/habilidades', empresaId), {
    method: 'POST',
    body: data,
  })
}

export function actualizarHabilidad(empresaId: string, id: string, data: Partial<HabilidadRequest>) {
  return apiRequest<Habilidad>(scoped(`/api/v1/habilidades/${id}`, empresaId), {
    method: 'PUT',
    body: data,
  })
}