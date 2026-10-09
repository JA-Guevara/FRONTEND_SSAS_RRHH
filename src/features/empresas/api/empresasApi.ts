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

export type EventoPlataforma = {
  id: string
  created_at: string
  modulo: string
  accion: string
  nivel: string
  descripcion: string
  empresa_id: string | null
  actor_etiqueta: string | null
}

export type ResumenPlataforma = {
  empresas_activas: number
  empresas_suspendidas: number
  usuarios_totales: number
  almacenamiento_bytes: number
  respaldos_ultimas_24h: number
  errores_ultimas_24h: number
  analisis_cv_del_mes: number
  eventos_recientes: EventoPlataforma[]
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

  uploadLogo: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest<Empresa>(`/api/v1/empresas/${id}/logo`, {
      method: 'POST',
      formData,
    })
  },

  deleteLogo: (id: string) =>
    apiRequest<Empresa>(`/api/v1/empresas/${id}/logo`, { method: 'DELETE' }),

  getResumenPlataforma: () =>
    apiRequest<ResumenPlataforma>('/api/v1/plataforma/resumen'),

  activate: (id: string) => apiRequest<Empresa>(`/api/v1/empresas/${id}/activar`, { method: 'PATCH' }),

  suspend: (id: string) => apiRequest<Empresa>(`/api/v1/empresas/${id}/suspender`, { method: 'PATCH' }),

  remove: (id: string) => apiRequest<void>(`/api/v1/empresas/${id}`, { method: 'DELETE' }),

  restore: (id: string) => apiRequest<Empresa>(`/api/v1/empresas/${id}/restaurar`, { method: 'PATCH' }),
}

