import type { components } from '../../../shared/api/schema'

export type EmpresaPublica = components['schemas']['EmpresaPublicaResponse']

export type VacantePublica = components['schemas']['VacantePublicaResponse']

export type NivelEducativo =
  | 'SECUNDARIA'
  | 'TECNICO'
  | 'LICENCIATURA'
  | 'MAESTRIA'
  | 'DOCTORADO'

export const NIVELES_EDUCATIVOS: NivelEducativo[] = [
  'SECUNDARIA',
  'TECNICO',
  'LICENCIATURA',
  'MAESTRIA',
  'DOCTORADO',
]

export type PostulacionFormData = {
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

export async function getEmpresaPublica(slug: string): Promise<EmpresaPublica> {
  return publicRequest<EmpresaPublica>(`/api/v1/publico/${encodeURIComponent(slug)}`)
}

export async function getVacantesPublicas(slug: string): Promise<VacantePublica[]> {
  return publicRequest<VacantePublica[]>(
    `/api/v1/publico/${encodeURIComponent(slug)}/vacantes`,
  )
}

export async function getVacantePublica(slug: string, id: string): Promise<VacantePublica> {
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
}

export async function consultarPostulacion(codigo: string) {
  return publicRequest<components['schemas']['SeguimientoPostulacionResponse']>(
    `/api/v1/publico/postulaciones/${encodeURIComponent(codigo)}`,
  )
}

