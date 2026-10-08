import { apiRequest, buildQuery } from '../../../shared/api/httpClient'

export type EmpleadoListItem = {
  id: string
  codigo: string
  nombres: string
  apellido_paterno: string
  apellido_materno: string | null
  cargo_nombre: string | null
  fecha_ingreso: string
  estado: string
}

export type EmpleadoDetalle = EmpleadoListItem & {
  empresa_id: string
  ci: string
  ci_expedido: string
  fecha_nacimiento: string | null
  genero: string | null
  estado_civil: string | null
  direccion: string | null
  telefono: string | null
  email_personal: string | null
  contacto_emergencia: string | null
  telefono_emergencia: string | null
  nua_cua: string | null
  afp: string | null
  banco: string | null
  numero_cuenta: string | null
  tipo_cuenta: string | null
  fecha_salida: string | null
  motivo_salida: string | null
  foto_url: string | null
  fecha_registro: string
  postulacion_id: string | null
}

export type EmpleadosFilters = {
  q?: string
  estado?: string
  cargo_id?: string
  offset?: number
  limit?: number
}

export function empleadosPath(
  path: string,
  empresaId?: string,
  params: Record<string, string | number | undefined> = {},
) {
  return `/api/v1/${path}${buildQuery({ ...params, empresa_id: empresaId })}`
}

export function listarEmpleados(
  empresaId: string | undefined,
  filters: EmpleadosFilters = {},
): Promise<{ items: EmpleadoListItem[]; total: number }> {
  return apiRequest<{ items: EmpleadoListItem[]; total: number }>(
    empleadosPath('empleados', empresaId, filters),
  )
}

export function obtenerEmpleado(id: string, empresaId?: string): Promise<EmpleadoDetalle> {
  return apiRequest<EmpleadoDetalle>(
    empleadosPath(`empleados/${encodeURIComponent(id)}`, empresaId),
  )
}

/** Nombre completo para mostrar; no asume que exista apellido materno. */
export function nombreCompleto(e: EmpleadoListItem): string {
  return [e.nombres, e.apellido_paterno, e.apellido_materno].filter(Boolean).join(' ')
}
