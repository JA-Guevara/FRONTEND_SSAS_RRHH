import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

type CreateUser = components['schemas']['CrearUsuarioRequest']
type UpdateUser = components['schemas']['ActualizarUsuarioRequest']
type User = components['schemas']['UsuarioResponse']

export const usuariosApi = {
  list(filters: { search?: string; is_active?: boolean; page?: number; per_page?: number } = {}) {
    const query = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value))
    })
    return apiRequest<components['schemas']['UsuarioPageResponse']>(`/api/v1/usuarios?${query}`)
  },
  create: (data: CreateUser) => apiRequest<User>('/api/v1/usuarios', { method: 'POST', body: data }),
  update: (id: string, data: UpdateUser) => apiRequest<User>(`/api/v1/usuarios/${id}`, { method: 'PATCH', body: data }),
  activate: (id: string) => apiRequest<User>(`/api/v1/usuarios/${id}/activar`, { method: 'PATCH' }),
  deactivate: (id: string) => apiRequest<User>(`/api/v1/usuarios/${id}/desactivar`, { method: 'PATCH' }),
  unlock: (id: string) => apiRequest<User>(`/api/v1/usuarios/${id}/desbloquear`, { method: 'PATCH' }),
}
