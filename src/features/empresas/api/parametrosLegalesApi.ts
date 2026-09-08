import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export type ParametroLegal = components['schemas']['ParametroLegalResponse']
export type CrearParametroLegal = components['schemas']['ParametroLegalRequest']
export type ActualizarParametroLegal = components['schemas']['ActualizarParametroLegalRequest']

function scope(empresaId?: string | null) {
  return empresaId ? `?empresa_id=${encodeURIComponent(empresaId)}` : ''
}

export function getParametrosLegales(empresaId?: string | null) {
  return apiRequest<ParametroLegal[]>(`/api/v1/parametros-legales${scope(empresaId)}`)
}

export function crearParametroLegal(data: CrearParametroLegal, empresaId?: string | null) {
  return apiRequest<ParametroLegal>(`/api/v1/parametros-legales${scope(empresaId)}`, {
    method: 'POST',
    body: data,
  })
}

export function actualizarParametroLegal(
  id: string,
  data: ActualizarParametroLegal,
  empresaId?: string | null,
) {
  return apiRequest<ParametroLegal>(`/api/v1/parametros-legales/${id}${scope(empresaId)}`, {
    method: 'PUT',
    body: data,
  })
}