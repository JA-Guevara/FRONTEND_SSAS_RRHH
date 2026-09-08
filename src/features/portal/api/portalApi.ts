<<<<<<< HEAD
import type { components } from '../../../shared/api/schema'

export type EmpresaPublica = {
  slug: string
  nombre_comercial: string
  ciudad: string
}

export type VacantePublica = components['schemas']['VacantePublicaResponse'] & {
  id: string
  empresa_nombre: string
  titulo: string
  descripcion: string
  requisitos: string | null
  beneficios: string | null
  modalidad: string
  ubicacion: string | null
  fecha_cierre: string
  mostrar_salario: boolean
  salario_min: string | null
  salario_max: string | null
}
=======
import { apiRequest } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'

export type NivelEducativo = 'SECUNDARIA' | 'TECNICO' | 'LICENCIATURA' | 'MAESTRIA' | 'DOCTORADO'
export const NIVELES_EDUCATIVOS: NivelEducativo[] = ['SECUNDARIA', 'TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO']
>>>>>>> 2d47e47 (mejoras en sprint 1)

export type VacantePublica = components['schemas']['VacantePublicaResponse']
export type EmpresaPublica = { nombre_comercial: string; ciudad: string | null }

type PublicApplication = {
  nombres: string
  apellidos: string
  ci: string
  email: string
  telefono: string
  ciudad: string
  nivel_educativo: NivelEducativo | ''
  anios_experiencia: string
  linkedin: string
  cv: File | null
}

<<<<<<< HEAD
type ApiErrorPayload = {
  detail?: string | { msg?: string }[]
}

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function getApiUrl(path: string) {
  return `${API_URL}${path}`
}

async function readApiError(response: Response) {
  const data = await response.json().catch(() => null) as ApiErrorPayload | null
  const detail = data?.detail

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const message = detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join('. ')
    if (message) return message
  }

  return 'No se pudo completar la solicitud'
}

async function publicRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: { Accept: 'application/json', ...init?.headers },
    ...init,
  })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  return response.json() as Promise<T>
}

export async function getVacantesPublicas(slug: string) {
  return publicRequest<VacantePublica[]>(
    `/api/v1/publico/${encodeURIComponent(slug)}/vacantes`,
  )
}

export async function getEmpresaPublica(slug: string) {
  const vacantes = await getVacantesPublicas(slug)
  const firstVacante = vacantes[0]

  return {
    slug,
    nombre_comercial: firstVacante?.empresa_nombre ?? slug,
    ciudad: firstVacante?.ubicacion ?? '',
  }
}

export async function getVacantePublica(slug: string, id: string) {
  return publicRequest<VacantePublica>(
    `/api/v1/publico/${encodeURIComponent(slug)}/vacantes/${encodeURIComponent(id)}`,
  )
}

export async function enviarPostulacion(vacanteId: string, data: PostulacionFormData) {
  const formData = new FormData()
  formData.set('vacante_id', vacanteId)
  formData.set('nombres', data.nombres)
  formData.set('apellidos', data.apellidos)
  formData.set('ci', data.ci)
  formData.set('email', data.email)
  formData.set('telefono', data.telefono)
  formData.set('ciudad', data.ciudad)
  formData.set('nivel_educativo', data.nivel_educativo)
  formData.set('anios_experiencia', String(Number(data.anios_experiencia || 0)))
  formData.set('linkedin', data.linkedin)
  if (data.cv) formData.set('cv', data.cv)

  return publicRequest<components['schemas']['PostulacionPublicaResponse']>(
    '/api/v1/publico/postulaciones',
    { method: 'POST', body: formData },
  )
=======
const publicPath = (slug: string) => `/api/v1/publico/${encodeURIComponent(slug)}/vacantes`

export async function getVacantesPublicas(slug: string): Promise<VacantePublica[]> {
  return apiRequest<VacantePublica[]>(publicPath(slug), { skipAuth: true })
}

export async function getVacantePublica(slug: string, id: string): Promise<VacantePublica> {
  return apiRequest<VacantePublica>(`${publicPath(slug)}/${encodeURIComponent(id)}`, { skipAuth: true })
}

export async function getEmpresaPublica(slug: string): Promise<EmpresaPublica> {
  const vacantes = await getVacantesPublicas(slug)
  return { nombre_comercial: vacantes[0]?.empresa_nombre ?? slug, ciudad: null }
}

export async function enviarPostulacion(vacante: VacantePublica, data: PublicApplication) {
  if (data.cv === null) throw new Error('El CV es obligatorio')
  const formData = new FormData()
  formData.append('vacante_id', vacante.id)
  formData.append('nombres', data.nombres)
  formData.append('apellidos', data.apellidos)
  formData.append('ci', data.ci)
  formData.append('email', data.email)
  formData.append('telefono', data.telefono)
  formData.append('ciudad', data.ciudad)
  formData.append('nivel_educativo', data.nivel_educativo)
  formData.append('anios_experiencia', data.anios_experiencia)
  formData.append('linkedin', data.linkedin)
  formData.append('cv', data.cv)
  return apiRequest<components['schemas']['PostulacionPublicaResponse']>('/api/v1/publico/postulaciones', {
    method: 'POST',
    formData,
    skipAuth: true,
  })
>>>>>>> 2d47e47 (mejoras en sprint 1)
}
