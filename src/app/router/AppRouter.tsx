import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireRealm } from '../guards/RequireRealm'
import { AppLayout } from '../layouts/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { ChangePasswordPage } from '../../features/auth/pages/ChangePasswordPage'
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { BitacoraPage } from '../../features/bitacora/pages/BitacoraPage'
import { AltaEmpresaPage } from '../../features/empresas/pages/AltaEmpresaPage'
import { ParametrosLeyPage } from '../../features/empresas/pages/ParametrosLeyPage'
import { RolesPage } from '../../features/roles/pages/RolesPage'
import { ListadoUsuariosPage } from '../../features/usuarios/pages/ListadoUsuariosPage'
import { FullPageStatus } from '../../shared/components/FullPageStatus'

function ProtectedArea() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageStatus message="Comprobando tu sesión…" />
  return status === 'authenticated' ? <AppLayout /> : <Navigate to="/login" replace />
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageStatus message="Comprobando tu sesión…" />
  return status === 'authenticated' ? <Navigate to="/" replace /> : children
}

const tenant = (page: ReactNode) => <RequireRealm realm="tenant">{page}</RequireRealm>
const platform = (page: ReactNode) => <RequireRealm realm="platform">{page}</RequireRealm>

export function AppRouter() {
  return <Routes><Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} /><Route path="/recuperar-clave" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} /><Route path="/restablecer-clave" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} /><Route element={<ProtectedArea />}><Route index element={<DashboardPage />} /><Route path="cambiar-clave" element={<ChangePasswordPage />} /><Route path="usuarios" element={tenant(<ListadoUsuariosPage />)} /><Route path="roles" element={tenant(<RolesPage />)} /><Route path="parametros-ley" element={tenant(<ParametrosLeyPage />)} /><Route path="bitacora" element={tenant(<BitacoraPage />)} /><Route path="empresas" element={platform(<AltaEmpresaPage />)} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}
