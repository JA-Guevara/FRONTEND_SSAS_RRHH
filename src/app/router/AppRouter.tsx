/*import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { DashboardPage } from '../pages/DashboardPage.tsx'
import { AppLayout } from '../layouts/AppLayout.tsx'
import { LoginPage } from '../../features/auth/pages/LoginPage.tsx'
import { RegisterPage } from '../../features/auth/pages/RegisterPage.tsx'
import { useAuth } from '../../features/auth/hooks/useAuth.tsx'
import { BitacoraPage } from '../../features/bitacora/pages/BitacoraPage.tsx'
import { FullPageStatus } from '../../shared/components/FullPageStatus.tsx'
import { RequireRole } from '../guards/RequireRole.tsx'
import { AltaEmpresaPage } from '../../features/empresas/pages/AltaEmpresaPage'
import { ParametrosLeyPage } from '../../features/empresas/pages/ParametrosLeyPage'

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

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/registro" element={<GuestOnly><RegisterPage /></GuestOnly>} />

      <Route element={<ProtectedArea />}>
        <Route index element={<DashboardPage />} />
          <Route path="empresa" element={<AltaEmpresaPage />} />
          <Route path="parametros-ley" element={<ParametrosLeyPage />} />
        <Route
          path="bitacora"
          element={
            <RequireRole roles={['ADMIN_EMPRESA', 'ANALISTA_RRHH']}>
              <BitacoraPage />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
} esta en comentario solo pa probar el loginya que el codigo que esta abajo es para probar, aclaro ambos sirven*/
import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { DashboardPage } from '../pages/DashboardPage.tsx'
import { AppLayout } from '../layouts/AppLayout.tsx'
import { LoginPage } from '../../features/auth/pages/LoginPage.tsx'
import { RegisterPage } from '../../features/auth/pages/RegisterPage.tsx'
import { useAuth } from '../../features/auth/hooks/useAuth.tsx'
import { BitacoraPage } from '../../features/bitacora/pages/BitacoraPage.tsx'
import { FullPageStatus } from '../../shared/components/FullPageStatus.tsx'
import { RequireRole } from '../guards/RequireRole.tsx'
import { AltaEmpresaPage } from '../../features/empresas/pages/AltaEmpresaPage'
import { ParametrosLeyPage } from '../../features/empresas/pages/ParametrosLeyPage'

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

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/registro" element={<GuestOnly><RegisterPage /></GuestOnly>} />

      {/* Temporal: sin login para probar T0-23 */}
      <Route path="/empresa" element={<AltaEmpresaPage />} />
      <Route path="/parametros-ley" element={<ParametrosLeyPage />} />

      <Route element={<ProtectedArea />}>
        <Route index element={<DashboardPage />} />
        <Route
          path="bitacora"
          element={
            <RequireRole roles={['ADMIN_EMPRESA', 'ANALISTA_RRHH']}>
              <BitacoraPage />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}