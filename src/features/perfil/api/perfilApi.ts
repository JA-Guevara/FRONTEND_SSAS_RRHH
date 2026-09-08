import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

type PerfilResponse = components['schemas']['UsuarioResponse']

export type ActualizarPerfilPayload = {
  nombre?: string
  apellido?: string
  telefono?: string | null
}

export const perfilApi = {
  obtenerMiPerfil: (accessToken: string) =>
    apiRequest<PerfilResponse>('/api/v1/usuarios/me', { method: 'GET', accessToken }),

  actualizarMiPerfil: (accessToken: string, payload: ActualizarPerfilPayload) =>
    apiRequest<PerfilResponse>('/api/v1/usuarios/me', { method: 'PATCH', accessToken, body: payload }),
}