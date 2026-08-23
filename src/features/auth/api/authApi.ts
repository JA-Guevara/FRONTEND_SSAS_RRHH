import { apiRequest } from '../../../shared/api/httpClient'
import type { Session, User } from '../context/AuthContext'

export type LoginCredentials = { email: string; password: string }

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiRequest<Session>('/auth/login', { method: 'POST', body: credentials }),
  register: (data: unknown) =>
    apiRequest<unknown>('/auth/register', { method: 'POST', body: data }),
  refresh: (refreshToken: string) =>
    apiRequest<Session>('/auth/refresh', {
      method: 'POST', body: { refresh_token: refreshToken },
    }),
  getCurrentUser: (accessToken: string) =>
    apiRequest<User>('/auth/me', { accessToken }),
  logout: (refreshToken: string) =>
    apiRequest<unknown>('/auth/logout', {
      method: 'POST', body: { refresh_token: refreshToken },
    }),
}