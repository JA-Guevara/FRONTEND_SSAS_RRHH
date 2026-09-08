import { useEffect, useState, type FormEvent } from 'react'
import type { components } from '../../../shared/api/schema'
import { rolesApi } from '../api/rolesApi'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext.tsx'

type Role = components['schemas']['RoleSchema']
type Permission = components['schemas']['PermissionSchema']

export function RolesPage() {
  const { company } = useCompanyScope()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  async function load() {
    setStatus('loading')
    try {
      const [availableRoles, availablePermissions] = await Promise.all([rolesApi.list(company?.id), rolesApi.permisos()])
      setRoles(availableRoles)
      setPermissions(availablePermissions)
      setStatus('success')
    } catch { setStatus('error') }
  }

  function editPermissions(role: Role) {
    setSelectedRole(role)
    setSelectedPermissions(new Set((role.permissions ?? []).map((permission) => permission.id)))
    setMessage('')
  }

  async function savePermissions() {
    if (selectedRole === null) return
    try {
      const updated = await rolesApi.assignPermissions(selectedRole.id, [...selectedPermissions], company?.id)
      setRoles((current) => current.map((role) => role.id === updated.id ? updated : role))
      setSelectedRole(updated)
      setMessage('Permisos actualizados correctamente.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudieron actualizar los permisos') }
  }
  useEffect(() => { setSelectedRole(null); setSelectedPermissions(new Set()); void load() }, [company?.id])

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    try {
      await rolesApi.create({ name: String(form.get('name')), codigo: String(form.get('codigo')).toUpperCase(), description: String(form.get('description') || '') || null }, company?.id)
      formElement.reset()
      setMessage('Rol creado correctamente.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo crear el rol') }
  }

  async function remove(role: Role) {
    if (!window.confirm(`¿Eliminar el rol ${role.name}?`)) return
    try { await rolesApi.remove(role.id, company?.id); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo eliminar') }
  }

  return (
    <section className="page-stack"><div><p className="eyebrow">Seguridad</p><h1>Roles y permisos</h1><p className="page-description">Configuración consumida directamente desde `/api/v1/roles`.</p></div>{message && <p className="notice">{message}</p>}
      <form className="panel form-grid" onSubmit={create}><label>Nombre<input name="name" required /></label><label>Código<input name="codigo" pattern="[A-Za-z0-9_]+" required /></label><label>Descripción<input name="description" /></label><button className="button button-primary" type="submit">Crear rol</button></form>
      <section className="panel">{status === 'loading' && <p>Cargando roles…</p>}{status === 'error' && <p className="form-error">No se pudieron cargar los roles.</p>}{status === 'success' && <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Código</th><th>Permisos</th><th>Estado</th><th /></tr></thead><tbody>{roles.map((role) => <tr key={role.id}><td>{role.name}</td><td>{role.codigo}</td><td>{role.permissions?.length ?? 0}</td><td>{role.is_active ? 'Activo' : 'Inactivo'}</td><td><button className="detail-button" onClick={() => editPermissions(role)} type="button">Permisos</button><button className="detail-button" onClick={() => void remove(role)} type="button">Eliminar</button></td></tr>)}</tbody></table></div>}</section>
      {selectedRole !== null && <section className="panel"><div className="panel-heading"><div><h2>Permisos de {selectedRole.name}</h2><p className="page-description">Sólo se muestran permisos válidos para el alcance actual.</p></div><button className="button button-primary" type="button" onClick={() => void savePermissions()}>Guardar permisos</button></div><div className="permission-list">{permissions.map((permission) => <label className="permission-row" key={permission.id}><span><strong>{permission.name}</strong><small>{permission.description ?? `${permission.resource} · ${permission.action}`}</small></span><input type="checkbox" checked={selectedPermissions.has(permission.id)} onChange={() => setSelectedPermissions((current) => { const next = new Set(current); if (next.has(permission.id)) next.delete(permission.id); else next.add(permission.id); return next })} /></label>)}</div></section>}
    </section>
  )
}
