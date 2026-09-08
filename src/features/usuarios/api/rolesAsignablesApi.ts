import { apiRequest, buildQuery } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

type Role = components['schemas']['RoleSchema']

/** Roles que se pueden asignar en un alcance.
 *
 *  Vive en la feature `usuarios` y no se importa de `roles` porque una feature no
 *  puede depender de otra. El backend decide qué devuelve:
 *  - con `empresa_id`: los roles de esa empresa
 *  - sin `empresa_id`: los roles globales, que son los de plataforma
 *
 *  Esto importa porque `POST /usuarios` rechaza cualquier rol que no pertenezca
 *  exactamente al alcance del usuario que se está creando.
 */
export const rolesAsignablesApi = {
  list: (empresaId?: string) =>
    apiRequest<Role[]>(`/api/v1/roles${buildQuery({ empresa_id: empresaId })}`),
}
