import { apiRequest, downloadFile } from '../../../shared/api/httpClient'

export type Respaldo = {
  id: string
  nombre: string
  formato: string
  tamano_bytes: number | null
  sha256: string | null
  estado: string
  creado_por_id: string
  fecha_creacion: string
  fecha_finalizacion: string | null
  fecha_restauracion: string | null
  restaurado_por_id: string | null
  mensaje_error: string | null
}

export type BackupOperation = { id: string; estado: string; mensaje: string }

export type RespaldoProgramacion = {
  id: string
  empresa_id: string | null
  nombre: string
  frecuencia: 'DIARIA' | 'SEMANAL' | 'MENSUAL'
  hora: string
  dia_semana: number | null
  dia_mes: number | null
  retencion_dias: number
  activo: boolean
  ultima_ejecucion: string | null
  proxima_ejecucion: string
  creado_por_id: string
  fecha_creacion: string
}

export type CrearRespaldoProgramacion = {
  empresa_id?: string | null
  nombre: string
  frecuencia: 'DIARIA' | 'SEMANAL' | 'MENSUAL'
  hora: string
  dia_semana?: number | null
  dia_mes?: number | null
  retencion_dias?: number
}

export type ActualizarRespaldoProgramacion = Partial<CrearRespaldoProgramacion> & {
  activo?: boolean
}

export type VerificarIntegridadResponse = {
  id: string
  sha256_registrado: string | null
  sha256_calculado: string
  integro: boolean
  tamano_bytes: number
}

export const respaldosApi = {
  list: () => apiRequest<Respaldo[]>('/api/v1/respaldos'),
  create: (nombre?: string) =>
    apiRequest<BackupOperation>('/api/v1/respaldos', {
      method: 'POST',
      body: { nombre: nombre?.trim() || null },
    }),
  download: (id: string) =>
    downloadFile(`/api/v1/respaldos/${encodeURIComponent(id)}/descargar`, `ssas-rrhh-${id}.tar.gz`),
  restore: (id: string, confirmacion: string) =>
    apiRequest<BackupOperation>(`/api/v1/respaldos/${encodeURIComponent(id)}/restaurar`, {
      method: 'POST',
      body: { confirmacion },
    }),
  remove: (id: string) =>
    apiRequest<void>(`/api/v1/respaldos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  verificar: (id: string) =>
    apiRequest<VerificarIntegridadResponse>(`/api/v1/respaldos/${encodeURIComponent(id)}/verificar`, {
      method: 'POST',
    }),
  listProgramaciones: (empresaId?: string) => {
    const query = empresaId ? `?empresa_id=${encodeURIComponent(empresaId)}` : ''
    return apiRequest<RespaldoProgramacion[]>(`/api/v1/respaldos/programaciones${query}`)
  },
  createProgramacion: (data: CrearRespaldoProgramacion) =>
    apiRequest<RespaldoProgramacion>('/api/v1/respaldos/programaciones', {
      method: 'POST',
      body: data,
    }),
  updateProgramacion: (id: string, data: ActualizarRespaldoProgramacion) =>
    apiRequest<RespaldoProgramacion>(`/api/v1/respaldos/programaciones/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: data,
    }),
  deleteProgramacion: (id: string) =>
    apiRequest<void>(`/api/v1/respaldos/programaciones/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  ejecutarProgramacionAhora: (id: string) =>
    apiRequest<BackupOperation>(`/api/v1/respaldos/programaciones/${encodeURIComponent(id)}/ejecutar-ahora`, {
      method: 'POST',
    }),
}
