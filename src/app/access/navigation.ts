import type { LucideIcon } from 'lucide-react'
import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleHelp,
  CreditCard,
  DatabaseBackup,
  FileUp,
  House,
  KeyRound,
  LayoutGrid,
  ListChecks,
  LockKeyhole,
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
  Plataforma: LayoutGrid,
  Empresa: Building2,
  Administración: ShieldCheck,
  Análisis: BarChart3,
  Cuenta: UserRound,
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: House },
  { to: '/entrevistas', label: 'Entrevistas', icon: CalendarDays, modulo: 'RECLUTAMIENTO', permisos: ['entrevistas:ver', 'platform:entrevistas:ver'], grupo: 'Reclutamiento' },
  { to: '/seleccion', label: 'Selección', icon: ListChecks, modulo: 'RECLUTAMIENTO', permisos: ['postulaciones:ver', 'platform:postulaciones:ver'], grupo: 'Reclutamiento' },
  {
    to: '/empresas',
    label: 'Empresas',
    icon: Building2,
    soloRealm: 'platform',
    permisos: ['platform:empresas:ver'],
    grupo: 'Plataforma',
  },
  {
    to: '/administradores-globales',
    label: 'Administradores globales',
    icon: ShieldCheck,
    soloRealm: 'platform',
    permisos: ['platform:usuarios:gestionar'],
    grupo: 'Plataforma',
  },
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
    to: '/habilidades',
    label: 'Habilidades',
    icon: Award,
    modulo: 'RECLUTAMIENTO',
    permisos: ['habilidades:ver', 'platform:habilidades:gestionar'],
    grupo: 'Reclutamiento',
  },
  {
    to: '/organizacion',
    label: 'Organización',
    icon: UsersRound,
    modulo: 'ORGANIZACION',
    permisos: ['departamentos:ver', 'cargos:ver', 'platform:organizacion:gestionar'],
    grupo: 'Empresa',
  },
  {
    to: '/empleados',
    label: 'Empleados',
    icon: Users,
    modulo: 'ORGANIZACION',
    permisos: ['empleados:ver', 'platform:empleados:ver'],
    grupo: 'Empresa',
  },
  { to: '/importaciones', label: 'Importar datos', icon: FileUp, modulo: 'ORGANIZACION', permisos: ['importacion:gestionar', 'platform:importacion:gestionar'], grupo: 'Empresa' },
  {
    to: '/empresa/configuracion',
    label: 'Configuración',
    icon: Settings2,
    modulo: 'ORGANIZACION',
    permisos: ['empresa:ver', 'empresa:editar', 'platform:empresas:ver'],
    grupo: 'Empresa',
  },
  {
    to: '/usuarios',
    label: 'Usuarios',
    icon: Users,
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
    to: '/bitacora',
    label: 'Bitácora',
    icon: ScrollText,
    modulo: 'BITACORA',
    permisos: ['bitacora:ver', 'platform:bitacora:ver'],
    grupo: 'Administración',
  },
  {
    to: '/reportes',
    label: 'Reportes',
    icon: BarChart3,
    modulo: 'REPORTES',
    permisos: ['reportes:ver', 'platform:reportes:gestionar'],
    grupo: 'Análisis',
  },
  {
    to: '/respaldos',
    label: 'Backup / Restore',
    icon: DatabaseBackup,
    soloRealm: 'platform',
    permisos: ['platform:backup:ver'],
    grupo: 'Plataforma',
  },
  {
    to: '/respaldos-empresa',
    label: 'Respaldos por empresa',
    icon: DatabaseBackup,
    permisos: ['backup:ver', 'platform:backup:ver'],
    grupo: 'Administración',
  },
  {
    to: '/planes',
    label: 'Planes y suscripciones',
    icon: CreditCard,
    soloRealm: 'platform',
    permisos: ['platform:planes:ver'],
    grupo: 'Plataforma',
  },
  {
    to: '/suscripcion',
    label: 'Mi suscripción',
    icon: CreditCard,
    soloRealm: 'tenant',
    permisos: ['suscripcion:ver'],
    grupo: 'Cuenta',
  },
  { to: '/perfil', label: 'Mi perfil', icon: UserRound, grupo: 'Cuenta' },
  { to: '/ayuda', label: 'Ayuda', icon: CircleHelp, grupo: 'Cuenta' },
  { to: '/cambiar-clave', label: 'Cambiar contraseña', icon: LockKeyhole, grupo: 'Cuenta' },
]
