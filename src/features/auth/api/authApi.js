import { apiRequest } from '../../../shared/api/httpClient.js'

export const authApi = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: data }),
  refresh: (refreshToken) => apiRequest('/auth/refresh', {
    method: 'POST', body: { refresh_token: refreshToken },
  }),
  getCurrentUser: (accessToken) => apiRequest('/auth/me', { accessToken }),
  logout: (refreshToken) => apiRequest('/auth/logout', {
    method: 'POST', body: { refresh_token: refreshToken },
  }),
}
