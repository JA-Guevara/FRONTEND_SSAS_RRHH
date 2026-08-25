import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export const empresasApi = {
  list: (search = '') => apiRequest<components['schemas']['EmpresaPageResponse']>(
    `/api/v1/platform/empresas?search=${encodeURIComponent(search)}&page=1&per_page=50`,
  ),
  provision: (data: components['schemas']['ProvisionEmpresaRequest']) =>
    apiRequest<components['schemas']['ProvisionEmpresaResponse']>('/api/v1/platform/empresas', {
      method: 'POST', body: data,
    }),
  listPlans: () => apiRequest<components['schemas']['PlanResponse'][]>('/api/v1/platform/planes?activo=true'),
  getMine: () => apiRequest<components['schemas']['EmpresaResponse']>('/api/v1/mi-empresa'),
  updateMine: (data: components['schemas']['MiEmpresaUpdateRequest']) =>
    apiRequest<components['schemas']['EmpresaResponse']>('/api/v1/mi-empresa', { method: 'PATCH', body: data }),
  listParameters: () => apiRequest<components['schemas']['ParametroEmpresaResponse'][]>('/api/v1/mi-empresa/parametros'),
  updateParameter: (code: string, data: components['schemas']['ActualizarParametroEmpresaRequest']) =>
    apiRequest<components['schemas']['ParametroEmpresaResponse']>(`/api/v1/mi-empresa/parametros/${code}`, {
      method: 'PUT', body: data,
    }),
}
