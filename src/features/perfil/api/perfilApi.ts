import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export type PerfilResponse = components['schemas']['UsuarioResponse']

export type ActualizarPerfilPayload = {
  nombre?: string
  apellido?: string
  telefono?: string | null
}

export type SesionItem = {
  id: string
  dispositivo: string
  ip: string
  inicio: string
  expira_en: string
  es_actual: boolean
}

export type ActividadItem = {
  id: string
  modulo: string
  accion: string
  descripcion: string
  ip_origen: string | null
  fecha: string
}

export type SubirFotoResponse = {
  foto_url: string
  mensaje: string
}

export const perfilApi = {
  obtenerMiPerfil: (accessToken: string) =>
    apiRequest<PerfilResponse>('/api/v1/usuarios/me', { method: 'GET', accessToken }),

  actualizarMiPerfil: (accessToken: string, payload: ActualizarPerfilPayload) =>
    apiRequest<PerfilResponse>('/api/v1/usuarios/me', { method: 'PATCH', accessToken, body: payload }),

  subirFoto: (accessToken: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest<SubirFotoResponse>('/api/v1/usuarios/me/foto', {
      method: 'POST',
      accessToken,
      formData,
    })
  },

  eliminarFoto: (accessToken: string) =>
    apiRequest<{ mensaje: string }>('/api/v1/usuarios/me/foto', { method: 'DELETE', accessToken }),

  obtenerSesiones: (accessToken: string) =>
    apiRequest<SesionItem[]>('/api/v1/usuarios/me/sesiones', { method: 'GET', accessToken }),

  cerrarSesion: (accessToken: string, sesionId: string) =>
    apiRequest<{ mensaje: string }>(`/api/v1/usuarios/me/sesiones/${sesionId}`, {
      method: 'DELETE',
      accessToken,
    }),

  cerrarTodasSesiones: (accessToken: string) =>
    apiRequest<{ mensaje: string }>('/api/v1/usuarios/me/sesiones', { method: 'DELETE', accessToken }),

  obtenerActividad: (accessToken: string) =>
    apiRequest<ActividadItem[]>('/api/v1/usuarios/me/actividad', { method: 'GET', accessToken }),
}