import { apiRequest, buildQuery } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

type CreateUser = components['schemas']['CrearUsuarioRequest']
type UpdateUser = components['schemas']['ActualizarUsuarioRequest']
type User = components['schemas']['UsuarioResponse']

export const usuariosApi = {
  list(filters: { empresa_id?: string; search?: string; is_active?: boolean; page?: number; per_page?: number } = {}) {
    const query = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value))
    })
    return apiRequest<components['schemas']['UsuarioPageResponse']>(`/api/v1/usuarios?${query}`)
  },
  create: (data: CreateUser) => apiRequest<User>('/api/v1/usuarios', { method: 'POST', body: data }),
  update: (id: string, data: UpdateUser, empresaId?: string) => apiRequest<User>(`/api/v1/usuarios/${id}${buildQuery({ empresa_id: empresaId })}`, { method: 'PATCH', body: data }),
  activate: (id: string, empresaId?: string) => apiRequest<User>(`/api/v1/usuarios/${id}/activar${buildQuery({ empresa_id: empresaId })}`, { method: 'PATCH' }),
  deactivate: (id: string, empresaId?: string) => apiRequest<User>(`/api/v1/usuarios/${id}/desactivar${buildQuery({ empresa_id: empresaId })}`, { method: 'PATCH' }),
  unlock: (id: string, empresaId?: string) => apiRequest<User>(`/api/v1/usuarios/${id}/desbloquear${buildQuery({ empresa_id: empresaId })}`, { method: 'PATCH' }),
}
