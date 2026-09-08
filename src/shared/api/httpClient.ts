import { notifySessionExpired, tokenStorage } from './session'
import type { StoredSession } from './session'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const DEFAULT_TIMEOUT_MS = 20_000
const REFRESH_PATH = '/api/v1/auth/refresh'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  /** Permite a la UI distinguir «no tienes permiso» de un fallo genérico. */
  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isValidation(): boolean {
    return this.status === 409 || this.status === 422
  }
}

type ApiRequestOptions = {
  accessToken?: string
  body?: unknown
  formData?: FormData
  headers?: Record<string, string>
  method?: string
  skipAuth?: boolean
  signal?: AbortSignal
  timeoutMs?: number
  responseType?: 'json' | 'blob'
}

/** Construye la query de forma uniforme: omite nulos, vacíos e indefinidos. */
export function buildQuery(params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query.length > 0 ? `?${query}` : ''
}

function extractDetail(data: unknown): string | null {
  if (data === null || typeof data !== 'object' || !('detail' in data)) return null
  const rawDetail = (data as { detail: unknown }).detail
  if (typeof rawDetail === 'string') return rawDetail
  if (Array.isArray(rawDetail)) {
    const messages = rawDetail
      .map((item) => (item !== null && typeof item === 'object' && 'msg' in item ? String(item.msg) : ''))
      .filter(Boolean)
    return messages.length > 0 ? messages.join('. ') : null
  }
  return null
}

function messageForStatus(status: number, detail: string | null): string {
  if (detail !== null) return detail
  if (status === 403) return 'No tienes permiso para realizar esta acción.'
  if (status === 404) return 'El recurso solicitado no existe.'
  if (status === 409) return 'La operación entra en conflicto con el estado actual.'
  if (status >= 500) return 'El servidor no pudo procesar la solicitud. Inténtalo más tarde.'
  return 'No se pudo completar la solicitud.'
}

// Una sola renovación en vuelo: varias peticiones que reciben 401 a la vez esperan
// la misma promesa en lugar de rotar el refresh token en paralelo.
let refreshInFlight: Promise<StoredSession | null> | null = null

async function refreshSession(): Promise<StoredSession | null> {
  const session = tokenStorage.get()
  if (session === null) return null
  if (refreshInFlight === null) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_URL}${REFRESH_PATH}`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: session.refresh_token }),
        })
        if (!response.ok) return null
        const renewed = (await response.json()) as Omit<StoredSession, 'realm'>
        const updated: StoredSession = { ...renewed, realm: session.realm }
        tokenStorage.set(updated)
        return updated
      } catch {
        return null
      } finally {
        refreshInFlight = null
      }
    })()
  }
  return refreshInFlight
}

async function performRequest(
  path: string,
  options: ApiRequestOptions,
  token: string | null,
): Promise<Response> {
  const { body, formData, headers, method, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  signal?.addEventListener('abort', () => controller.abort())

  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        // El navegador debe fijar el boundary del multipart: no se toca Content-Type.
        ...(body !== undefined && formData === undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(token !== null ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { accessToken, skipAuth = false, responseType = 'json' } = options
  const session = tokenStorage.get()
  let token = skipAuth ? null : (accessToken ?? session?.access_token ?? null)

  let response: Response
  try {
    response = await performRequest(path, options, token)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('La solicitud tardó demasiado y fue cancelada.', 408)
    }
    throw new ApiError('No se pudo contactar con el servidor.', 0)
  }

  // 401 con sesión almacenada: se intenta renovar una vez y se repite la petición.
  if (response.status === 401 && !skipAuth && accessToken === undefined && session !== null) {
    const renewed = await refreshSession()
    if (renewed !== null) {
      token = renewed.access_token
      response = await performRequest(path, options, token)
    }
  }

  if (response.status === 401 && !skipAuth) {
    tokenStorage.clear()
    notifySessionExpired()
    throw new ApiError('Tu sesión expiró. Vuelve a iniciar sesión.', 401)
  }

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null)
    throw new ApiError(messageForStatus(response.status, extractDetail(data)), response.status)
  }

  if (response.status === 204) return null as T
  if (responseType === 'blob') return (await response.blob()) as T
  return (await response.json().catch(() => null)) as T
}

/** Descarga un archivo del backend respetando la sesión (no sirve un enlace directo). */
export async function downloadFile(path: string, fallbackName: string): Promise<void> {
  const session = tokenStorage.get()
  const response = await fetch(`${API_URL}${path}`, {
    headers: session !== null ? { Authorization: `Bearer ${session.access_token}` } : undefined,
  })
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null)
    throw new ApiError(messageForStatus(response.status, extractDetail(data)), response.status)
  }
  const disposition = response.headers.get('content-disposition') ?? ''
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = match !== null ? decodeURIComponent(match[1]) : fallbackName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function apiDownload(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const token = tokenStorage.get()?.access_token ?? null
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: 'application/pdf,application/octet-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (response.status === 401) {
    tokenStorage.clear()
    if (window.location.pathname !== '/login') window.location.href = '/login'
    throw new ApiError('Sesión expirada', 401)
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null) as { detail?: string } | null
    throw new ApiError(data?.detail ?? 'No se pudo descargar el archivo', response.status)
  }

  const disposition = response.headers.get('content-disposition')
  const filename = disposition?.match(/filename\*?=(?:UTF-8''|\")?([^";]+)/i)?.[1] ?? null
  return { blob: await response.blob(), filename: filename ? decodeURIComponent(filename) : null }
}
