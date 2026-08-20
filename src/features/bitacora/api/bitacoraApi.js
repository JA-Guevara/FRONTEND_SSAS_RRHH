import { apiRequest } from '../../../shared/api/httpClient.js'

export const bitacoraApi = { health: () => apiRequest('/bitacora/health') }
