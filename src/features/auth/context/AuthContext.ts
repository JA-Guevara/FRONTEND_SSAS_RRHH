import { createContext } from 'react'

export type Session = {
  access_token: string
  refresh_token: string
  token_type?: string
  expires_in?: number | null
  realm: AuthRealm
}

export type AuthRealm = 'tenant' | 'platform'

export type User = {
  id: string
  name: string
  email: string
  username?: string | null
  roles: string[]
  realm: AuthRealm
  is_active: boolean
  email_verified: boolean
  must_change_password?: boolean
}

export type LoginCredentials = {
  realm: AuthRealm
  login: string
  password: string
  empresaSlug?: string
}

export type AuthContextValue = {
  accessToken: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  status: 'loading' | 'anonymous' | 'authenticated'
  user: User | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
