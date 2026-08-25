import { apiRequest } from '../../../shared/api/httpClient.js'

export const bitacoraApi = {
	health: () => apiRequest('/bitacora/health'),
	list: (filters = {}, accessToken) => {
		const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
		return apiRequest(`/bitacora${params.toString() ? `?${params}` : ''}`, { accessToken })
	},
}
