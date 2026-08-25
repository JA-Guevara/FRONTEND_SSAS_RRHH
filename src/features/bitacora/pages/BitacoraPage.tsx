import { useEffect, useMemo, useState } from 'react'
import { bitacoraApi } from '../api/bitacoraApi.js'
import { useAuth } from '../../auth/hooks/useAuth.js'

const sampleEntries = [
  { id: 'log-03', user_name: 'María González', user_email: 'maria.gonzalez@ssah.gov', ip_address: '192.168.1.42', user_agent: 'Chrome / Windows', entity: 'Usuario', action: 'Creación', created_at: '2026-08-23T16:05:00', previous_value: null, new_value: { name: 'Laura Méndez', email: 'laura.mendez@ssah.gov' } },
]

const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' })

function normalizeEntries(data) {
  if (Array.isArray(data)) return data
  return data?.items ?? data?.results ?? data?.data ?? []
}

function formatValue(value) {
  return value == null ? 'Sin valor' : JSON.stringify(value, null, 2)
}

export function BitacoraPage() {
<<<<<<< HEAD:src/features/bitacora/pages/BitacoraPage.jsx
  const { accessToken } = useAuth()
  const [entries, setEntries] = useState(sampleEntries)
  const [filters, setFilters] = useState({ user: '', entity: '', action: '', from: '', to: '' })
  const [expandedId, setExpandedId] = useState(null)
  const [serviceStatus, setServiceStatus] = useState('checking')
=======
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
>>>>>>> 52f4ca0be4c097fab5c33b16e11918bb28f3b650:src/features/bitacora/pages/BitacoraPage.tsx

  useEffect(() => {
    let active = true
    bitacoraApi.list(filters, accessToken)
      .then((data) => { if (active) { setEntries(normalizeEntries(data)); setServiceStatus('available') } })
      .catch(() => active && setServiceStatus('unavailable'))
    return () => { active = false }
  }, [accessToken, filters])

  const visibleEntries = useMemo(() => entries.filter((entry) => {
    const text = `${entry.user_name ?? entry.user?.name ?? ''} ${entry.user_email ?? entry.user?.email ?? ''}`.toLowerCase()
    const createdAt = new Date(entry.created_at ?? entry.timestamp).getTime()
    const from = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : -Infinity
    const to = filters.to ? new Date(`${filters.to}T23:59:59`).getTime() : Infinity
    return text.includes(filters.user.toLowerCase()) && (!filters.entity || entry.entity === filters.entity) && (!filters.action || entry.action === filters.action) && createdAt >= from && createdAt <= to
  }), [entries, filters])

  function updateFilter(field, value) { setFilters((current) => ({ ...current, [field]: value })) }
  function clearFilters() { setFilters({ user: '', entity: '', action: '', from: '', to: '' }) }
  function getUser(entry) { return entry.user_name ?? entry.user?.name ?? 'Usuario del sistema' }
  function getEmail(entry) { return entry.user_email ?? entry.user?.email ?? 'Sin correo' }
  function getIp(entry) { return entry.ip_address ?? entry.ip ?? 'No disponible' }

  return (
    <section className="page-stack audit-page" aria-labelledby="bitacora-title">
      <div className="page-header"><div>
        <p className="eyebrow">Seguridad y administración</p>
        <h1 id="bitacora-title">Bitácora</h1>
        <p className="page-description">Consulta cada cambio relevante y conserva el contexto completo de seguridad.</p>
      </div><span className={`service-status ${serviceStatus}`}><span className="status-dot" />{serviceStatus === 'available' ? 'Servicio conectado' : serviceStatus === 'checking' ? 'Consultando servicio' : 'Vista de referencia'}</span></div>
      <section className="panel" aria-labelledby="audit-list-title"><div className="panel-heading"><div><p className="eyebrow">Registro de actividad</p><h2 id="audit-list-title">Eventos de auditoría</h2></div><span className="panel-count">{visibleEntries.length} eventos</span></div>
        <div className="audit-filters"><label>Usuario o email<input value={filters.user} onChange={(event) => updateFilter('user', event.target.value)} placeholder="Buscar actor" /></label><label>Entidad<select value={filters.entity} onChange={(event) => updateFilter('entity', event.target.value)}><option value="">Todas</option><option>Usuario</option><option>Rol</option><option>Permiso</option><option>Sesión</option></select></label><label>Acción<select value={filters.action} onChange={(event) => updateFilter('action', event.target.value)}><option value="">Todas</option><option>Creación</option><option>Actualización</option><option>Asignación</option><option>Eliminación</option><option>Inicio de sesión</option></select></label><label>Desde<input type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} /></label><label>Hasta<input type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} /></label><button className="button button-quiet-dark filter-clear" type="button" onClick={clearFilters}>Limpiar filtros</button></div>
        <div className="table-wrap"><table className="audit-table"><thead><tr><th>Fecha</th><th>Usuario</th><th>Entidad</th><th>Acción</th><th>Dispositivo</th><th>IP</th><th /></tr></thead><tbody>{visibleEntries.map((entry) => <tr key={entry.id}><td className="muted-cell">{dateFormatter.format(new Date(entry.created_at ?? entry.timestamp))}</td><td><strong>{getUser(entry)}</strong><small>{getEmail(entry)}</small></td><td><span className="role-badge">{entry.entity ?? 'Sin entidad'}</span></td><td><span className="action-label">{entry.action ?? 'Evento'}</span></td><td className="muted-cell">{entry.user_agent ?? entry.device ?? 'No disponible'}</td><td className="muted-cell">{getIp(entry)}</td><td><button className="detail-button" type="button" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>{expandedId === entry.id ? 'Ocultar' : 'Detalle'}</button></td>{expandedId === entry.id && <td className="audit-detail" colSpan="7"><div><strong>Valor anterior</strong><pre>{formatValue(entry.previous_value ?? entry.old_value)}</pre></div><div><strong>Valor nuevo</strong><pre>{formatValue(entry.new_value ?? entry.new_values)}</pre></div><small>ID del evento: {entry.id} · Correlación: {entry.correlation_id ?? 'No disponible'}</small></td>}</tr>)}</tbody></table>{visibleEntries.length === 0 && <div className="empty-table">No hay eventos que coincidan con los filtros seleccionados.</div>}</div>
      </section>
    </section>
  )
}
