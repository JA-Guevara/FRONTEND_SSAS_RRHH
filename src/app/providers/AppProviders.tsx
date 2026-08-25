import { BrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from '../../features/auth/providers/AuthProvider.tsx'

export function AppProviders({ children }: { children: ReactNode }) {
  return <BrowserRouter><AuthProvider>{children}</AuthProvider></BrowserRouter>
}
