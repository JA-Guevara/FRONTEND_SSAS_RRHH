import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'
import type { AuthRealm, LoginCredentials, Session } from '../context/AuthContext'

type AuthToken = components['schemas']['TokenPairSchema']
type AuthUser = components['schemas']['UserSchema']

const AUTH_BASE = '/api/v1/auth'

function withRealm(token: AuthToken, realm: AuthRealm): Session {
  return { ...token, realm }
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<Session> {
    const identifier = credentials.login.includes('@')
      ? { email: credentials.login }
      : { username: credentials.login }
    const token = await apiRequest<AuthToken>(`${AUTH_BASE}/login`, {
      method: 'POST',
      body: {
        ...(credentials.realm === 'tenant' ? { empresa_slug: credentials.empresaSlug } : {}),
        ...identifier,
        password: credentials.password,
      },
      skipAuth: true,
    })
    return withRealm(token, credentials.realm)
  },

  async refresh(session: Session): Promise<Session> {
    const token = await apiRequest<AuthToken>(`${AUTH_BASE}/refresh`, {
      method: 'POST', body: { refresh_token: session.refresh_token }, skipAuth: true,
    })
    return withRealm(token, session.realm)
  },

  getCurrentUser: (accessToken: string) =>
    apiRequest<AuthUser>(`${AUTH_BASE}/me`, { accessToken }),

  logout: (session: Session) => apiRequest(`${AUTH_BASE}/logout`, {
    method: 'POST', body: { refresh_token: session.refresh_token },
  }),

  forgotPassword: (email: string, empresaSlug: string) =>
    apiRequest<components['schemas']['ForgotPasswordResponseSchema']>('/api/v1/auth/password/forgot', {
      method: 'POST', body: { email, empresa_slug: empresaSlug }, skipAuth: true,
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest<components['schemas']['MessageSchema']>('/api/v1/auth/password/reset', {
      method: 'POST', body: { token, new_password: newPassword }, skipAuth: true,
    }),

  changePassword: (_realm: AuthRealm, currentPassword: string, newPassword: string) =>
    apiRequest<components['schemas']['MessageSchema']>(`${AUTH_BASE}/password/change`, {
      method: 'POST', body: { current_password: currentPassword, new_password: newPassword },
    }),
}
