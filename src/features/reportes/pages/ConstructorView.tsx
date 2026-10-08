import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Download,
  Eye,
  Filter as FilterIcon,
  Mic,
  Pin,
  Plus,
  Save,
  Square,
  Trash2,
} from 'lucide-react'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { Alert, Button, Field, Panel } from '../../../shared/components'
import {
  reportesApi,
  saveBlob,
  type Filter,
  type Preview,
  type ReportConfig,
  type Source,
} from '../api/reportesApi'

const EMPTY_FILTER: Filter = { campo: '', operador: 'igual', valor: '' }

type SpeechResult = { transcript: string }
type SpeechEvent = { resultIndex: number; results: ArrayLike<ArrayLike<SpeechResult>> }
type SpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognition
  webkitSpeechRecognition?: new () => SpeechRecognition
}

type ConstructorViewProps = {
  sources: Source[]
  onSavedReport?: () => void
  onPinnedToPanel?: () => void
}

export function ConstructorView({
  sources,
  onSavedReport,
  onPinnedToPanel,
}: ConstructorViewProps) {
  const { company } = useCompanyScope()
  const [mode, setMode] = useState<'ia' | 'wizard'>('ia')
  const [sourceCode, setSourceCode] = useState(sources[0]?.codigo ?? 'postulaciones')
  const [columns, setColumns] = useState<string[]>([])
  const [filters, setFilters] = useState<Filter[]>([])
  const [orderField, setOrderField] = useState('')
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [previewFor, setPreviewFor] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [interpreting, setInterpreting] = useState(false)
  const [listening, setListening] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [autoPreview, setAutoPreview] = useState(false)
  const [interpreted, setInterpreted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const voiceSupported =
    typeof window !== 'undefined' &&
    Boolean(
      (window as SpeechWindow).SpeechRecognition ||
        (window as SpeechWindow).webkitSpeechRecognition,
    )

  const source = useMemo(
    () => sources.find((item) => item.codigo === sourceCode) ?? sources[0],
    [sources, sourceCode],
  )

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const config = useMemo<ReportConfig>(
    () => ({
      fuente: sourceCode,
      columnas: columns,
      filtros: filters.filter((item) => item.campo && item.valor !== ''),
      orden: orderField ? [{ campo: orderField, direccion: direction }] : [],
    }),
    [sourceCode, columns, filters, orderField, direction],
  )

  const configKey = JSON.stringify([company?.id, config])
  const visiblePreview = previewFor === configKey ? preview : null

  useEffect(() => {
    if (!autoPreview) return
    if (!config.columnas.length) {
      setPreview(null)
      setBusy(false)
      return
    }
    let canceled = false
    const timer = window.setTimeout(async () => {
      setBusy(true)
      setPreview(null)
      setMessage(null)
      try {
        const result = await reportesApi.preview(config, company?.id)
        if (!canceled) {
          setPreview(result)
          setPreviewFor(configKey)
        }
      } catch (error) {
        if (!canceled) {
          setMessage(
            error instanceof Error ? error.message : 'No se pudo generar la vista previa.',
          )
        }
      } finally {
        if (!canceled) setBusy(false)
      }
    }, 350)
    return () => {
      canceled = true
      window.clearTimeout(timer)
    }
  }, [autoPreview, config, company?.id, configKey])

  async function interpret(text: string) {
    const query = text.trim()
    if (query.length < 3) return setMessage('Escribe una consulta más específica.')
    setInterpreting(true)
    setAutoPreview(false)
    setBusy(false)
    setPreview(null)
    setMessage(null)
    try {
      const result = await reportesApi.interpret(query, company?.id)
      if (!result.config) {
        setInterpreted(false)
        return setMessage(result.aclaracion || 'No pude interpretar la consulta.')
      }
      setSourceCode(result.config.fuente)
      setColumns(result.config.columnas)
      setFilters(result.config.filtros)
      setOrderField(result.config.orden[0]?.campo ?? '')
      setDirection(result.config.orden[0]?.direccion ?? 'asc')
      setInterpreted(true)
      setAutoPreview(true)
    } catch (error) {
      setInterpreted(false)
      setMessage(
        error instanceof Error ? error.message : 'No se pudo interpretar la consulta.',
      )
    } finally {
      setInterpreting(false)
    }
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const browser = window as SpeechWindow
    const Speech = browser.SpeechRecognition || browser.webkitSpeechRecognition
    if (!Speech)
      return setMessage('Este navegador no admite dictado. Puedes escribir la consulta.')
    const recognition = new Speech()
    recognitionRef.current = recognition
    recognition.lang = 'es-BO'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const text = event.results[event.resultIndex]?.[0]?.transcript.trim()
      if (text) {
        setPrompt(text)
        void interpret(text)
      }
    }
    recognition.onerror = (event) => {
      setMessage(
        event.error === 'not-allowed'
          ? 'Permite el acceso al micrófono para dictar la consulta.'
          : 'No se pudo transcribir el audio. Puedes escribir la consulta.',
      )
    }
    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }
    try {
      recognition.start()
      setListening(true)
    } catch {
      setMessage('No se pudo iniciar el dictado. Puedes escribir la consulta.')
    }
  }

  function changeSource(code: string) {
    setSourceCode(code)
    setColumns([])
    setFilters([])
    setOrderField('')
    setPreview(null)
    setBusy(false)
    setInterpreted(false)
  }

  async function runPreview() {
    if (!columns.length) return setMessage('Selecciona al menos una columna.')
    setAutoPreview(false)
    setBusy(true)
    setMessage(null)
    setPreview(null)
    try {
      setPreview(await reportesApi.preview(config, company?.id))
      setPreviewFor(configKey)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'No se pudo generar la vista previa.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function download(format: 'xlsx' | 'html' | 'pdf') {
    setBusy(true)
    setMessage(null)
    try {
      saveBlob(await reportesApi.export(format, config, company?.id), `reporte.${format}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo exportar.')
    } finally {
      setBusy(false)
    }
  }

  async function handlePinToPanel() {
    if (!columns.length) return setMessage('Selecciona al menos una columna.')
    try {
      await reportesApi.createWidget(
        {
          titulo: name.trim() || `Reporte de ${source?.nombre || sourceCode}`,
          tipo: 'tabla',
          consulta: {
            fuente: sourceCode,
            medidas: [{ agregacion: 'conteo' }],
            filtros: config.filtros,
            limite: 10,
          },
        },
        company?.id,
      )
      setMessage('Tarjeta fijada con éxito en el panel.')
      onPinnedToPanel?.()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al fijar tarjeta en panel.')
    }
  }

  async function handleSaveReport() {
    if (!name.trim() || !columns.length) return
    try {
      await reportesApi.create(name.trim(), config, company?.id)
      setMessage('Reporte guardado.')
      onSavedReport?.()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error al guardar reporte.')
    }
  }

  return (
    <section className="page-stack">
      {message && <Alert tone="info">{message}</Alert>}

      {/* Selector de modo: Describilo vs Paso a paso */}
      <div className="report-mode-toggle" role="tablist">
        <button
          type="button"
          className={`report-mode-btn ${mode === 'ia' ? 'report-mode-btn-active' : ''}`}
          onClick={() => setMode('ia')}
        >
          • Describilo con IA
        </button>
        <button
          type="button"
          className={`report-mode-btn ${mode === 'wizard' ? 'report-mode-btn-active' : ''}`}
          onClick={() => setMode('wizard')}
        >
          Armalo paso a paso
        </button>
      </div>

      <Panel title="Constructor de reporte" eyebrow="Configuración">
        {mode === 'ia' ? (
          <div className="report-query">
            <Field label="Consulta por voz o texto">
              <textarea
                rows={2}
                maxLength={500}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ej. Postulaciones de septiembre ordenadas por fecha"
              />
            </Field>
            <div className="report-query-actions">
              {voiceSupported && (
                <Button
                  variant="secondary"
                  onClick={toggleListening}
                  disabled={interpreting}
                  aria-label={listening ? 'Detener dictado' : 'Dictar consulta'}
                  title={listening ? 'Detener dictado' : 'Dictar consulta'}
                >
                  {listening ? <Square size={16} aria-hidden="true" /> : <Mic size={17} aria-hidden="true" />}
                  {listening ? 'Detener' : 'Dictar'}
                </Button>
              )}
              <Button
                onClick={() => void interpret(prompt)}
                loading={interpreting}
                disabled={listening || prompt.trim().length < 3}
              >
                Generar reporte
              </Button>
            </div>
            <small className="report-privacy">
              El navegador puede procesar el audio en su servicio de voz. Al generar, la transcripción se envía a Google Gemini; no se envían filas del reporte.
            </small>
          </div>
        ) : (
          <nav className="report-wizard-nav" aria-label="Pasos del asistente">
            <button
              type="button"
              className={`report-wizard-step ${wizardStep === 1 ? 'report-wizard-step-active' : ''}`}
              onClick={() => setWizardStep(1)}
            >
              1. Fuente
            </button>
            <button
              type="button"
              className={`report-wizard-step ${wizardStep === 2 ? 'report-wizard-step-active' : ''}`}
              onClick={() => setWizardStep(2)}
            >
              2. Columnas
            </button>
            <button
              type="button"
              className={`report-wizard-step ${wizardStep === 3 ? 'report-wizard-step-active' : ''}`}
              onClick={() => setWizardStep(3)}
            >
              3. Filtros
            </button>
            <button
              type="button"
              className={`report-wizard-step ${wizardStep === 4 ? 'report-wizard-step-active' : ''}`}
              onClick={() => setWizardStep(4)}
            >
              4. Orden
            </button>
          </nav>
        )}

        {interpreted && (
          <p className="report-interpretation">
            <strong>Propuesta interpretada</strong> · {source?.nombre ?? sourceCode} ·{' '}
            {columns.length} columnas · {filters.length} filtros
          </p>
        )}

        {/* Controles del reporte (siempre accesibles y editables) */}
        <div className="form-grid">
          <Field label="Fuente">
            <select value={sourceCode} onChange={(e) => changeSource(e.target.value)}>
              {sources.map((item) => (
                <option key={item.codigo} value={item.codigo}>
                  {item.nombre || item.etiqueta || item.codigo}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre para guardar">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Postulaciones del mes"
            />
          </Field>
        </div>

        <fieldset className="field report-columns">
          <legend>Columnas</legend>
          <div className="check-grid">
            {source?.columnas.map((column) => (
              <label className="check-label" key={column}>
                <input
                  type="checkbox"
                  checked={columns.includes(column)}
                  onChange={() =>
                    setColumns((current) =>
                      current.includes(column)
                        ? current.filter((item) => item !== column)
                        : [...current, column],
                    )
                  }
                />
                {column.replaceAll('_', ' ')}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="report-builder-list">
          <div className="panel-heading">
            <h3>Filtros</h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setFilters((items) => [...items, { ...EMPTY_FILTER }])}
            >
              <Plus size={16} aria-hidden="true" />
              Añadir filtro
            </Button>
          </div>
          {filters.length === 0 && (
            <div className="inline-empty">
              <FilterIcon size={18} aria-hidden="true" />
              <span>Sin filtros. El reporte incluirá todos los registros disponibles.</span>
            </div>
          )}
          {filters.map((filter, index) => (
            <div className="report-filter-row" key={index}>
              <select
                aria-label={`Campo del filtro ${index + 1}`}
                value={filter.campo}
                onChange={(e) =>
                  setFilters((items) =>
                    items.map((item, i) => (i === index ? { ...item, campo: e.target.value } : item)),
                  )
                }
              >
                <option value="">Campo</option>
                {source?.columnas.map((column) => (
                  <option key={column}>{column}</option>
                ))}
              </select>
              <select
                aria-label={`Operador del filtro ${index + 1}`}
                value={filter.operador}
                onChange={(e) =>
                  setFilters((items) =>
                    items.map((item, i) =>
                      i === index
                        ? { ...item, operador: e.target.value as Filter['operador'] }
                        : item,
                    ),
                  )
                }
              >
                <option value="igual">Igual</option>
                <option value="contiene">Contiene</option>
                <option value="mayor_igual">Mayor o igual</option>
                <option value="menor_igual">Menor o igual</option>
              </select>
              <input
                aria-label={`Valor del filtro ${index + 1}`}
                value={String(filter.valor)}
                onChange={(e) =>
                  setFilters((items) =>
                    items.map((item, i) => (i === index ? { ...item, valor: e.target.value } : item)),
                  )
                }
              />
              <button
                className="icon-button icon-button-danger"
                type="button"
                onClick={() => setFilters((items) => items.filter((_, i) => i !== index))}
                title="Quitar filtro"
                aria-label={`Quitar filtro ${index + 1}`}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <div className="form-grid">
          <Field label="Ordenar por">
            <select value={orderField} onChange={(e) => setOrderField(e.target.value)}>
              <option value="">Sin orden</option>
              {source?.columnas.map((column) => (
                <option key={column}>{column}</option>
              ))}
            </select>
          </Field>
          <Field label="Dirección">
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'asc' | 'desc')}
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </Field>
        </div>

        {/* Las tres salidas (§8.2.3) */}
        <div className="report-output-actions">
          <Button onClick={() => void runPreview()} loading={busy}>
            <Eye size={17} aria-hidden="true" />
            Vista previa
          </Button>
          <Button
            variant="secondary"
            disabled={!name.trim() || !columns.length}
            onClick={() => void handleSaveReport()}
          >
            <Save size={17} aria-hidden="true" />
            Guardar definición
          </Button>
          <Button
            variant="secondary"
            disabled={!columns.length}
            onClick={() => void handlePinToPanel()}
          >
            <Pin size={17} aria-hidden="true" />
            Fijar en el panel
          </Button>
        </div>
      </Panel>

      {busy && autoPreview && <p role="status">Actualizando vista previa...</p>}

      {visiblePreview && (
        <Panel title="Vista previa" count={`${visiblePreview.total} registros`}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {visiblePreview.columnas.map((column) => (
                    <th key={column}>{column.replaceAll('_', ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePreview.items.map((row, index) => (
                  <tr key={index}>
                    {visiblePreview.columnas.map((column) => (
                      <td key={column}>{String(row[column] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="form-actions">
            <Button
              variant="secondary"
              disabled={busy || interpreting}
              onClick={() => void download('xlsx')}
            >
              <Download size={16} aria-hidden="true" />
              Excel
            </Button>
            <Button
              variant="secondary"
              disabled={busy || interpreting}
              onClick={() => void download('html')}
            >
              <Download size={16} aria-hidden="true" />
              HTML
            </Button>
            <Button
              variant="secondary"
              disabled={busy || interpreting}
              onClick={() => void download('pdf')}
            >
              <Download size={16} aria-hidden="true" />
              PDF
            </Button>
          </div>
        </Panel>
      )}
    </section>
  )
}
