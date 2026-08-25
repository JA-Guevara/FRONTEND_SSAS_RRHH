import { useMemo, useState } from 'react'
import { usuariosApi } from '../api/usuariosApi.js'
import { PermissionMatrix } from '../components/PermissionMatrix.jsx'
import { UserForm } from '../components/UserForm.jsx'

const initialUsers = [
  { id: 'usr-01', name: 'María González', email: 'maria.gonzalez@ssah.gov', role: 'Administrador', active: true },
]
const initialMatrix = { Administrador: ['Ver usuarios', 'Crear usuarios', 'Editar usuarios', 'Administrar roles', 'Consultar bitácora'], RRHH: ['Ver usuarios', 'Crear usuarios', 'Editar usuarios'], Consulta: ['Ver usuarios', 'Consultar bitácora'] }

export function UsuariosPage() {
  const [users, setUsers] = useState(initialUsers)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [role, setRole] = useState('all')
  const [formUser, setFormUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedRole, setSelectedRole] = useState('Administrador')
  const [matrix, setMatrix] = useState(initialMatrix)
  const [notice, setNotice] = useState('')

  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesQuery = `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (status === 'all' || (status === 'active' ? user.active : !user.active)) && (role === 'all' || user.role === role)
  }), [query, role, status, users])

  async function saveUser(data) {
    try {
      const saved = formUser ? data : await usuariosApi.register({ name: data.name, email: data.email, password: data.password })
      setUsers((current) => formUser ? current.map((user) => user.id === formUser.id ? { ...user, ...data } : user) : [...current, { ...data, id: saved?.id ?? `usr-${Date.now()}` }])
      setNotice(formUser ? 'Cambios guardados correctamente.' : 'Usuario creado correctamente.')
      setShowForm(false)
    } catch (error) {
      setNotice(`No se pudo crear el usuario: ${error.message}`)
    }
  }

  function toggleUser(user) {
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, active: !item.active } : item))
  }

  function togglePermission(currentRole, permission) {
    setMatrix((current) => ({ ...current, [currentRole]: current[currentRole].includes(permission) ? current[currentRole].filter((item) => item !== permission) : [...current[currentRole], permission] }))
    setNotice('Permiso actualizado para esta sesión.')
  }

  return (
    <section className="page-stack users-page" aria-labelledby="users-title">
      <div className="page-header"><div><p className="eyebrow">Seguridad y administración</p><h1 id="users-title">Usuarios</h1><p className="page-description">Administra accesos, responsabilidades y permisos de tu organización.</p></div><button className="button button-primary" onClick={() => { setFormUser(null); setShowForm(true) }} type="button">+ Agregar usuario</button></div>
      {notice && <p className="notice" role="status">{notice}</p>}
      <section className="panel" aria-labelledby="list-title"><div className="panel-heading"><div><p className="eyebrow">Directorio</p><h2 id="list-title">Listado de usuarios</h2></div><span className="panel-count">{filteredUsers.length} resultados</span></div><div className="filters"><label className="search-field">Buscar usuario<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o correo" /></label><label>Estado<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label><label>Rol<select value={role} onChange={(event) => setRole(event.target.value)}><option value="all">Todos los roles</option><option>Administrador</option><option>RRHH</option><option>Consulta</option></select></label></div><div className="table-wrap"><table><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Última actividad</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><small>{user.email}</small></td><td><span className="role-badge">{user.role}</span></td><td><span className={user.active ? 'status-label active' : 'status-label'}><span className="status-dot" />{user.active ? 'Activo' : 'Inactivo'}</span></td><td className="muted-cell">Hoy, 09:42</td><td><div className="row-actions"><button type="button" onClick={() => { setFormUser(user); setShowForm(true) }}>Editar</button><button type="button" onClick={() => toggleUser(user)}>{user.active ? 'Desactivar' : 'Activar'}</button></div></td></tr>)}</tbody></table></div></section>
      <PermissionMatrix roles={['Administrador', 'RRHH', 'Consulta']} selectedRole={selectedRole} onSelectRole={setSelectedRole} matrix={matrix} onToggle={togglePermission} />
      {showForm && <div className="modal-backdrop"><UserForm user={formUser} onCancel={() => setShowForm(false)} onSave={saveUser} /></div>}
    </section>
  )
}