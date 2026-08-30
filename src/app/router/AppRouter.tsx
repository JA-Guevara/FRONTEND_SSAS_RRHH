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
import { RolesPage } from '../../features/roles/pages/RolesPage'
import { ListadoUsuariosPage } from '../../features/usuarios/pages/ListadoUsuariosPage'
import { OrganizacionPage } from '../../features/organizacion/pages/OrganizacionPage'
import { VacanteFormPage } from '../../features/vacantes/pages/VacanteFormPage'
import { TableroPage } from '../../features/tablero/pages/TableroPage'
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
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/recuperar-clave" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
      <Route path="/restablecer-clave" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />

      {/* Temporal: probar sin login */}
      <Route path="/vacantes/nueva" element={<VacanteFormPage />} />
      <Route path="/vacantes/:id/editar" element={<VacanteFormPage />} />
      <Route path="/vacantes/:id/tablero" element={<TableroPage />} />

      <Route element={<ProtectedArea />}>
        <Route index element={<DashboardPage />} />
        <Route path="cambiar-clave" element={<ChangePasswordPage />} />
        <Route path="usuarios" element={tenant(<ListadoUsuariosPage />)} />
        <Route path="roles" element={tenant(<RolesPage />)} />
        <Route path="bitacora" element={tenant(<BitacoraPage />)} />
        <Route path="empresas" element={platform(<AltaEmpresaPage />)} />
        <Route path="organizacion" element={tenant(<OrganizacionPage />)} />
        <Route path="vacantes/nueva" element={tenant(<VacanteFormPage />)} />
        <Route path="vacantes/:id/editar" element={tenant(<VacanteFormPage />)} />
        <Route path="vacantes/:id/tablero" element={tenant(<TableroPage />)} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
/* 3d2f841 (feat: T1-11 CRUD departamentos y cargos)*/
