import { tokenStorage } from '../../features/auth/storage/tokenStorage'

const API_URL = import.meta.env.VITE_API_URL ?? ''

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
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { accessToken, body, headers, ...requestOptions } = options

  const session = tokenStorage.get()
  const token = accessToken ?? session?.access_token ?? null

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

  const detail =
    data &&
    typeof data === 'object' &&
    'detail' in data &&
    typeof (data as { detail: unknown }).detail === 'string'
      ? (data as { detail: string }).detail
      : null

  // Manejo del 401: limpia sesión y redirige al login
  if (response.status === 401) {
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