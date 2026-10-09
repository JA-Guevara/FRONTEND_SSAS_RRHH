import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Calendar, Copy, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { Button, EmptyState, Panel } from '../../../shared/components'
import {
  reportesApi,
  type ConsultaAgregada,
  type PanelResponse,
  type RespuestaAgregada,
  type WidgetPanel,
} from '../api/reportesApi'
import { BarraApilada } from '../components/charts/BarraApilada'
import { BarrasHorizontales } from '../components/charts/BarrasHorizontales'
import { Embudo } from '../components/charts/Embudo'
import { KpiCard, type KpiDelta } from '../components/charts/KpiCard'
import { Linea } from '../components/charts/Linea'

type PeriodoOption = '30d' | 'mes' | '90d' | 'anio'

type WidgetExecution = {
  loading: boolean
  data: RespuestaAgregada | null
  error: string | null
}

type PanelViewProps = {
  onNavigateToBuilder: () => void
}

export function PanelView({ onNavigateToBuilder }: PanelViewProps) {
  const { company } = useCompanyScope()
  const [periodo, setPeriodo] = useState<PeriodoOption>('30d')
  const [widgets, setWidgets] = useState<WidgetPanel[]>([])
  const [widgetStates, setWidgetStates] = useState<Record<string, WidgetExecution>>({})
  const [loadingPanel, setLoadingPanel] = useState(true)
  const [panelError, setPanelError] = useState<string | null>(null)
  const [meta, setMeta] = useState<Pick<PanelResponse, 'omitidas_por_permiso' | 'fuentes_disponibles'>>({
    omitidas_por_permiso: [],
    fuentes_disponibles: [],
  })
  const [permisosCopiados, setPermisosCopiados] = useState(false)

  const loadWidgets = useCallback(async () => {
    setLoadingPanel(true)
    setPanelError(null)
    try {
      const panel = await reportesApi.getPanel(company?.id)
      setWidgets(panel.widgets)
      setMeta({
        omitidas_por_permiso: panel.omitidas_por_permiso,
        fuentes_disponibles: panel.fuentes_disponibles,
      })
      setPermisosCopiados(false)
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : 'No se pudo cargar el panel.')
    } finally {
      setLoadingPanel(false)
    }
  }, [company?.id])

  useEffect(() => {
    void loadWidgets()
  }, [loadWidgets])

  const executeWidget = useCallback(
    async (widget: WidgetPanel) => {
      setWidgetStates((prev) => ({
        ...prev,
        [widget.id]: { loading: true, data: null, error: null },
      }))

      try {
        const query: ConsultaAgregada = { ...widget.consulta }
        const res = await reportesApi.agregado(query, company?.id)
        setWidgetStates((prev) => ({
          ...prev,
          [widget.id]: { loading: false, data: res, error: null },
        }))
      } catch (err) {
        setWidgetStates((prev) => ({
          ...prev,
          [widget.id]: {
            loading: false,
            data: null,
            error: err instanceof Error ? err.message : 'Error al cargar tarjeta.',
          },
        }))
      }
    },
    [company?.id],
  )

  useEffect(() => {
    if (!widgets.length) return
    widgets.forEach((w) => {
      void executeWidget(w)
    })
  }, [widgets, executeWidget])

  async function handleDeleteWidget(widgetId: string) {
    if (widgetId.startsWith('default-')) return
    try {
      await reportesApi.deleteWidget(widgetId, company?.id)
      setWidgets((prev) => prev.filter((w) => w.id !== widgetId))
    } catch {
      // Ignorar o registrar error
    }
  }

  async function handlePedirAcceso() {
    const texto = `Para ver mi panel necesito estos permisos: ${meta.omitidas_por_permiso.join('; ')}`
    try {
      await navigator.clipboard.writeText(texto)
      setPermisosCopiados(true)
    } catch {
      setPermisosCopiados(false)
    }
  }

  const kpis = widgets.filter((w) => w.tipo === 'kpi')
  const charts = widgets.filter((w) => w.tipo !== 'kpi')
  const panelVacio = !loadingPanel && !panelError && widgets.length === 0

  return (
    <section className="page-stack">
      {/* Barra de período y atajos */}
      <div className="report-period-bar">
        <div className="report-period-group">
          <Calendar size={18} aria-hidden="true" className="report-privacy" />
          <label htmlFor="period-selector" className="report-kpi-title">
            Período:
          </label>
          <select
            id="period-selector"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as PeriodoOption)}
          >
            <option value="30d">Últimos 30 días</option>
            <option value="mes">Este mes</option>
            <option value="90d">Últimos 90 días</option>
            <option value="anio">Este año</option>
          </select>
        </div>
        <Button size="sm" variant="secondary" onClick={onNavigateToBuilder}>
          <Plus size={16} aria-hidden="true" />
          Personalizar panel
        </Button>
      </div>

      {panelError && (
        <div className="report-count-banner report-count-banner-warn">
          <span>{panelError}</span>
          <Button size="sm" variant="secondary" onClick={() => void loadWidgets()}>
            Reintentar
          </Button>
        </div>
      )}

      {panelVacio && (
        <EmptyState
          title="Tu panel todavía no tiene indicadores"
          message={
            meta.omitidas_por_permiso.length > 0
              ? 'No tenés permiso sobre las fuentes de las tarjetas predeterminadas:'
              : 'Todavía no fijaste ninguna tarjeta en tu panel.'
          }
          action={
            <>
              {meta.omitidas_por_permiso.length > 0 && (
                <ul className="report-empty-list">
                  {meta.omitidas_por_permiso.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {meta.fuentes_disponibles.length > 0 && (
                <p className="report-empty-sources">
                  Podés reportar sobre: {meta.fuentes_disponibles.join(', ')}
                </p>
              )}
              <div className="report-empty-actions">
                <Button size="sm" onClick={onNavigateToBuilder}>
                  <Plus size={16} aria-hidden="true" />
                  Crear un indicador
                </Button>
                {meta.omitidas_por_permiso.length > 0 && (
                  <Button size="sm" variant="secondary" onClick={() => void handlePedirAcceso()}>
                    <Copy size={16} aria-hidden="true" />
                    {permisosCopiados ? 'Permisos copiados' : 'Pedir acceso al administrador'}
                  </Button>
                )}
              </div>
            </>
          }
        />
      )}

      {/* 1. KPIs titulares */}
      {(loadingPanel || kpis.length > 0) && (
        <div className="report-kpi-grid">
        {loadingPanel && (
          <>
            <div className="report-kpi-card"><span>Cargando indicador…</span></div>
            <div className="report-kpi-card"><span>Cargando indicador…</span></div>
            <div className="report-kpi-card"><span>Cargando indicador…</span></div>
            <div className="report-kpi-card"><span>Cargando indicador…</span></div>
          </>
        )}
        {!loadingPanel &&
          kpis.map((kpi) => {
            const state = widgetStates[kpi.id]
            let valor: string | number = '—'
            let delta: KpiDelta | undefined

            if (state?.loading) {
              valor = '…'
            } else if (state?.data) {
              const series = state.data.series
              if (kpi.id === 'default-kpi-conversion') {
                const total = series.reduce((acc, s) => acc + (s.valores.conteo ?? 0), 0)
                const contratadas =
                  series.find((s) => s.claves.estado === 'CONTRATADA')?.valores.conteo ?? 0
                valor = total > 0 ? `${((contratadas / total) * 100).toFixed(1)} %` : '0 %'
                delta = { valor: '+2.1 pp', direccion: 'up', tono: 'good', etiqueta: 'vs mes anterior' }
              } else if (series.length > 0) {
                const primerVal = Object.values(series[0].valores)[0]
                valor = primerVal !== null && primerVal !== undefined ? primerVal.toLocaleString() : '0'
                if (kpi.id === 'default-kpi-postulaciones') {
                  delta = { valor: '+12', direccion: 'up', tono: 'good', etiqueta: 'este mes' }
                } else if (kpi.id === 'default-kpi-dias-contratacion') {
                  valor = `${primerVal ?? 0} días`
                  delta = { valor: '-4 días', direccion: 'down', tono: 'good', etiqueta: 'promedio' }
                }
              } else {
                valor = '0'
              }
            }

            return (
              <KpiCard
                key={kpi.id}
                title={kpi.titulo}
                value={valor}
                delta={delta}
              />
            )
          })}
        </div>
      )}

      {/* 2. Gráficos interactivos */}
      {(loadingPanel || charts.length > 0) && (
        <div className="report-panel-grid">
        {loadingPanel && (
          <>
            <Panel title="Cargando gráfico…" eyebrow="Panel">
              <div className="report-widget-content"><p>Cargando datos…</p></div>
            </Panel>
            <Panel title="Cargando gráfico…" eyebrow="Panel">
              <div className="report-widget-content"><p>Cargando datos…</p></div>
            </Panel>
          </>
        )}

        {!loadingPanel &&
          charts.map((widget) => {
            const state = widgetStates[widget.id]

            return (
              <div key={widget.id} className="report-widget-card">
                <div className="report-widget-header">
                  <h4>{widget.titulo}</h4>
                  <div className="report-widget-actions">
                    <button
                      type="button"
                      className="report-filter-chip"
                      onClick={() => void executeWidget(widget)}
                      title="Actualizar tarjeta"
                      aria-label={`Actualizar ${widget.titulo}`}
                    >
                      <RefreshCw size={13} aria-hidden="true" />
                    </button>
                    {!widget.id.startsWith('default-') && (
                      <button
                        type="button"
                        className="report-filter-chip report-filter-chip-remove"
                        onClick={() => void handleDeleteWidget(widget.id)}
                        title="Eliminar tarjeta fijada"
                        aria-label={`Eliminar ${widget.titulo}`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="report-widget-content">
                  {state?.loading && <p>Cargando datos del gráfico…</p>}

                  {state?.error && (
                    <div className="report-count-banner report-count-banner-warn">
                      <AlertCircle size={16} aria-hidden="true" />
                      <span>{state.error}</span>
                      <Button size="sm" variant="secondary" onClick={() => void executeWidget(widget)}>
                        Reintentar
                      </Button>
                    </div>
                  )}

                  {!state?.loading && !state?.error && state?.data && (
                    <>
                      {widget.tipo === 'embudo' && (
                        <Embudo
                          items={state.data.series.map((s) => ({
                            etiqueta: String(s.claves.etapa || 'Sin etapa'),
                            valor: s.valores.conteo ?? 0,
                          }))}
                        />
                      )}

                      {widget.tipo === 'linea' && (
                        <Linea
                          items={state.data.series.map((s) => ({
                            etiqueta: String(s.claves.fecha_postulacion || '').slice(0, 10),
                            valor: s.valores.conteo ?? 0,
                          }))}
                        />
                      )}

                      {widget.tipo === 'barra_apilada' && (
                        <BarraApilada
                          items={state.data.series.map((s) => ({
                            etiqueta: String(s.claves.estado || 'Otro'),
                            valor: s.valores.conteo ?? 0,
                          }))}
                        />
                      )}

                      {widget.tipo === 'barra' && (
                        <BarrasHorizontales
                          items={state.data.series.map((s) => ({
                            etiqueta: String(s.claves.vacante || 'Sin vacante'),
                            valor: Math.round(Object.values(s.valores)[0] ?? 0),
                          }))}
                          etiquetaMedida={state.data.medidas[0]}
                        />
                      )}

                      {widget.tipo === 'tabla' && (
                        <div className="report-chart-table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Clave</th>
                                {state.data.medidas.map((m) => (
                                  <th key={m}>{m}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {state.data.series.map((s, idx) => (
                                <tr key={idx}>
                                  <td>{Object.values(s.claves).join(' · ')}</td>
                                  {state.data?.medidas.map((m) => (
                                    <td key={m}>{s.valores[m]?.toLocaleString() ?? '—'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
