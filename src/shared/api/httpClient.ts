import { tokenStorage } from '../../features/auth/storage/tokenStorage'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiRequestOptions = {
  accessToken?: string
  body?: unknown
  headers?: Record<string, string>
  method?: string
  skipAuth?: boolean
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { accessToken, body, headers, skipAuth = false, ...requestOptions } = options

  const session = tokenStorage.get()
  const token = skipAuth ? null : (accessToken ?? session?.access_token ?? null)

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data: unknown =
    response.status === 204
      ? null
      : await response.json().catch(() => null)

  let detail: string | null = null
  if (data && typeof data === 'object' && 'detail' in data) {
    const rawDetail = (data as { detail: unknown }).detail
    if (typeof rawDetail === 'string') detail = rawDetail
    if (Array.isArray(rawDetail)) {
      detail = rawDetail
        .map((item) => item && typeof item === 'object' && 'msg' in item ? String(item.msg) : '')
        .filter(Boolean)
        .join('. ')
    }
  }

  // Manejo del 401: limpia sesión y redirige al login
  if (response.status === 401 && !skipAuth) {
    tokenStorage.clear()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    throw new ApiError(detail ?? 'Sesión expirada', 401)
  }

  if (!response.ok) {
    throw new ApiError(detail ?? 'No se pudo completar la solicitud', response.status)
  }

  return data as T
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
