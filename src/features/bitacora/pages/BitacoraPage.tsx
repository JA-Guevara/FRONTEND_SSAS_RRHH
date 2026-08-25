import { useEffect, useState } from 'react'
import type { components } from '../../../shared/api/schema'
import { bitacoraApi, type AuditFilters } from '../api/bitacoraApi'

type AuditLog = components['schemas']['AuditLogSchema']
const formatter = new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' })

export function BitacoraPage() {
  const [entries, setEntries] = useState<AuditLog[]>([])
  const [filters, setFilters] = useState<AuditFilters>({ page: 1, per_page: 50 })
  const [draft, setDraft] = useState({ module: '', action: '', start_date: '', end_date: '' })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let active = true
    setStatus('loading')
    bitacoraApi.list(filters).then((data) => {
      if (active) {
        setEntries(data.items ?? [])
        setTotal(data.total)
        setStatus('success')
      }
    }).catch(() => active && setStatus('error'))
    return () => { active = false }
  }, [filters])

  function search() {
    setFilters({
      module: draft.module || undefined,
      action: draft.action || undefined,
      start_date: draft.start_date ? new Date(`${draft.start_date}T00:00:00`).toISOString() : undefined,
      end_date: draft.end_date ? new Date(`${draft.end_date}T23:59:59`).toISOString() : undefined,
      page: 1,
      per_page: 50,
    })
  }

  return (
    <section className="page-stack" aria-labelledby="bitacora-title">
      <div><p className="eyebrow">Seguridad y administración</p><h1 id="bitacora-title">Bitácora</h1><p className="page-description">Eventos obtenidos directamente desde la API de auditoría.</p></div>
      <section className="panel">
        <div className="panel-heading"><h2>Eventos</h2><span className="panel-count">{total} registros</span></div>
        <div className="audit-filters">
          <label>Módulo<input value={draft.module} onChange={(e) => setDraft({ ...draft, module: e.target.value })} /></label>
          <label>Acción<input value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} /></label>
          <label>Desde<input type="date" value={draft.start_date} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} /></label>
          <label>Hasta<input type="date" value={draft.end_date} onChange={(e) => setDraft({ ...draft, end_date: e.target.value })} /></label>
          <button className="button button-primary" onClick={search} type="button">Filtrar</button>
        </div>
        {status === 'loading' && <p>Cargando eventos…</p>}
        {status === 'error' && <p className="form-error">No se pudo consultar la bitácora.</p>}
        {status === 'success' && (
          <div className="table-wrap"><table className="audit-table"><thead><tr><th>Fecha</th><th>Actor</th><th>Módulo</th><th>Acción</th><th>Nivel</th><th /></tr></thead><tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{formatter.format(new Date(entry.created_at))}</td><td>{entry.actor_label ?? entry.user_id ?? 'Sistema'}</td><td>{entry.module}</td><td>{entry.action}</td><td>{entry.level}</td>
                <td><button className="detail-button" onClick={() => setExpanded(expanded === entry.id ? null : entry.id)} type="button">{expanded === entry.id ? 'Ocultar' : 'Detalle'}</button></td>
                {expanded === entry.id && <td className="audit-detail" colSpan={6}><div><strong>Descripción</strong><p>{entry.description}</p></div><div><strong>Datos</strong><pre>{JSON.stringify({ anteriores: entry.previous_data, nuevos: entry.new_data }, null, 2)}</pre></div><small>IP: {entry.source_ip ?? 'No disponible'} · Registro: {entry.record_id ?? 'N/A'}</small></td>}
              </tr>
            ))}
          </tbody></table>{entries.length === 0 && <div className="empty-table">No existen eventos para los filtros seleccionados.</div>}</div>
        )}
      </section>
    </section>
  )
}
