import { apiRequest, buildQuery } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export function getDashboardResumen(empresaId?: string) {
  return apiRequest<components['schemas']['ResumenDashboardResponse']>(`/api/v1/dashboard/resumen${buildQuery({ empresa_id: empresaId })}`)
}
