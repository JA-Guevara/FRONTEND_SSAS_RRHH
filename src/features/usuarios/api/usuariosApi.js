import { apiRequest } from '../../../shared/api/httpClient.js'

export const usuariosApi = {
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: data }),
  createRole: (data, accessToken) => apiRequest('/roles', { method: 'POST', body: data, accessToken }),
  updateRolePermissions: (roleId, permissionIds, accessToken) => apiRequest(`/roles/${roleId}/permissions`, {
    method: 'PUT', body: { permission_ids: permissionIds }, accessToken,
  }),
}