import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export const empresasApi = {
  list: (search = '') => apiRequest<components['schemas']['EmpresaPageResponse']>(
    `/api/v1/empresas?search=${encodeURIComponent(search)}&page=1&per_page=50`,
  ),
  provision: (data: components['schemas']['ProvisionEmpresaRequest']) =>
    apiRequest<components['schemas']['ProvisionEmpresaResponse']>('/api/v1/empresas', {
      method: 'POST', body: data,
    }),
  get: (id: string) => apiRequest<components['schemas']['EmpresaResponse']>(`/api/v1/empresas/${id}`),
  update: (id: string, data: components['schemas']['EmpresaUpdateRequest']) =>
    apiRequest<components['schemas']['EmpresaResponse']>(`/api/v1/empresas/${id}`, { method: 'PATCH', body: data }),
  activate: (id: string) => apiRequest<components['schemas']['EmpresaResponse']>(`/api/v1/empresas/${id}/activar`, { method: 'PATCH' }),
  suspend: (id: string) => apiRequest<components['schemas']['EmpresaResponse']>(`/api/v1/empresas/${id}/suspender`, { method: 'PATCH' }),
}
