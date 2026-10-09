import { apiRequest, buildQuery } from '../../../shared/api/httpClient'

export type Filter = {
  campo: string
  operador: 'igual' | 'contiene' | 'mayor_igual' | 'menor_igual' | 'entre'
  valor: unknown
}

export type Order = {
  campo: string
  direccion: 'asc' | 'desc'
}

export type ReportConfig = {
  fuente: string
  columnas: string[]
  filtros: Filter[]
  orden: Order[]
}

export type TipoCampo = 'texto' | 'numero' | 'fecha' | 'booleano' | 'enum'
export type Sensibilidad = 'publico' | 'interno' | 'personal' | 'confidencial'

export type CampoInfo = {
  codigo: string
  etiqueta: string
  tipo: TipoCampo
  sensibilidad: Sensibilidad
  agrupable: boolean
  agregable: boolean
  valores: string[]
}

export type Source = {
  codigo: string
  nombre: string
  etiqueta?: string
  descripcion?: string
  columnas: string[]
  campos?: CampoInfo[]
}

export type Preview = {
  columnas: string[]
  items: Record<string, unknown>[]
  total: number
  page: number
  per_page: number
  truncado?: boolean
  total_exacto?: boolean
}

export type Interpretation = {
  config: ReportConfig | null
  aclaracion: string | null
}

export type Agregacion = 'conteo' | 'conteo_distinto' | 'suma' | 'promedio' | 'minimo' | 'maximo'

export type Medida = {
  agregacion: Agregacion
  campo?: string
  etiqueta?: string
}

export type ConsultaAgregada = {
  fuente: string
  medidas: Medida[]
  agrupar_por?: string[]
  granularidad?: 'dia' | 'semana' | 'mes' | 'trimestre' | 'anio'
  filtros?: Filter[]
  orden?: Order[]
  limite?: number
  comparar_con?: 'periodo_anterior' | null
}

export type SerieAgregada = {
  claves: Record<string, unknown>
  valores: Record<string, number | null>
}

export type RespuestaAgregada = {
  series: SerieAgregada[]
  medidas: string[]
  total_grupos: number
  truncado: boolean
  generado_en: string
  milisegundos: number
  delta?: number | null
  deltas?: Record<string, number | null> | null
}

export type WidgetTipo = 'kpi' | 'linea' | 'barra' | 'barra_apilada' | 'embudo' | 'tabla' | 'linea_tiempo'

export type WidgetPanel = {
  id: string
  empresa_id: string
  usuario_id: string
  titulo: string
  tipo: WidgetTipo
  consulta: ConsultaAgregada
  posicion: number
  ancho: number
  activo: boolean
  fecha_registro: string
}

export type CrearWidgetPanel = {
  titulo: string
  tipo: WidgetTipo
  consulta: ConsultaAgregada
  posicion?: number
  ancho?: number
}

export type PanelResponse = {
  widgets: WidgetPanel[]
  origen: 'guardadas' | 'predeterminadas'
  omitidas_por_permiso: string[]
  fuentes_disponibles: string[]
}

export type ConteoResponse = {
  total: number
  excede_limite: boolean
  limite_del_plan: number
}

export type EjecucionResponse = {
  id: string
  reporte_id?: string | null
  usuario_id: string
  formato: string
  estado: string
  cantidad_registros?: number | null
  error?: string | null
  fecha_inicio: string
  fecha_fin?: string | null
}

export type SavedReport = {
  id: string
  nombre: string
  fuente: string
  columnas: string[]
  filtros: Filter[]
  orden: Order[]
  activo?: boolean
  fecha_registro?: string
}

const scope = (empresaId?: string) => buildQuery({ empresa_id: empresaId })

export const reportesApi = {
  catalog: () => apiRequest<Source[]>('/api/v1/reportes/catalogo'),
  interpret: (texto: string, empresaId?: string) =>
    apiRequest<Interpretation>(`/api/v1/reportes/interpretar${scope(empresaId)}`, {
      method: 'POST', body: { texto }, timeoutMs: 35_000,
    }),
  preview: (config: ReportConfig, empresaId?: string, page = 1, perPage = 25) =>
    apiRequest<Preview>(
      `/api/v1/reportes/vista-previa${buildQuery({ empresa_id: empresaId, page, per_page: perPage })}`,
      { method: 'POST', body: config },
    ),
  conteo: (config: ReportConfig, empresaId?: string) =>
    apiRequest<ConteoResponse>(`/api/v1/reportes/conteo${scope(empresaId)}`, {
      method: 'POST', body: config,
    }),
  agregado: (consulta: ConsultaAgregada, empresaId?: string) =>
    apiRequest<RespuestaAgregada>(`/api/v1/reportes/agregado${scope(empresaId)}`, {
      method: 'POST', body: consulta,
    }),
  getPanel: (empresaId?: string) =>
    apiRequest<PanelResponse>(`/api/v1/reportes/panel${scope(empresaId)}`),
  createWidget: (body: CrearWidgetPanel, empresaId?: string) =>
    apiRequest<WidgetPanel>(`/api/v1/reportes/panel${scope(empresaId)}`, {
      method: 'POST', body,
    }),
  deleteWidget: (widgetId: string, empresaId?: string) =>
    apiRequest(`/api/v1/reportes/panel/${widgetId}${scope(empresaId)}`, {
      method: 'DELETE',
    }),
  listSaved: (empresaId?: string) =>
    apiRequest<SavedReport[]>(`/api/v1/reportes${scope(empresaId)}`),
  create: (nombre: string, config: ReportConfig, empresaId?: string) =>
    apiRequest(`/api/v1/reportes${scope(empresaId)}`, { method: 'POST', body: { nombre, ...config } }),
  export: (format: 'xlsx' | 'csv' | 'pdf' | 'html', config: ReportConfig, empresaId?: string) =>
    apiRequest<Blob>(`/api/v1/reportes/exportar/${format}${scope(empresaId)}`, {
      method: 'POST', body: config, responseType: 'blob',
    }),
  send: (body: { destinatarios: string[]; formato: 'xlsx' | 'csv' | 'pdf'; fuente: string; columnas: string[]; filtros: Filter[]; orden: Order[] }, empresaId?: string) =>
    apiRequest<{ message: string }>(`/api/v1/reportes/enviar${scope(empresaId)}`, {
      method: 'POST', body,
    }),
  ejecuciones: (empresaId?: string, limite = 50) =>
    apiRequest<EjecucionResponse[]>(`/api/v1/reportes/ejecuciones${buildQuery({ empresa_id: empresaId, limite })}`),
  exportPanelPdf: (empresaId?: string) =>
    apiRequest<Blob>(`/api/v1/reportes/panel/exportar-pdf${scope(empresaId)}`, {
      method: 'POST',
      responseType: 'blob',
    }),
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
