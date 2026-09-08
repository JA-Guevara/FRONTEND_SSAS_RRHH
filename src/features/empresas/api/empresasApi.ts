import { apiRequest, buildQuery } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

type EmpresaPage = components['schemas']['EmpresaPageResponse']
type Empresa = components['schemas']['EmpresaResponse']

export type EmpresasQuery = {
  search?: string
  activo?: boolean | null
  incluir_eliminadas?: boolean
  page?: number
  per_page?: number
}

export const empresasApi = {
  list: (query: EmpresasQuery = {}) =>
    apiRequest<EmpresaPage>(
      `/api/v1/empresas${buildQuery({
        search: query.search,
        activo: query.activo ?? undefined,
        incluir_eliminadas: query.incluir_eliminadas,
        page: query.page ?? 1,
        per_page: query.per_page ?? 25,
      })}`,
    ),

  provision: (data: components['schemas']['ProvisionEmpresaRequest']) =>
    apiRequest<components['schemas']['ProvisionEmpresaResponse']>('/api/v1/empresas', {
      method: 'POST',
      body: data,
    }),

  get: (id: string) => apiRequest<Empresa>(`/api/v1/empresas/${id}`),

  update: (id: string, data: components['schemas']['EmpresaUpdateRequest']) =>
    apiRequest<Empresa>(`/api/v1/empresas/${id}`, { method: 'PATCH', body: data }),

  activate: (id: string) => apiRequest<Empresa>(`/api/v1/empresas/${id}/activar`, { method: 'PATCH' }),

  suspend: (id: string) => apiRequest<Empresa>(`/api/v1/empresas/${id}/suspender`, { method: 'PATCH' }),

  remove: (id: string) => apiRequest<void>(`/api/v1/empresas/${id}`, { method: 'DELETE' }),

  restore: (id: string) => apiRequest<Empresa>(`/api/v1/empresas/${id}/restaurar`, { method: 'PATCH' }),
}
