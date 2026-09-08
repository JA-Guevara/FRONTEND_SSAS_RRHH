import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getVacantes,
  type EstadoVacante,
  type PaginatedVacantes,
  type VacanteListItem,
} from '../api/vacantesApi'
import {
  ConfirmarAccionVacanteModal,
  type AccionVacante,
} from '../components/ConfirmarAccionVacanteModal'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import '../vacantes.css'

export function VacantesListPage() {
  const navigate = useNavigate()
  const { company } = useCompanyScope()

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoVacante | 'TODAS'>('TODAS')
  const [departamentoFilter, setDepartamentoFilter] = useState<string | 'TODOS'>('TODOS')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Datos
  const [data, setData] = useState<PaginatedVacantes>({
    items: [],
    departamentos: [],
    total: 0,
    all_total: 0,
    counts: { BORRADOR: 0, PUBLICADA: 0, PAUSADA: 0, CERRADA: 0, CANCELADA: 0 },
    page: 1,
    per_page: 10,
    total_pages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // Modal de acción (T1-14)
  const [selectedVacante, setSelectedVacante] = useState<VacanteListItem | null>(null)
  const [selectedAccion, setSelectedAccion] = useState<AccionVacante | null>(null)

  const loadVacantes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getVacantes({
        busqueda: busqueda.trim() || undefined,
        estado: estadoFilter,
        departamento_id: departamentoFilter,
        page,
        per_page: perPage,
        empresa_id: company?.id,
      })
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las vacantes')
    } finally {
      setLoading(false)
    }
  }, [busqueda, company?.id, estadoFilter, departamentoFilter, page, perPage])

  useEffect(() => {
    void loadVacantes()
  }, [loadVacantes])

  function handleResetFilters() {
    setBusqueda('')
    setEstadoFilter('TODAS')
    setDepartamentoFilter('TODOS')
    setPage(1)
  }

  function handleOpenAction(vacante: VacanteListItem, accion: AccionVacante) {
    setSelectedVacante(vacante)
    setSelectedAccion(accion)
  }

  function handleActionSuccess(accion: AccionVacante) {
    const mensajes: Record<AccionVacante, string> = {
      publicar: 'Vacante publicada exitosamente. Ahora está visible para recibir postulaciones.',
      pausar: 'Vacante pausada. Ya no está visible en el portal público.',
      reanudar: 'Vacante reanudada exitosamente. Vuelve a estar visible en el portal público.',
      cerrar: 'Vacante cerrada correctamente.',
      eliminar: 'Vacante eliminada exitosamente.',
    }
    setMensajeExito(mensajes[accion])
    setTimeout(() => setMensajeExito(null), 5000)
    void loadVacantes()
  }

  const estadoBadgeConfig: Record<EstadoVacante, { label: string; className: string }> = {
    BORRADOR: { label: 'Borrador', className: 'vac-badge-draft' },
    PUBLICADA: { label: 'Publicada', className: 'vac-badge-active' },
    PAUSADA: { label: 'Pausada', className: 'vac-badge-paused' },
    CERRADA: { label: 'Cerrada', className: 'vac-badge-closed' },
    CANCELADA: { label: 'Cancelada', className: 'vac-badge-closed' },
  }

  const formatSalario = (v: VacanteListItem) => {
    if (!v.mostrar_salario || (v.salario_min == null && v.salario_max == null)) {
      return <span className="vac-salario-hidden">No publicado</span>
    }
    if (v.salario_min != null && v.salario_max != null) {
      return `Bs. ${v.salario_min.toLocaleString()} - ${v.salario_max.toLocaleString()}`
    }
    if (v.salario_min != null) return `Desde Bs. ${v.salario_min.toLocaleString()}`
    return `Hasta Bs. ${v.salario_max?.toLocaleString()}`
  }

  return (
    <div className="vac-page">
      {/* Cabecera */}
      <div className="vac-header-row">
        <div>
          <div className="vac-eyebrow">Reclutamiento & Selección · Sprint 1</div>
          <h1>Gestión de Vacantes</h1>
          <p className="vac-sub">
            Publicación, filtros por departamento y estado, y seguimiento de postulaciones.
          </p>
        </div>
        <Link to="/vacantes/nueva" className="vac-btn vac-btn-primary">
          + Nueva vacante
        </Link>
      </div>

      {mensajeExito && (
        <div className="vac-notice" role="status">
          <span>✓ {mensajeExito}</span>
          <button type="button" onClick={() => setMensajeExito(null)} aria-label="Cerrar notificación">✕</button>
        </div>
      )}
      {error && <div className="vac-bad" role="alert">{error}</div>}

      {/* Tarjetas de métricas */}
      <div className="vac-metrics-grid">
        <div
          className={`vac-metric-card ${estadoFilter === 'TODAS' ? 'selected' : ''}`}
          onClick={() => { setEstadoFilter('TODAS'); setPage(1) }}
        >
          <span className="vac-metric-label">Total vacantes</span>
          <span className="vac-metric-num">{data.all_total}</span>
        </div>
        <div
          className={`vac-metric-card ${estadoFilter === 'PUBLICADA' ? 'selected' : ''}`}
          onClick={() => { setEstadoFilter('PUBLICADA'); setPage(1) }}
        >
          <span className="vac-metric-label">Publicadas</span>
          <span className="vac-metric-num text-success">
            {data.counts.PUBLICADA}
          </span>
        </div>
        <div
          className={`vac-metric-card ${estadoFilter === 'BORRADOR' ? 'selected' : ''}`}
          onClick={() => { setEstadoFilter('BORRADOR'); setPage(1) }}
        >
          <span className="vac-metric-label">Borradores</span>
          <span className="vac-metric-num text-draft">
            {data.counts.BORRADOR}
          </span>
        </div>
        <div
          className={`vac-metric-card ${estadoFilter === 'PAUSADA' ? 'selected' : ''}`}
          onClick={() => { setEstadoFilter('PAUSADA'); setPage(1) }}
        >
          <span className="vac-metric-label">Pausadas</span>
          <span className="vac-metric-num text-warning">
            {data.counts.PAUSADA}
          </span>
        </div>
        <div
          className={`vac-metric-card ${estadoFilter === 'CERRADA' ? 'selected' : ''}`}
          onClick={() => { setEstadoFilter('CERRADA'); setPage(1) }}
        >
          <span className="vac-metric-label">Cerradas</span>
          <span className="vac-metric-num text-closed">
            {data.counts.CERRADA}
          </span>
        </div>
      </div>

      {/* Barra de Filtros (T1-12) */}
      <div className="vac-filters-panel">
        <div className="vac-filters-grid">
          <div className="vac-filter-item search">
            <label className="vac-filter-label" htmlFor="search-input">Buscar vacante</label>
            <div className="vac-search-input-wrap">
              <span className="vac-search-icon">🔍</span>
              <input
                id="search-input"
                className="vac-input"
                type="text"
                placeholder="Título, cargo, ubicación o descripción..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value)
                  setPage(1)
                }}
              />
              {busqueda && (
                <button
                  type="button"
                  className="vac-clear-search"
                  onClick={() => { setBusqueda(''); setPage(1) }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="vac-filter-item">
            <label className="vac-filter-label" htmlFor="dept-select">Departamento</label>
            <select
              id="dept-select"
              className="vac-select"
              value={departamentoFilter}
              onChange={(e) => {
                const val = e.target.value
                setDepartamentoFilter(val)
                setPage(1)
              }}
            >
              <option value="TODOS">Todos los departamentos</option>
              {data.departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="vac-filter-item">
            <label className="vac-filter-label" htmlFor="status-select">Estado</label>
            <select
              id="status-select"
              className="vac-select"
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value as EstadoVacante | 'TODAS')
                setPage(1)
              }}
            >
              <option value="TODAS">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PUBLICADA">Publicada</option>
              <option value="PAUSADA">Pausada</option>
              <option value="CERRADA">Cerrada</option>
            </select>
          </div>

          <div className="vac-filter-item actions">
            <button
              type="button"
              className="vac-btn-ghost vac-btn-clear"
              onClick={handleResetFilters}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="vac-table-card">
        {loading ? (
          <div className="vac-loading-state">
            <div className="vac-spinner" />
            <p>Cargando vacantes...</p>
          </div>
        ) : data.items.length === 0 ? (
          <div className="vac-empty-state">
            <div className="vac-empty-icon">📂</div>
            <h3>No se encontraron vacantes</h3>
            <p>
              {busqueda || estadoFilter !== 'TODAS' || departamentoFilter !== 'TODOS'
                ? 'No hay resultados que coincidan con los filtros aplicados.'
                : 'Aún no has registrado ninguna vacante en el sistema.'}
            </p>
            {busqueda || estadoFilter !== 'TODAS' || departamentoFilter !== 'TODOS' ? (
              <button type="button" className="vac-btn vac-btn-secondary" onClick={handleResetFilters}>
                Restablecer filtros
              </button>
            ) : (
              <Link to="/vacantes/nueva" className="vac-btn vac-btn-primary">
                Crear primera vacante
              </Link>
            )}
          </div>
        ) : (
          <div className="vac-table-wrap">
            <table className="vac-table">
              <thead>
                <tr>
                  <th>Vacante / Cargo</th>
                  <th>Departamento</th>
                  <th>Modalidad / Ciudad</th>
                  <th>Rango Salarial</th>
                  <th>Cierre & Vacantes</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((vacante) => {
                  const badge = estadoBadgeConfig[vacante.estado as EstadoVacante]
                  return (
                    <tr key={vacante.id}>
                      <td>
                        <div className="vac-item-title">
                          <strong>{vacante.titulo}</strong>
                          <small>{vacante.cargo_nombre}</small>
                        </div>
                      </td>
                      <td>
                        <span className="vac-dept-badge">{vacante.departamento_nombre}</span>
                      </td>
                      <td>
                        <div className="vac-mod-wrap">
                          <span className="vac-mod-tag">{vacante.modalidad}</span>
                          <small>{vacante.ubicacion || 'Sin especificar'}</small>
                        </div>
                      </td>
                      <td>
                        <span className="vac-salario-text">{formatSalario(vacante)}</span>
                      </td>
                      <td>
                        <div className="vac-cierre-wrap">
                          <span>{vacante.fecha_cierre ? vacante.fecha_cierre.slice(0, 10) : '—'}</span>
                          <small>{vacante.cantidad_vacantes} {vacante.cantidad_vacantes === 1 ? 'puesto' : 'puestos'}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`vac-badge ${badge.className}`}>
                          <span className="vac-badge-dot" />
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <div className="vac-row-actions">
                          {/* Botón Ver Tablero Kanban */}
                          <Link
                            to={`/vacantes/${vacante.id}/tablero`}
                            className="vac-action-btn view"
                            title="Ver tablero de postulaciones"
                          >
                            📋 Tablero
                            <span className="vac-postulantes-pill">
                              {vacante.postulantes_count ?? 'N/D'}
                            </span>
                          </Link>

                          {/* Acciones de ciclo de vida */}
                          {(vacante.estado === 'BORRADOR' || vacante.estado === 'PAUSADA') && (
                            <Link
                              to={`/vacantes/${vacante.id}/editar`}
                              className="vac-action-btn edit"
                              title="Editar vacante"
                            >
                              ✏️ Editar
                            </Link>
                          )}

                          {vacante.estado === 'BORRADOR' && (
                            <>
                              <button
                                type="button"
                                className="vac-action-btn publish"
                                title="Publicar vacante"
                                onClick={() => handleOpenAction(vacante, 'publicar')}
                              >
                                📢 Publicar
                              </button>
                              <button
                                type="button"
                                className="vac-action-btn close-vac"
                                title="Eliminar vacante"
                                onClick={() => handleOpenAction(vacante, 'eliminar')}
                              >
                                🗑️ Eliminar
                              </button>
                            </>
                          )}

                          {vacante.estado === 'PUBLICADA' && (
                            <>
                              <button
                                type="button"
                                className="vac-action-btn pause"
                                title="Pausar vacante"
                                onClick={() => handleOpenAction(vacante, 'pausar')}
                              >
                                ⏸️ Pausar
                              </button>
                              <button
                                type="button"
                                className="vac-action-btn close-vac"
                                title="Cerrar vacante"
                                onClick={() => handleOpenAction(vacante, 'cerrar')}
                              >
                                🔒 Cerrar
                              </button>
                            </>
                          )}

                          {vacante.estado === 'PAUSADA' && (
                            <>
                              <button
                                type="button"
                                className="vac-action-btn publish"
                                title="Reanudar vacante"
                                onClick={() => handleOpenAction(vacante, 'reanudar')}
                              >
                                ▶️ Reanudar
                              </button>
                              <button
                                type="button"
                                className="vac-action-btn close-vac"
                                title="Cerrar vacante"
                                onClick={() => handleOpenAction(vacante, 'cerrar')}
                              >
                                🔒 Cerrar
                              </button>
                            </>
                          )}

                          {vacante.estado === 'CANCELADA' && (
                            <button
                              type="button"
                              className="vac-action-btn close-vac"
                              title="Eliminar vacante"
                              onClick={() => handleOpenAction(vacante, 'eliminar')}
                            >
                              🗑️ Eliminar
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación (T1-12) */}
        {!loading && data.total > 0 && (
          <div className="vac-pagination-bar">
            <div className="vac-pagination-info">
              Mostrando{' '}
              <strong>
                {(data.page - 1) * data.per_page + 1} - {Math.min(data.page * data.per_page, data.total)}
              </strong>{' '}
              de <strong>{data.total}</strong> vacantes
            </div>

            <div className="vac-pagination-controls">
              <label className="vac-perpage-label">
                Por página:
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value))
                    setPage(1)
                  }}
                  className="vac-perpage-select"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>

              <div className="vac-page-buttons">
                <button
                  type="button"
                  className="vac-page-btn"
                  disabled={data.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                >
                  ‹ Anterior
                </button>

                {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`vac-page-btn ${num === data.page ? 'active' : ''}`}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  className="vac-page-btn"
                  disabled={data.page >= data.total_pages}
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  aria-label="Página siguiente"
                >
                  Siguiente ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diálogo de Confirmación para Acciones (T1-14) */}
      <ConfirmarAccionVacanteModal
        vacante={selectedVacante}
        accion={selectedAccion}
        onClose={() => {
          setSelectedVacante(null)
          setSelectedAccion(null)
        }}
        onSuccess={() => {
          if (selectedAccion) handleActionSuccess(selectedAccion)
        }}
        onEditar={(id) => navigate(`/vacantes/${id}/editar`)}
        empresaId={company?.id}
      />
    </div>
  )
}
