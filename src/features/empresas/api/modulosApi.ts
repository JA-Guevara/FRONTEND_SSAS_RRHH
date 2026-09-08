import { apiRequest } from '../../../shared/api/httpClient'

export type Modulo = {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  icono: string | null
  orden: number
  es_core: boolean
  activo: boolean
}

export type ModuloEmpresa = Modulo & {
  habilitado: boolean
  fecha_habilitacion: string | null
}

export const modulosApi = {
  catalogo: () => apiRequest<Modulo[]>('/api/v1/modulos'),

  porEmpresa: (empresaId: string) =>
    apiRequest<ModuloEmpresa[]>(`/api/v1/empresas/${empresaId}/modulos`),

  actualizar: (empresaId: string, modulos: string[]) =>
    apiRequest<ModuloEmpresa[]>(`/api/v1/empresas/${empresaId}/modulos`, {
      method: 'PUT',
      body: { modulos },
    }),
}
