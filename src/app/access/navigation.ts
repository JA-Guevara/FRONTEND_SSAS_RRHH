import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CreditCard,
  DatabaseBackup,
  House,
  KeyRound,
  LayoutGrid,
  ListChecks,
  ScrollText,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react'

/** Modelo único de navegación: el menú, los guards de ruta y el panel de módulos
 *  del superadministrador leen todos de aquí. */
export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Código de módulo que la empresa debe tener habilitado. */
  modulo?: string
  /** Basta con tener uno de estos permisos. El segundo suele ser el de plataforma. */
  permisos?: string[]
  /** Restringe la entrada a un único alcance. */
  soloRealm?: 'tenant' | 'platform'
  grupo?: string
}

export const GROUP_ICONS: Record<string, LucideIcon> = {
  Reclutamiento: UsersRound,
  Personas: Building2,
  Análisis: BarChart3,
  Administración: ShieldCheck,
  Plataforma: LayoutGrid,
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: House },

  // RECLUTAMIENTO
  {
    to: '/vacantes',
    label: 'Vacantes',
    icon: BriefcaseBusiness,
    modulo: 'RECLUTAMIENTO',
    permisos: ['vacantes:ver', 'platform:vacantes:gestionar'],
    grupo: 'Reclutamiento',
  },
  {
    to: '/postulantes',
    label: 'Postulantes',
    icon: Users,
    modulo: 'RECLUTAMIENTO',
    permisos: ['postulantes:ver', 'platform:postulantes:ver'],
    grupo: 'Reclutamiento',
  },
  {
    to: '/seleccion',
    label: 'Selección',
    icon: ListChecks,
    modulo: 'RECLUTAMIENTO',
    permisos: ['postulaciones:ver', 'platform:postulaciones:ver'],
    grupo: 'Reclutamiento',
  },
  {
    to: '/entrevistas',
    label: 'Entrevistas',
    icon: CalendarDays,
    modulo: 'RECLUTAMIENTO',
    permisos: ['entrevistas:ver', 'platform:entrevistas:ver'],
    grupo: 'Reclutamiento',
  },

  // PERSONAS
  {
    to: '/empleados',
    label: 'Empleados',
    icon: Users,
    modulo: 'ORGANIZACION',
    permisos: ['empleados:ver', 'platform:empleados:ver'],
    grupo: 'Personas',
  },
  {
    to: '/organizacion',
    label: 'Organización',
    icon: UsersRound,
    modulo: 'ORGANIZACION',
    permisos: ['departamentos:ver', 'cargos:ver', 'platform:organizacion:gestionar'],
    grupo: 'Personas',
  },

  // ANÁLISIS
  {
    to: '/reportes',
    label: 'Reportes',
    icon: BarChart3,
    modulo: 'REPORTES',
    permisos: ['reportes:ver', 'platform:reportes:gestionar'],
    grupo: 'Análisis',
  },
  {
    to: '/bitacora',
    label: 'Bitácora',
    icon: ScrollText,
    modulo: 'BITACORA',
    permisos: ['bitacora:ver', 'platform:bitacora:ver'],
    grupo: 'Análisis',
  },

  // ADMINISTRACIÓN
  {
    to: '/usuarios',
    label: 'Usuarios',
    icon: UserRound,
    modulo: 'USUARIOS',
    permisos: ['usuarios:ver', 'platform:usuarios:gestionar'],
    grupo: 'Administración',
  },
  {
    to: '/roles',
    label: 'Roles y permisos',
    icon: KeyRound,
    modulo: 'ROLES',
    permisos: ['roles:gestionar', 'platform:usuarios:gestionar'],
    grupo: 'Administración',
  },
  {
    to: '/configuracion',
    label: 'Configuración',
    icon: Settings2,
    modulo: 'ORGANIZACION',
    permisos: ['empresa:ver', 'empresa:editar', 'platform:empresas:ver'],
    grupo: 'Administración',
  },
  {
    to: '/suscripcion',
    label: 'Suscripción',
    icon: CreditCard,
    soloRealm: 'tenant',
    permisos: ['suscripcion:ver'],
    grupo: 'Administración',
  },

  // PLATAFORMA (Solo superadministrador)
  {
    to: '/plataforma',
    label: 'Consola de plataforma',
    icon: LayoutGrid,
    soloRealm: 'platform',
    permisos: ['platform:empresas:ver'],
    grupo: 'Plataforma',
  },
  {
    to: '/respaldos',
    label: 'Respaldos',
    icon: DatabaseBackup,
    soloRealm: 'platform',
    permisos: ['platform:backup:ver'],
    grupo: 'Plataforma',
  },
]
