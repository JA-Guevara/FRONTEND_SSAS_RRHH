import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

type LoginSchema = components['schemas']['LoginSchema']
type RegisterSchema = components['schemas']['RegisterSchema']
type TokenPairSchema = components['schemas']['TokenPairSchema']
type UserSchema = components['schemas']['UserSchema']
type MessageSchema = components['schemas']['MessageSchema']

export const authApi = {
  login: (credentials: LoginSchema) =>
    apiRequest<TokenPairSchema>('/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  register: (data: RegisterSchema) =>
    apiRequest<UserSchema>('/auth/register', {
      method: 'POST',
      body: data,
    }),

  refresh: (refreshToken: string) =>
    apiRequest<TokenPairSchema>('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }),

  getCurrentUser: (accessToken?: string) =>
    apiRequest<UserSchema>('/auth/me', { accessToken }),

  logout: (refreshToken: string) =>
    apiRequest<MessageSchema>('/auth/logout', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }),
}