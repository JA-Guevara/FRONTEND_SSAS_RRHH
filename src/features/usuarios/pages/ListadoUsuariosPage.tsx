import { useEffect, useState, type FormEvent } from 'react'
import type { components } from '../../../shared/api/schema'
import { rolesApi } from '../../roles/api/rolesApi'
import { usuariosApi } from '../api/usuariosApi'

type User = components['schemas']['UsuarioResponse']
type Role = components['schemas']['RoleSchema']

export function ListadoUsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  async function load() {
    setStatus('loading')
    try {
      const [userPage, availableRoles] = await Promise.all([
        usuariosApi.list({ search: search || undefined, is_active: activeFilter === '' ? undefined : activeFilter === 'true', page: 1, per_page: 100 }),
        rolesApi.list(),
      ])
      setUsers(userPage.items)
      setRoles(availableRoles)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => { void load() }, [])

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await usuariosApi.create({
        nombre: String(form.get('nombre')),
        apellido: String(form.get('apellido')),
        email: String(form.get('email')),
        username: String(form.get('username')),
        password: String(form.get('password')),
        telefono: String(form.get('telefono') || '') || null,
        role_ids: form.getAll('role_ids').map(String),
      })
      setShowForm(false)
      setMessage('Usuario creado correctamente.')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear el usuario')
    }
  }

  async function toggle(user: User) {
    try {
      if (user.is_active) await usuariosApi.deactivate(user.id)
      else await usuariosApi.activate(user.id)
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cambiar el estado')
    }
  }

  return (
    <section className="page-stack">
      <div className="page-header"><div><p className="eyebrow">Administración</p><h1>Usuarios</h1><p className="page-description">Usuarios reales de la empresa autenticada.</p></div><button className="button button-primary" onClick={() => setShowForm(true)} type="button">Nuevo usuario</button></div>
      {message && <p className="notice" role="status">{message}</p>}
      <section className="panel">
        <div className="filters"><label>Buscar<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre, usuario o correo" /></label><label>Estado<select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></label><button className="button button-primary" onClick={() => void load()} type="button">Consultar</button></div>
        {status === 'loading' && <p>Cargando usuarios…</p>}
        {status === 'error' && <p className="form-error">No se pudieron cargar los usuarios.</p>}
        {status === 'success' && <div className="table-wrap"><table><thead><tr><th>Usuario</th><th>Correo</th><th>Roles</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.nombre} {user.apellido}</strong><small>@{user.username}</small></td><td>{user.email}</td><td>{user.roles?.join(', ') || 'Sin rol'}</td><td>{user.is_active ? 'Activo' : 'Inactivo'}</td><td><button className="detail-button" onClick={() => void toggle(user)} type="button">{user.is_active ? 'Desactivar' : 'Activar'}</button></td></tr>)}</tbody></table>{users.length === 0 && <div className="empty-table">No hay usuarios.</div>}</div>}
      </section>
      {showForm && <div className="modal-backdrop"><form className="user-form" onSubmit={create}><div className="panel-heading"><h2>Nuevo usuario</h2><button className="icon-button" onClick={() => setShowForm(false)} type="button" aria-label="Cerrar">×</button></div><label>Nombres<input name="nombre" minLength={2} required /></label><label>Apellidos<input name="apellido" required /></label><label>Correo<input name="email" type="email" required /></label><label>Usuario<input name="username" minLength={3} required /></label><label>Teléfono<input name="telefono" /></label><label>Contraseña temporal<input name="password" type="password" minLength={12} maxLength={72} required /></label><fieldset className="form-section"><legend>Roles</legend>{roles.map((role) => <label className="check-label" key={role.id}><input name="role_ids" type="checkbox" value={role.id} />{role.name}</label>)}</fieldset><div className="form-actions"><button className="button button-quiet-dark" onClick={() => setShowForm(false)} type="button">Cancelar</button><button className="button button-primary" type="submit">Crear</button></div></form></div>}
    </section>
  )
}
