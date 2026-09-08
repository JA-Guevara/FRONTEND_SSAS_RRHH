import { useEffect, useState, type FormEvent } from 'react'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { Button, Panel } from '../../../shared/components'
import { actualizarHabilidad, crearHabilidad, listarHabilidades, type Habilidad } from '../api/habilidadesApi'

export function HabilidadesPage() {
  const { company } = useCompanyScope()
  const [items, setItems] = useState<Habilidad[]>([])
  const [editing, setEditing] = useState<Habilidad | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    try { setItems(await listarHabilidades(company?.id)); setError('') } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las habilidades.') }
  }
  useEffect(() => { void load() }, [company?.id])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const data = { nombre: String(form.get('nombre')), categoria: String(form.get('categoria') || '') || null, descripcion: String(form.get('descripcion') || '') || null, activo: true }
    try { if (editing) await actualizarHabilidad(editing.id, data); else await crearHabilidad(data); setEditing(null); setMessage('Habilidad guardada correctamente.'); await load() } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar la habilidad.') }
  }

  return <section className="page-stack"><div className="page-header"><div><p className="eyebrow">Reclutamiento</p><h1>Habilidades</h1><p className="page-description">Catálogo de habilidades de la empresa activa.</p></div><Button onClick={() => setEditing(null)}>Nueva habilidad</Button></div>{message && <p className="notice">{message}</p>}{error && <p className="form-error">{error}</p>}<form className="panel form-grid" onSubmit={submit}><label>Nombre<input name="nombre" key={editing?.id ?? 'new'} defaultValue={editing?.nombre ?? ''} required /></label><label>Categoría<input name="categoria" defaultValue={editing?.categoria ?? ''} /></label><label>Descripción<input name="descripcion" defaultValue={editing?.descripcion ?? ''} /></label><Button type="submit">{editing ? 'Guardar cambios' : 'Crear habilidad'}</Button></form><Panel title="Catálogo" count={`${items.length} habilidades`}><div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Categoría</th><th>Descripción</th><th>Estado</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.nombre}</td><td>{item.categoria ?? '—'}</td><td>{item.descripcion ?? '—'}</td><td>{item.activo ? 'Activa' : 'Inactiva'}</td><td><button className="detail-button" type="button" onClick={() => setEditing(item)}>Editar</button></td></tr>)}</tbody></table>{items.length === 0 && <div className="empty-table">No hay habilidades.</div>}</div></Panel></section>
}
