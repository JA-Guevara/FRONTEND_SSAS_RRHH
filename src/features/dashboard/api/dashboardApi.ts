import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export function getDashboardResumen() {
  return apiRequest<components['schemas']['ResumenDashboardResponse']>('/api/v1/dashboard/resumen')
}
