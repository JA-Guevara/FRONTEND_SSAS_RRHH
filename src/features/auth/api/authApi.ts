import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'
import type { AuthRealm, LoginCredentials, Session } from '../context/AuthContext'

type TenantToken = components['schemas']['TokenPairSchema']
type PlatformToken = components['schemas']['PlatformTokenResponse']
type TenantUser = components['schemas']['UserSchema']
type PlatformUser = components['schemas']['PlatformAdminResponse']

const authBase = (realm: AuthRealm) =>
  realm === 'platform' ? '/api/v1/platform/auth' : '/api/v1/auth'

function withRealm(token: TenantToken | PlatformToken, realm: AuthRealm): Session {
  return { ...token, realm }
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<Session> {
    if (credentials.realm === 'platform') {
      const token = await apiRequest<PlatformToken>('/api/v1/platform/auth/login', {
        method: 'POST', body: { login: credentials.login, password: credentials.password }, skipAuth: true,
      })
      return withRealm(token, 'platform')
    }

    const identifier = credentials.login.includes('@')
      ? { email: credentials.login }
      : { username: credentials.login }
    const token = await apiRequest<TenantToken>('/api/v1/auth/login', {
      method: 'POST',
      body: { empresa_slug: credentials.empresaSlug, ...identifier, password: credentials.password },
      skipAuth: true,
    })
    return withRealm(token, 'tenant')
  },

  async refresh(session: Session): Promise<Session> {
    const token = await apiRequest<TenantToken | PlatformToken>(`${authBase(session.realm)}/refresh`, {
      method: 'POST', body: { refresh_token: session.refresh_token }, skipAuth: true,
    })
    return withRealm(token, session.realm)
  },

  getCurrentUser: (realm: AuthRealm, accessToken: string) =>
    apiRequest<TenantUser | PlatformUser>(`${authBase(realm)}/me`, { accessToken }),

  logout: (session: Session) => apiRequest(`${authBase(session.realm)}/logout`, {
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

  changePassword: (realm: AuthRealm, currentPassword: string, newPassword: string) =>
    apiRequest<components['schemas']['MessageSchema']>(`${authBase(realm)}/password/change`, {
      method: 'POST', body: { current_password: currentPassword, new_password: newPassword },
    }),
}
