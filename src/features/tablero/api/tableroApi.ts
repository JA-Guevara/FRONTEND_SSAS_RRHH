import { apiDownload, apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

type TableroItem = components['schemas']['TableroItem']
type PostulanteResponse = components['schemas']['PostulanteResponse']

export type Etapa = components['schemas']['EtapaResponse']
export type MotivoRechazo = components['schemas']['MotivoResponse']
export type NotaPostulante = components['schemas']['NotaResponse']

export type PostulanteDetalle = {
  id: string
  postulante_id: string
  vacante_id: string
  vacante_titulo: string
  etapa_id: string
  etapa: string
  nombre_postulante: string
  email: string
  telefono: string
  ciudad: string
  documento_identidad: string
  fecha_postulacion: string
  experiencia_anios: number
  educacion: string
  cv_url: string | null
  linkedin: string | null
  estado: string
  motivo_rechazo: string | null
  codigo_seguimiento: string
  puntaje_manual: number | null
}

function scopedPath(path: string, empresaId?: string) {
  return empresaId ? `${path}?empresa_id=${encodeURIComponent(empresaId)}` : path
}

async function getPerfil(postulanteId: string, empresaId?: string) {
  return apiRequest<PostulanteResponse>(
    scopedPath(`/api/v1/postulantes/${encodeURIComponent(postulanteId)}`, empresaId),
  )
}

async function hydrate(items: TableroItem[], empresaId?: string): Promise<PostulanteDetalle[]> {
  const perfiles = new Map<string, PostulanteResponse>()
  await Promise.all(
    [...new Set(items.map((item) => item.postulante_id))].map(async (postulanteId) => {
      perfiles.set(postulanteId, await getPerfil(postulanteId, empresaId))
    }),
  )

  return items.map((item) => {
    const perfil = perfiles.get(item.postulante_id)
    return {
      id: item.id,
      postulante_id: item.postulante_id,
      vacante_id: item.vacante_id,
      vacante_titulo: '',
      etapa_id: item.etapa_id,
      etapa: item.etapa,
      nombre_postulante: item.postulante,
      email: item.email,
      telefono: perfil?.telefono ?? '',
      ciudad: perfil?.ciudad ?? '',
      documento_identidad: perfil?.ci ?? '',
      fecha_postulacion: item.fecha_postulacion,
      experiencia_anios: perfil?.anios_experiencia ?? 0,
      educacion: perfil?.nivel_educativo ?? '',
      cv_url: perfil?.cv_url ?? null,
      linkedin: perfil?.linkedin ?? null,
      estado: item.estado,
      motivo_rechazo: item.motivo_rechazo,
      codigo_seguimiento: item.codigo_seguimiento,
      puntaje_manual: item.puntaje_manual == null ? null : Number(item.puntaje_manual),
    }
  })
}

export function getEtapas(empresaId?: string) {
  return apiRequest<Etapa[]>(scopedPath('/api/v1/etapas-reclutamiento', empresaId))
}

export function getMotivosRechazo(empresaId?: string) {
  return apiRequest<MotivoRechazo[]>(scopedPath('/api/v1/motivos-rechazo', empresaId))
}

export async function getPostulaciones(vacanteId?: string, empresaId?: string) {
  const path = vacanteId
    ? `/api/v1/vacantes/${encodeURIComponent(vacanteId)}/tablero`
    : '/api/v1/postulaciones'
  const items = await apiRequest<TableroItem[]>(scopedPath(path, empresaId))
  return hydrate(items, empresaId)
}

export function moverPostulacion(id: string, etapaId: string, empresaId?: string) {
  return apiRequest<TableroItem>(
    scopedPath(`/api/v1/postulaciones/${encodeURIComponent(id)}/etapa`, empresaId),
    { method: 'PATCH', body: { etapa_id: etapaId } },
  )
}

export function rechazarPostulante(id: string, motivoRechazoId: string, empresaId?: string) {
  return apiRequest<TableroItem>(
    scopedPath(`/api/v1/postulaciones/${encodeURIComponent(id)}/rechazar`, empresaId),
    { method: 'PATCH', body: { motivo_rechazo_id: motivoRechazoId } },
  )
}

export function getNotasPostulante(id: string, empresaId?: string) {
  return apiRequest<NotaPostulante[]>(
    scopedPath(`/api/v1/postulaciones/${encodeURIComponent(id)}/notas`, empresaId),
  )
}

export function agregarNotaPostulante(id: string, contenido: string, empresaId?: string) {
  return apiRequest<NotaPostulante>(
    scopedPath(`/api/v1/postulaciones/${encodeURIComponent(id)}/notas`, empresaId),
    { method: 'POST', body: { contenido } },
  )
}

export function actualizarPuntajePostulante(id: string, puntaje: number, empresaId?: string) {
  return apiRequest<TableroItem>(
    scopedPath(`/api/v1/postulaciones/${encodeURIComponent(id)}/puntaje`, empresaId),
    { method: 'PATCH', body: { puntaje } },
  )
}

export async function descargarCV(postulanteId: string, empresaId?: string) {
  const result = await apiDownload(
    scopedPath(`/api/v1/postulantes/${encodeURIComponent(postulanteId)}/cv`, empresaId),
  )
  const url = URL.createObjectURL(result.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = result.filename ?? 'cv.pdf'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
