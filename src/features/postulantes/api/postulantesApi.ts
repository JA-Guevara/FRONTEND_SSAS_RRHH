import { apiRequest, buildQuery } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export type Postulante = components['schemas']['PostulanteResponse']
export type PostulanteRequest = components['schemas']['CrearPostulanteRequest']

export function listarPostulantes(empresaId?: string) {
  return apiRequest<Postulante[]>(`/api/v1/postulantes${buildQuery({ empresa_id: empresaId })}`)
}

export function crearPostulante(data: PostulanteRequest) {
  return apiRequest<Postulante>('/api/v1/postulantes', { method: 'POST', body: data })
}

export function obtenerPostulante(id: string) {
  return apiRequest<Postulante>(`/api/v1/postulantes/${id}`)
}
