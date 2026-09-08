export type AuthRealm = 'tenant' | 'platform'

export type StoredSession = {
  access_token: string
  refresh_token: string
  token_type?: string
  expires_in?: number | null
  realm: AuthRealm
}

const SESSION_KEY = 'ssas.session.v1'

/** Vive en `shared` porque el cliente HTTP necesita el token para renovar la sesión. */
export const tokenStorage = {
  get(): StoredSession | null {
    try {
      const value = sessionStorage.getItem(SESSION_KEY)
      return value !== null ? (JSON.parse(value) as StoredSession) : null
    } catch {
      return null
    }
  },
  set(session: StoredSession): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  },
  clear(): void {
    sessionStorage.removeItem(SESSION_KEY)
  },
}

export const SESSION_EXPIRED_EVENT = 'ssas:session-expired'

export function notifySessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
}
