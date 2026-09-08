import { useEffect, useState, type FormEvent } from 'react'
import type { components } from '../../../shared/api/schema'
import { rolesApi } from '../../roles/api/rolesApi'
import { usuariosApi } from '../api/usuariosApi'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { Alert, Badge, Button, Field, Modal, PageHeader, Panel } from '../../../shared/components'

type User = components['schemas']['UsuarioResponse']
type Role = components['schemas']['RoleSchema']

export function ListadoUsuariosPage() {
  const { company } = useCompanyScope()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [resettingUser, setResettingUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Create form state
  const [createForm, setCreateForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    password: '',
    telefono: '',
    role_ids: [] as string[],
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    telefono: '',
    role_ids: [] as string[],
  })

  // Password reset state
  const [newPassword, setNewPassword] = useState('')
  const [mustChangePassword, setMustChangePassword] = useState(true)

  async function load() {
    setStatus('loading')
    setErrorMessage(null)
    try {
      const [userPage, availableRoles] = await Promise.all([
        usuariosApi.list({
          empresa_id: company?.id,
          search: search.trim() || undefined,
          is_active: activeFilter === '' ? undefined : activeFilter === 'true',
          page: 1,
          per_page: 100,
        }),
        rolesApi.list(company?.id),
      ])
      setUsers(userPage.items)
      setRoles(availableRoles)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios')
    }
  }

  useEffect(() => {
    void load()
  }, [company?.id])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setActionLoading(true)
    setMessage(null)
    setErrorMessage(null)
    try {
      await usuariosApi.create({
        nombre: createForm.nombre.trim(),
        apellido: createForm.apellido.trim(),
        email: createForm.email.trim(),
        username: createForm.username.trim(),
        password: createForm.password,
        telefono: createForm.telefono.trim() || null,
        role_ids: createForm.role_ids,
        ...(company ? { empresa_id: company.id } : {}),
      })
      setShowCreateModal(false)
      setCreateForm({
        nombre: '',
        apellido: '',
        email: '',
        username: '',
        password: '',
        telefono: '',
        role_ids: [],
      })
      setMessage('Usuario creado correctamente.')
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear el usuario')
    } finally {
      setActionLoading(false)
    }
  }

  function startEdit(user: User) {
    const userRoleIds = roles
      .filter((r) => user.roles?.includes(r.name) || user.roles?.includes(r.codigo))
      .map((r) => r.id)
    setEditingUser(user)
    setEditForm({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      username: user.username,
      telefono: user.telefono || '',
      role_ids: userRoleIds,
    })
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editingUser) return
    setActionLoading(true)
    setMessage(null)
    setErrorMessage(null)
    try {
      await usuariosApi.update(editingUser.id, {
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        email: editForm.email.trim(),
        username: editForm.username.trim(),
        telefono: editForm.telefono.trim() || null,
        role_ids: editForm.role_ids,
      })
      setEditingUser(null)
      setMessage(`Usuario "${editForm.nombre} ${editForm.apellido}" actualizado correctamente.`)
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar el usuario')
    } finally {
      setActionLoading(false)
    }
  }

  async function handlePasswordReset(e: FormEvent) {
    e.preventDefault()
    if (!resettingUser) return
    setActionLoading(true)
    setMessage(null)
    setErrorMessage(null)
    try {
      await usuariosApi.changePassword(
        resettingUser.id,
        { new_password: newPassword, must_change: mustChangePassword },
        company?.id,
      )
      setResettingUser(null)
      setNewPassword('')
      setMessage(`Contraseña asignada correctamente para "${resettingUser.nombre} ${resettingUser.apellido}".`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar la contraseña')
    } finally {
      setActionLoading(false)
    }
  }

  async function toggleStatus(user: User) {
    setMessage(null)
    setErrorMessage(null)
    try {
      if (user.is_active) await usuariosApi.deactivate(user.id)
      else await usuariosApi.activate(user.id)
      setMessage(`Estado del usuario "${user.nombre}" modificado correctamente.`)
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo cambiar el estado')
    }
  }

  async function handleUnlock(user: User) {
    setMessage(null)
    setErrorMessage(null)
    try {
      await usuariosApi.unlock(user.id)
      setMessage(`Usuario "${user.nombre}" desbloqueado exitosamente.`)
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo desbloquear el usuario')
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <PageHeader
        eyebrow="Administración de Equipo"
        title="Gestión de Usuarios"
        description="Administra los colaboradores, asignación de roles y control de credenciales de la empresa."
        actions={
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Nuevo usuario
          </Button>
        }
      />

      {message && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert tone="success" title="Éxito">
            {message}
          </Alert>
        </div>
      )}

      {errorMessage && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert tone="error" title="Atención">
            {errorMessage}
          </Alert>
        </div>
      )}

      <Panel title="Directorio de Usuarios" eyebrow="Búsqueda y filtros">
        {/* Filtros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Field label="Buscar por nombre, usuario o email">
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ej. Juan, juanperez, admin..."
            />
          </Field>

          <Field label="Estado">
            <select
              className="input"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="true">Solo activos</option>
              <option value="false">Solo inactivos</option>
            </select>
          </Field>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button variant="secondary" onClick={() => void load()} style={{ width: '100%' }}>
              Aplicar filtros
            </Button>
          </div>
        </div>

        {status === 'loading' ? (
          <p style={{ color: '#64748b' }}>Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontStyle: 'italic' }}>
            No se encontraron usuarios que coincidan con la búsqueda.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Colaborador</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Correo Electrónico</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Roles Asignados</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {u.nombre} {u.apellido}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        @{u.username} {u.telefono ? `· 📞 ${u.telefono}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <Badge key={r} tone="neutral">
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                            Sin roles
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge tone={u.is_active ? 'success' : 'warning'}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Button variant="secondary" size="sm" onClick={() => startEdit(u)}>
                          ✏️ Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setResettingUser(u)}>
                          🔑 Clave
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void toggleStatus(u)}
                        >
                          {u.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleUnlock(u)}
                          title="Desbloquear intentos"
                        >
                          🔓
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Modal: Crear Usuario */}
      {showCreateModal && (
        <Modal
          onClose={() => setShowCreateModal(false)}
          title="Crear Nuevo Usuario"
        >
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Nombres *">
                <input
                  className="input"
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  required
                />
              </Field>
              <Field label="Apellidos *">
                <input
                  className="input"
                  value={createForm.apellido}
                  onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })}
                  required
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Correo electrónico *">
                <input
                  type="email"
                  className="input"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
              </Field>
              <Field label="Nombre de usuario *">
                <input
                  className="input"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
                  required
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Contraseña temporal *">
                <input
                  type="password"
                  className="input"
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                />
              </Field>
              <Field label="Teléfono">
                <input
                  className="input"
                  value={createForm.telefono}
                  onChange={(e) => setCreateForm({ ...createForm, telefono: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Roles asignados">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                {roles.map((r) => (
                  <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={createForm.role_ids.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCreateForm({ ...createForm, role_ids: [...createForm.role_ids, r.id] })
                        } else {
                          setCreateForm({ ...createForm, role_ids: createForm.role_ids.filter((id) => id !== r.id) })
                        }
                      }}
                    />
                    {r.name}
                  </label>
                ))}
              </div>
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" loading={actionLoading}>
                Crear usuario
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Editar Usuario */}
      {editingUser && (
        <Modal
          onClose={() => setEditingUser(null)}
          title={`Editar Usuario: ${editingUser.nombre} ${editingUser.apellido}`}
        >
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Nombres *">
                <input
                  className="input"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  required
                />
              </Field>
              <Field label="Apellidos *">
                <input
                  className="input"
                  value={editForm.apellido}
                  onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                  required
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Correo electrónico *">
                <input
                  type="email"
                  className="input"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </Field>
              <Field label="Nombre de usuario *">
                <input
                  className="input"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </Field>
            </div>

            <Field label="Teléfono">
              <input
                className="input"
                value={editForm.telefono}
                onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
              />
            </Field>

            <Field label="Roles asignados">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                {roles.map((r) => (
                  <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editForm.role_ids.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditForm({ ...editForm, role_ids: [...editForm.role_ids, r.id] })
                        } else {
                          setEditForm({ ...editForm, role_ids: editForm.role_ids.filter((id) => id !== r.id) })
                        }
                      }}
                    />
                    {r.name}
                  </label>
                ))}
              </div>
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" loading={actionLoading}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Asignar Contraseña Administrativa */}
      {resettingUser && (
        <Modal
          onClose={() => setResettingUser(null)}
          title={`Asignar Contraseña a: ${resettingUser.nombre} ${resettingUser.apellido}`}
        >
          <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Establece una nueva clave para este usuario. Se revocarán todas sus sesiones activas inmediatamente.
            </p>

            <Field label="Nueva contraseña administrativa *">
              <input
                type="password"
                className="input"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </Field>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={mustChangePassword}
                onChange={(e) => setMustChangePassword(e.target.checked)}
              />
              Exigir cambio de contraseña en el próximo inicio de sesión
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setResettingUser(null)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" loading={actionLoading}>
                Actualizar contraseña
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
