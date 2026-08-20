import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../pages/DashboardPage.jsx'
import { AppLayout } from '../layouts/AppLayout.jsx'
import { LoginPage } from '../../features/auth/pages/LoginPage.jsx'
import { RegisterPage } from '../../features/auth/pages/RegisterPage.jsx'
import { useAuth } from '../../features/auth/hooks/useAuth.js'
import { BitacoraPage } from '../../features/bitacora/pages/BitacoraPage.jsx'
import { FullPageStatus } from '../../shared/components/FullPageStatus.jsx'

function ProtectedArea() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageStatus message="Comprobando tu sesión…" />
  return status === 'authenticated' ? <AppLayout /> : <Navigate to="/login" replace />
}

function GuestOnly({ children }) {
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
        <Route path="bitacora" element={<BitacoraPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
