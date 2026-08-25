import { createContext } from 'react'

export type Session = {
  access_token: string
  refresh_token: string
  token_type?: string
}

export type User = {
  id?: string
  name?: string
  email?: string
  is_active?: boolean
  email_verified?: boolean
  rol?: string
}

export type AuthContextValue = {
  accessToken: string | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  register: (data: unknown) => Promise<void>
  status: 'loading' | 'anonymous' | 'authenticated'
  user: User | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)