import { useEffect, useState, type FormEvent } from 'react'
import type { components } from '../../../shared/api/schema'
import { rolesApi } from '../api/rolesApi'

type Role = components['schemas']['RoleSchema']

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  async function load() {
    setStatus('loading')
    try { setRoles(await rolesApi.list()); setStatus('success') } catch { setStatus('error') }
  }
  useEffect(() => { void load() }, [])

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await rolesApi.create({ name: String(form.get('name')), codigo: String(form.get('codigo')).toUpperCase(), description: String(form.get('description') || '') || null })
      event.currentTarget.reset()
      setMessage('Rol creado correctamente.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo crear el rol') }
  }

  async function remove(role: Role) {
    if (!window.confirm(`¿Eliminar el rol ${role.name}?`)) return
    try { await rolesApi.remove(role.id); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo eliminar') }
  }

  return (
    <section className="page-stack"><div><p className="eyebrow">Seguridad</p><h1>Roles y permisos</h1><p className="page-description">Configuración consumida directamente desde `/api/v1/roles`.</p></div>{message && <p className="notice">{message}</p>}
      <form className="panel form-grid" onSubmit={create}><label>Nombre<input name="name" required /></label><label>Código<input name="codigo" pattern="[A-Za-z0-9_]+" required /></label><label>Descripción<input name="description" /></label><button className="button button-primary" type="submit">Crear rol</button></form>
      <section className="panel">{status === 'loading' && <p>Cargando roles…</p>}{status === 'error' && <p className="form-error">No se pudieron cargar los roles.</p>}{status === 'success' && <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Código</th><th>Permisos</th><th>Estado</th><th /></tr></thead><tbody>{roles.map((role) => <tr key={role.id}><td>{role.name}</td><td>{role.codigo}</td><td>{role.permissions?.length ?? 0}</td><td>{role.is_active ? 'Activo' : 'Inactivo'}</td><td><button className="detail-button" onClick={() => void remove(role)} type="button">Eliminar</button></td></tr>)}</tbody></table></div>}</section>
    </section>
  )
}
