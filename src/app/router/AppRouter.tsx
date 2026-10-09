import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterCompanyPage } from '../../features/auth/pages/RegisterCompanyPage'
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { BitacoraPage } from '../../features/bitacora/pages/BitacoraPage'
import { ConfiguracionPage } from '../../features/empresas/pages/ConfiguracionPage'
import { EmpresaModulosPage } from '../../features/empresas/pages/EmpresaModulosPage'
import { PlataformaPage } from '../../features/empresas/pages/PlataformaPage'
import { OrganizacionPage } from '../../features/organizacion/pages/OrganizacionPage'
import { EmpleadosPage } from '../../features/empleados/pages/EmpleadosPage'
import { PortalPublicoPage } from '../../features/portal/pages/PortalPublicoPage'
import { RolesPage } from '../../features/roles/pages/RolesPage'
import { ReportesPage } from '../../features/reportes/pages/ReportesPage'
import { RespaldosPage } from '../../features/respaldos/pages/RespaldosPage'
import { RespaldosEmpresaPage } from '../../features/respaldos/pages/RespaldosEmpresaPage'
import { TableroPage } from '../../features/tablero/pages/TableroPage'
import { ListadoUsuariosPage } from '../../features/usuarios/pages/ListadoUsuariosPage'
import { VacanteFormPage } from '../../features/vacantes/pages/VacanteFormPage'
import { VacantesListPage } from '../../features/vacantes/pages/VacantesListPage'
import { PostulantesPage } from '../../features/postulantes/pages/PostulantesPage'
import { MiSuscripcionPage } from '../../features/suscripciones/pages/MiSuscripcionPage'
import { CuentaPage } from '../../features/cuenta/pages/CuentaPage'
import { EntrevistasPage } from '../../features/entrevistas/pages/EntrevistasPage'
import { SeleccionPage } from '../../features/seleccion/pages/SeleccionPage'
import { SistemaVisualPage } from '../../features/dev/pages/SistemaVisualPage'
import { FullPageStatus } from '../../shared/components'
import { RequireAccess } from '../guards/RequireAccess'
import { RequireRealm } from '../guards/RequireRealm'
import { AppLayout } from '../layouts/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'

function ProtectedArea() {
  const { status, user } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <FullPageStatus message="Comprobando tu sesión…" />
  if (status !== 'authenticated') return <Navigate to="/login" replace />
  if (
    user?.must_change_password === true &&
    location.pathname !== '/cambiar-clave' &&
    !location.pathname.startsWith('/cuenta')
  ) {
    return <Navigate to="/cuenta?tab=seguridad" replace />
  }
  return <AppLayout />
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageStatus message="Comprobando tu sesión…" />
  return status === 'authenticated' ? <Navigate to="/" replace /> : children
}

function empresa(page: ReactNode, modulo: string, permisos: string[]) {
  return (
    <RequireRealm realm="tenant" allowPlatformScope>
      <RequireAccess modulo={modulo} permisos={permisos}>
        {page}
      </RequireAccess>
    </RequireRealm>
  )
}

function plataforma(page: ReactNode, permisos: string[]) {
  return (
    <RequireRealm realm="platform">
      <RequireAccess permisos={permisos}>{page}</RequireAccess>
    </RequireRealm>
  )
}

