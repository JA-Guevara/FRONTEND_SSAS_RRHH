import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Download,
  Filter as FilterIcon,
  Lock,
  Mail,
  Plus,
  Save,
  Search,
  X,
} from 'lucide-react'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { Button, Field, Panel } from '../../../shared/components'
import {
  reportesApi,
  saveBlob,
  type CampoInfo,
  type ConteoResponse,
  type Filter,
  type Preview,
  type ReportConfig,
  type SavedReport,
  type Source,
} from '../api/reportesApi'

const EMPTY_FILTER: Filter = { campo: '', operador: 'igual', valor: '' }

type ExploradorViewProps = {
  sources: Source[]
  onNavigateToBuilder?: (config: ReportConfig) => void
}

export function ExploradorView({ sources }: ExploradorViewProps) {
  const { company } = useCompanyScope()
  const [sourceCode, setSourceCode] = useState(sources[0]?.codigo ?? 'postulaciones')
  const [columns, setColumns] = useState<string[]>([])
  const [filters, setFilters] = useState<Filter[]>([])
  const [orderField, setOrderField] = useState('')
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [selectedReportId, setSelectedReportId] = useState('')

  const [preview, setPreview] = useState<Preview | null>(null)
  const [conteo, setConteo] = useState<ConteoResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Modales
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState('')
  const [emailFormat, setEmailFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sensitiveModal, setSensitiveModal] = useState<{ campo: CampoInfo } | null>(null)

  const currentSource = useMemo(
    () => sources.find((s) => s.codigo === sourceCode) ?? sources[0],
    [sources, sourceCode],
  )

  // Cargar reportes guardados
  useEffect(() => {
    reportesApi.listSaved(company?.id).then(setSavedReports).catch(() => {})
  }, [company?.id])

  // Al cambiar de fuente, inicializar columnas por defecto
  useEffect(() => {
    if (currentSource && (!columns.length || !columns.some((c) => currentSource.columnas.includes(c)))) {
      const iniciales = (currentSource.campos ?? [])
        .filter((c) => c.sensibilidad === 'publico')
        .slice(0, 5)
        .map((c) => c.codigo)
      setColumns(iniciales.length ? iniciales : currentSource.columnas.slice(0, 5))
      setFilters([])
      setOrderField('')
      setPage(1)
    }
  }, [currentSource, columns])

  const config = useMemo<ReportConfig>(() => ({
    fuente: sourceCode,
    columnas: columns,
    filtros: filters.filter((f) => f.campo && f.valor !== ''),
    orden: orderField ? [{ campo: orderField, direccion: orderDir }] : [],
  }), [sourceCode, columns, filters, orderField, orderDir])

  // Conteo con debounce
  useEffect(() => {
    if (!config.columnas.length) return
    let canceled = false
    const timer = window.setTimeout(async () => {
      try {
        const res = await reportesApi.conteo(config, company?.id)
        if (!canceled) setConteo(res)
      } catch {
        // Conteo opcional
      }
    }, 350)
    return () => {
      canceled = true
      window.clearTimeout(timer)
    }
  }, [config, company?.id])

  // Previsualización de datos
  const loadData = useCallback(async () => {
    if (!config.columnas.length) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await reportesApi.preview(config, company?.id, page, 50)
      setPreview(res)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo cargar la vista previa.')
    } finally {
      setBusy(false)
    }
  }, [config, company?.id, page])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function handleSelectSavedReport(id: string) {
    setSelectedReportId(id)
    if (!id) return
    const rep = savedReports.find((r) => r.id === id)
    if (rep) {
      setSourceCode(rep.fuente)
      setColumns(rep.columnas)
      setFilters(rep.filtros)
      setOrderField(rep.orden[0]?.campo ?? '')
      setOrderDir(rep.orden[0]?.direccion ?? 'asc')
      setPage(1)
    }
  }

  function handleToggleColumn(campo: CampoInfo) {
    if (columns.includes(campo.codigo)) {
      setColumns((curr) => curr.filter((c) => c !== campo.codigo))
      return
    }
    if (campo.sensibilidad === 'personal' || campo.sensibilidad === 'confidencial') {
      setSensitiveModal({ campo })
    } else {
      setColumns((curr) => [...curr, campo.codigo])
    }
  }

  function confirmSensitiveColumn() {
    if (sensitiveModal) {
      setColumns((curr) => [...curr, sensitiveModal.campo.codigo])
      setSensitiveModal(null)
    }
  }

  async function handleExport(format: 'xlsx' | 'csv' | 'pdf') {
    setBusy(true)
    setMessage(null)
    try {
      const blob = await reportesApi.export(format, config, company?.id)
      saveBlob(blob, `reporte_${sourceCode}.${format}`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo exportar el archivo.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSendEmail() {
    const list = emailRecipients
      .split(/[,;\n]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0)
    if (!list.length) return
    setSendingEmail(true)
    try {
      await reportesApi.send(
        {
          destinatarios: list,
          formato: emailFormat,
          fuente: config.fuente,
          columnas: config.columnas,
          filtros: config.filtros,
          orden: config.orden,
        },
        company?.id,
      )
      setShowEmailModal(false)
      setEmailRecipients('')
      setMessage('El reporte fue enviado por correo correctamente.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error al enviar por correo.')
    } finally {
      setSendingEmail(false)
    }
  }

  async function handleSaveDefinition() {
    if (!saveName.trim()) return
    try {
      await reportesApi.create(saveName.trim(), config, company?.id)
      setShowSaveModal(false)
      setSaveName('')
      setMessage('Definición de reporte guardada correctamente.')
      reportesApi.listSaved(company?.id).then(setSavedReports).catch(() => {})
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error al guardar reporte.')
    }
  }

  const itemsFiltrados = useMemo(() => {
    if (!preview?.items) return []
    if (!searchTerm.trim()) return preview.items
    const term = searchTerm.toLowerCase()
    return preview.items.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(term)),
    )
  }, [preview?.items, searchTerm])

  return (
    <section className="page-stack">
      {/* 1. Selector de fuente y reporte guardado */}
      <div className="report-explorer-header">
        <Field label="Fuente de datos">
          <select
            value={sourceCode}
            onChange={(e) => {
              setSourceCode(e.target.value)
              setSelectedReportId('')
            }}
          >
            {sources.map((s) => (
              <option key={s.codigo} value={s.codigo}>
                {s.nombre || s.etiqueta || s.codigo}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Reporte guardado">
          <select
            value={selectedReportId}
            onChange={(e) => handleSelectSavedReport(e.target.value)}
          >
            <option value="">(Ninguno · Vista personalizada)</option>
            {savedReports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre} ({r.fuente})
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* 2. Barra de herramientas interactiva */}
      <div className="report-explorer-toolbar">
        <div className="report-period-group">
          <div className="report-search-wrap">
            <Search size={15} aria-hidden="true" className="report-privacy" />
            <input
              placeholder="Buscar en resultados…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setFilters((curr) => [...curr, { ...EMPTY_FILTER }])}
          >
            <Plus size={15} aria-hidden="true" />
            Filtro
          </Button>
        </div>

        <div className="report-period-group">
          <Button size="sm" variant="secondary" onClick={() => setShowSaveModal(true)}>
            <Save size={15} aria-hidden="true" />
            Guardar vista
          </Button>
          <Button size="sm" variant="secondary" onClick={() => void handleExport('xlsx')}>
            <Download size={15} aria-hidden="true" />
            Excel
          </Button>
          <Button size="sm" variant="secondary" onClick={() => void handleExport('csv')}>
            <Download size={15} aria-hidden="true" />
            CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={() => void handleExport('pdf')}>
            <Download size={15} aria-hidden="true" />
            PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowEmailModal(true)}>
            <Mail size={15} aria-hidden="true" />
            Enviar
          </Button>
        </div>
      </div>

      {/* Selector de columnas con candado para sensibles */}
      <div className="report-columns">
        <span className="report-kpi-title">Columnas visibles:</span>
        {(currentSource?.campos ?? currentSource?.columnas.map((c) => ({
          codigo: c,
          etiqueta: c.replaceAll('_', ' '),
          tipo: 'texto' as const,
          sensibilidad: 'publico' as const,
          agrupable: true,
          agregable: false,
          valores: [],
        })) ?? []).map((campo) => {
          const checked = columns.includes(campo.codigo)
          const isSensitive =
            campo.sensibilidad === 'personal' || campo.sensibilidad === 'confidencial'
          return (
            <label key={campo.codigo} className="check-label">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggleColumn(campo)}
              />
              <span>{campo.etiqueta}</span>
              {isSensitive && (
                <span className="report-column-sensitive-lock" title={`Dato ${campo.sensibilidad}`}>
                  <Lock size={12} aria-hidden="true" />
                </span>
              )}
            </label>
          )
        })}
      </div>

      {/* Fichas de filtros activos */}
      {filters.length > 0 && (
        <div className="report-filter-chips">
          {filters.map((filtro, idx) => (
            <div key={idx} className="report-filter-chip">
              <select
                aria-label={`Campo del filtro ${idx + 1}`}
                value={filtro.campo}
                onChange={(e) =>
                  setFilters((curr) =>
                    curr.map((f, i) => (i === idx ? { ...f, campo: e.target.value } : f)),
                  )
                }
              >
                <option value="">Campo</option>
                {currentSource?.columnas.map((c) => (
                  <option key={c} value={c}>
                    {c.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <select
                aria-label={`Operador del filtro ${idx + 1}`}
                value={filtro.operador}
                onChange={(e) =>
                  setFilters((curr) =>
                    curr.map((f, i) =>
                      i === idx ? { ...f, operador: e.target.value as Filter['operador'] } : f,
                    ),
                  )
                }
              >
                <option value="igual">=</option>
                <option value="contiene">contiene</option>
                <option value="mayor_igual">≥</option>
                <option value="menor_igual">≤</option>
              </select>
              <input
                aria-label={`Valor del filtro ${idx + 1}`}
                value={String(filtro.valor)}
                onChange={(e) =>
                  setFilters((curr) =>
                    curr.map((f, i) => (i === idx ? { ...f, valor: e.target.value } : f)),
                  )
                }
                placeholder="Valor…"
              />
              <button
                type="button"
                className="report-filter-chip-remove"
                onClick={() => setFilters((curr) => curr.filter((_, i) => i !== idx))}
                aria-label={`Quitar filtro ${idx + 1}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Contador de registros (Resuelve F-1) */}
      <div
        className={`report-count-banner ${
          conteo?.excede_limite || (preview?.total ?? 0) >= 5000
            ? 'report-count-banner-warn'
            : ''
        }`}
      >
        <span>
          {conteo
            ? `${conteo.total.toLocaleString()} registros encontrados · se muestran ${itemsFiltrados.length}`
            : preview
            ? `${preview.total.toLocaleString()} registros cargados`
            : 'Contando registros…'}
          {orderField ? ` · ordenado por ${orderField} (${orderDir})` : ''}
        </span>

        {(conteo?.excede_limite || (conteo?.total ?? 0) > 5000) && (
          <span>
            <AlertTriangle size={15} aria-hidden="true" />
            Límite excedido. Agrega filtros de fecha para no truncar la exportación.
          </span>
        )}
      </div>

      {message && <div className="report-count-banner"><span>{message}</span></div>}

      {/* 4. Tabla de datos paginada */}
      <Panel title="Registros de la consulta" count={`${itemsFiltrados.length} en página`}>
        {busy ? (
          <p>Cargando registros…</p>
        ) : !preview?.items.length ? (
          <div className="inline-empty">
            <FilterIcon size={18} aria-hidden="true" />
            <span>No se encontraron registros con los filtros actuales.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c}
                      onClick={() => {
                        if (orderField === c) {
                          setOrderDir((curr) => (curr === 'asc' ? 'desc' : 'asc'))
                        } else {
                          setOrderField(c)
                          setOrderDir('asc')
                        }
                      }}
                      title="Haz clic para ordenar"
                    >
                      {c.replaceAll('_', ' ')}
                      {orderField === c ? (orderDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itemsFiltrados.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {columns.map((c) => (
                      <td key={c}>{String(row[c] ?? '—')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {preview && (
          <div className="form-actions">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1 || busy}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Anterior
            </Button>
            <span className="report-kpi-title">Página {page}</span>
            <Button
              size="sm"
              variant="secondary"
              disabled={itemsFiltrados.length < 50 || busy}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </Panel>

      {/* Modal: Confirmación de columna sensible (Resuelve F-2) */}
      {sensitiveModal && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Confirmar columna sensible">
            <div className="modal-header">
              <h3>Dato personal sensible</h3>
            </div>
            <div className="modal-body">
              <p>
                Vas a incluir <strong>{sensitiveModal.campo.etiqueta}</strong>. Esta acción
                quedará auditada con tu usuario en la bitácora del sistema para cumplimiento de
                protección de datos personales.
              </p>
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setSensitiveModal(null)}>
                Cancelar
              </Button>
              <Button onClick={confirmSensitiveColumn}>Incluir columna</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Guardar vista */}
      {showSaveModal && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Guardar definición de reporte">
            <div className="modal-header">
              <h3>Guardar definición de reporte</h3>
            </div>
            <div className="modal-body">
              <Field label="Nombre del reporte">
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Ej. Postulaciones activas por vacante"
                />
              </Field>
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => void handleSaveDefinition()} disabled={!saveName.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enviar por correo */}
      {showEmailModal && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Enviar reporte por correo">
            <div className="modal-header">
              <h3>Enviar reporte por correo</h3>
            </div>
            <div className="modal-body">
              <Field label="Destinatarios (separados por coma)">
                <input
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="gerencia@empresa.com, rrhh@empresa.com"
                />
              </Field>
              <Field label="Formato de adjunto">
                <select
                  value={emailFormat}
                  onChange={(e) => setEmailFormat(e.target.value as 'xlsx' | 'csv' | 'pdf')}
                >
                  <option value="xlsx">Excel (XLSX con parámetros)</option>
                  <option value="csv">CSV (con codificación UTF-8 BOM)</option>
                  <option value="pdf">PDF (con membrete y paginación)</option>
                </select>
              </Field>
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
                Cancelar
              </Button>
              <Button
                loading={sendingEmail}
                disabled={!emailRecipients.trim() || sendingEmail}
                onClick={() => void handleSendEmail()}
              >
                Enviar ahora
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
