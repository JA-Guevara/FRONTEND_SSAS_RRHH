import type { BreadcrumbItem } from '../../shared/components'

export function getBreadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  if (pathname === '/' || pathname === '') {
    return [{ label: 'Inicio' }]
  }

  const base: BreadcrumbItem[] = [{ label: 'Inicio', to: '/' }]

  // Patrones específicos y anidados
  if (pathname.startsWith('/vacantes/') && pathname.endsWith('/tablero')) {
    return [
      ...base,
      { label: 'Vacantes', to: '/vacantes' },
      { label: 'Tablero de selección' },
    ]
  }

  if (pathname.startsWith('/vacantes/') && pathname.endsWith('/seleccion')) {
    return [
      ...base,
      { label: 'Vacantes', to: '/vacantes' },
      { label: 'Proceso de selección' },
    ]
  }

  if (pathname.startsWith('/empresas/') && pathname.endsWith('/modulos')) {
    return [
      ...base,
      { label: 'Empresas', to: '/empresas' },
      { label: 'Módulos habilitados' },
    ]
  }

  // Rutas directas por sección
  const map: Record<string, { group: string; label: string }> = {
    '/vacantes': { group: 'Reclutamiento', label: 'Vacantes' },
    '/postulantes': { group: 'Reclutamiento', label: 'Postulantes' },
    '/entrevistas': { group: 'Reclutamiento', label: 'Entrevistas' },
    '/seleccion': { group: 'Reclutamiento', label: 'Selección' },
    '/habilidades': { group: 'Reclutamiento', label: 'Habilidades' },
    '/organizacion': { group: 'Empresa', label: 'Organización' },
    '/empleados': { group: 'Empresa', label: 'Empleados' },
    '/importaciones': { group: 'Empresa', label: 'Importar datos' },
    '/empresa/configuracion': { group: 'Empresa', label: 'Configuración' },
    '/usuarios': { group: 'Administración', label: 'Usuarios' },
    '/roles': { group: 'Administración', label: 'Roles y permisos' },
    '/bitacora': { group: 'Administración', label: 'Bitácora' },
    '/respaldos-empresa': { group: 'Administración', label: 'Respaldos por empresa' },
    '/reportes': { group: 'Análisis', label: 'Reportes' },
    '/empresas': { group: 'Plataforma', label: 'Empresas' },
    '/administradores-globales': { group: 'Plataforma', label: 'Administradores globales' },
    '/planes': { group: 'Plataforma', label: 'Planes y suscripciones' },
    '/respaldos': { group: 'Plataforma', label: 'Respaldos globales' },
    '/suscripcion': { group: 'Cuenta', label: 'Mi suscripción' },
    '/perfil': { group: 'Cuenta', label: 'Mi perfil' },
    '/ayuda': { group: 'Cuenta', label: 'Centro de ayuda' },
    '/cambiar-clave': { group: 'Cuenta', label: 'Cambiar contraseña' },
  }

  const match = map[pathname]
  if (match) {
    return [
      ...base,
      { label: match.label },
    ]
  }

  // Fallback si no está mapeada exactamente
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = [...base]
  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const isLast = i === segments.length - 1
    const segName = segments[i].charAt(0).toUpperCase() + segments[i].slice(1).replace(/-/g, ' ')
    items.push({
      label: segName,
      to: isLast ? undefined : currentPath,
    })
  }

  return items
}