const RECLUTAMIENTO = ['vacantes:ver', 'platform:vacantes:gestionar']

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/registro" element={<GuestOnly><RegisterCompanyPage /></GuestOnly>} />
      <Route path="/recuperar-clave" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
      <Route path="/restablecer-clave" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />

      <Route path="/empleos/:slug" element={<PortalPublicoPage />} />
      <Route path="/empleos/:slug/vacantes/:vacanteId" element={<PortalPublicoPage />} />
      <Route path="/empleos/:slug/seguimiento" element={<PortalPublicoPage />} />
      <Route path="/publico/:slug" element={<PortalPublicoPage />} />
      <Route path="/publico/:slug/vacantes/:vacanteId" element={<PortalPublicoPage />} />
      <Route path="/publico/:slug/seguimiento" element={<PortalPublicoPage />} />

      <Route element={<ProtectedArea />}>
        <Route index element={<DashboardPage />} />
        <Route path="cuenta" element={<CuentaPage />} />
        <Route path="cambiar-clave" element={<Navigate to="/cuenta?tab=seguridad" replace />} />
        <Route path="perfil" element={<Navigate to="/cuenta?tab=perfil" replace />} />
        <Route path="ayuda" element={<Navigate to="/configuracion?tab=conocimiento" replace />} />

        {/* Consola de plataforma (Superadministrador) */}
        <Route path="plataforma" element={plataforma(<PlataformaPage />, ['platform:empresas:ver'])} />
        <Route path="empresas" element={<Navigate to="/plataforma?tab=empresas" replace />} />
        <Route
          path="administradores-globales"
          element={<Navigate to="/plataforma?tab=usuarios" replace />}
        />
        <Route path="respaldos" element={plataforma(<RespaldosPage />, ['platform:backup:ver'])} />
        <Route path="respaldos-empresa" element={<RequireAccess permisos={['backup:ver', 'platform:backup:ver']}><RespaldosEmpresaPage /></RequireAccess>} />
        <Route path="planes" element={<Navigate to="/plataforma?tab=planes" replace />} />
        <Route
          path="suscripcion"
          element={
            <RequireRealm realm="tenant">
              <RequireAccess permisos={['suscripcion:ver']}>
                <MiSuscripcionPage />
              </RequireAccess>
            </RequireRealm>
          }
        />
        <Route
          path="suscripcion/resultado"
          element={<Navigate to="/suscripcion" replace />}
        />
        <Route
          path="empresas/:empresaId/modulos"
          element={plataforma(<EmpresaModulosPage />, ['platform:modulos:ver', 'platform:modulos:gestionar'])}
        />

        {/* Configuración unificada de empresa */}
        <Route
          path="configuracion"
          element={empresa(<ConfiguracionPage />, 'ORGANIZACION', [
            'empresa:ver',
            'empresa:editar',
            'platform:empresas:ver',
          ])}
        />
        <Route path="empresa/configuracion" element={<Navigate to="/configuracion?tab=general" replace />} />

        <Route
          path="usuarios"
          element={empresa(<ListadoUsuariosPage scope="company" />, 'USUARIOS', ['usuarios:ver', 'platform:usuarios:gestionar'])}
        />
        <Route
          path="roles"
          element={empresa(<RolesPage />, 'ROLES', ['roles:gestionar', 'platform:usuarios:gestionar'])}
        />
        <Route
          path="bitacora"
          element={empresa(<BitacoraPage />, 'BITACORA', ['bitacora:ver', 'platform:bitacora:ver'])}
        />
        <Route
          path="reportes"
          element={empresa(<ReportesPage initialTab="panel" />, 'REPORTES', ['reportes:ver', 'platform:reportes:gestionar'])}
        />
        <Route
          path="reportes/explorar"
          element={empresa(<ReportesPage initialTab="explorar" />, 'REPORTES', ['reportes:ver', 'platform:reportes:gestionar'])}
        />
        <Route
          path="reportes/construir"
          element={empresa(<ReportesPage initialTab="construir" />, 'REPORTES', ['reportes:crear', 'platform:reportes:gestionar'])}
        />

        <Route
          path="organizacion"
          element={empresa(<OrganizacionPage />, 'ORGANIZACION', [
            'departamentos:ver',
            'cargos:ver',
            'platform:organizacion:gestionar',
          ])}
        />
        <Route
          path="empleados"
          element={empresa(<EmpleadosPage />, 'ORGANIZACION', ['empleados:ver', 'platform:empleados:ver'])}
        />
        <Route path="importaciones" element={<Navigate to="/configuracion?tab=importaciones" replace />} />

        <Route path="vacantes" element={empresa(<VacantesListPage />, 'RECLUTAMIENTO', RECLUTAMIENTO)} />
        <Route path="postulantes" element={empresa(<PostulantesPage />, 'RECLUTAMIENTO', ['postulantes:ver', 'platform:postulantes:ver'])} />
        <Route path="habilidades" element={<Navigate to="/configuracion?tab=catalogos" replace />} />
        <Route
          path="vacantes/nueva"
          element={empresa(<VacanteFormPage />, 'RECLUTAMIENTO', ['vacantes:crear', 'platform:vacantes:gestionar'])}
        />
        <Route
          path="vacantes/:id/editar"
          element={empresa(<VacanteFormPage />, 'RECLUTAMIENTO', ['vacantes:editar', 'platform:vacantes:gestionar'])}
        />
        <Route
          path="vacantes/:id/tablero"
          element={empresa(<TableroPage />, 'RECLUTAMIENTO', ['postulaciones:ver', 'platform:postulaciones:ver'])}
        />
        <Route
          path="entrevistas"
          element={empresa(<EntrevistasPage />, 'RECLUTAMIENTO', ['entrevistas:ver', 'platform:entrevistas:ver'])}
        />
        <Route path="seleccion" element={empresa(<SeleccionPage />, 'RECLUTAMIENTO', ['postulaciones:ver', 'platform:postulaciones:ver'])} />
        <Route path="vacantes/:id/seleccion" element={empresa(<SeleccionPage />, 'RECLUTAMIENTO', ['postulaciones:ver', 'platform:postulaciones:ver'])} />

        {import.meta.env.DEV && (
          <Route path="sistema-visual" element={<SistemaVisualPage />} />
        )}

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
