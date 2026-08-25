import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

type Role = components['schemas']['RoleSchema']

export const rolesApi = {
  list: () => apiRequest<Role[]>('/api/v1/roles'),
  create: (data: components['schemas']['CreateRoleRequest']) =>
    apiRequest<Role>('/api/v1/roles', { method: 'POST', body: data }),
  update: (id: string, data: components['schemas']['UpdateRoleRequest']) =>
    apiRequest<Role>(`/api/v1/roles/${id}`, { method: 'PATCH', body: data }),
  remove: (id: string) => apiRequest<void>(`/api/v1/roles/${id}`, { method: 'DELETE' }),
  assignPermissions: (id: string, permissionIds: string[]) =>
    apiRequest<Role>(`/api/v1/roles/${id}/permissions`, {
      method: 'PUT', body: { permission_ids: permissionIds },
    }),
}
