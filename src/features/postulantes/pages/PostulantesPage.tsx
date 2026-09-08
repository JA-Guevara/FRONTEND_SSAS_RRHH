import { useEffect, useState, type FormEvent } from 'react'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { Button, Panel } from '../../../shared/components'
import { crearPostulante, listarPostulantes, type Postulante } from '../api/postulantesApi'

export function PostulantesPage() {
  const { company } = useCompanyScope()
  const [items, setItems] = useState<Postulante[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try { setItems(await listarPostulantes(company?.id)); setError('') } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los postulantes.') }
  }
  useEffect(() => { void load() }, [company?.id])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await crearPostulante({ nombres: String(form.get('nombres')), apellidos: String(form.get('apellidos')), ci: String(form.get('ci')), email: String(form.get('email')), telefono: String(form.get('telefono')), ciudad: String(form.get('ciudad')), nivel_educativo: String(form.get('nivel_educativo')) as 'SECUNDARIA', anios_experiencia: Number(form.get('anios_experiencia') ?? 0), linkedin: String(form.get('linkedin') || '') || null, cv_url: null, fuente: 'OTRO' })
      setShowForm(false); setMessage('Postulante registrado correctamente.'); await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo registrar el postulante.') }
  }

  return <section className="page-stack"><div className="page-header"><div><p className="eyebrow">Reclutamiento</p><h1>Banco de talento</h1><p className="page-description">Postulantes registrados en la empresa activa.</p></div><Button onClick={() => setShowForm((value) => !value)}>{showForm ? 'Cerrar' : 'Alta manual'}</Button></div>{message && <p className="notice">{message}</p>}{error && <p className="form-error">{error}</p>}{showForm && <form className="panel form-grid" onSubmit={submit}><label>Nombres<input name="nombres" required /></label><label>Apellidos<input name="apellidos" required /></label><label>CI<input name="ci" required /></label><label>Email<input name="email" type="email" required /></label><label>Teléfono<input name="telefono" required /></label><label>Ciudad<input name="ciudad" required /></label><label>Nivel<select name="nivel_educativo"><option>SECUNDARIA</option><option>TECNICO</option><option>LICENCIATURA</option><option>MAESTRIA</option><option>DOCTORADO</option></select></label><label>Experiencia<input name="anios_experiencia" type="number" min="0" defaultValue="0" /></label><label>LinkedIn<input name="linkedin" /></label><Button type="submit">Registrar postulante</Button></form>}<Panel title="Postulantes" count={`${items.length} registros`}><div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Contacto</th><th>Ciudad</th><th>Experiencia</th><th>Fuente</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.nombres} {item.apellidos}</strong><small>{item.ci}</small></td><td>{item.email}<small>{item.telefono}</small></td><td>{item.ciudad}</td><td>{item.anios_experiencia} años</td><td>{item.fuente}</td></tr>)}</tbody></table>{items.length === 0 && <div className="empty-table">No hay postulantes registrados.</div>}</div></Panel></section>
}
