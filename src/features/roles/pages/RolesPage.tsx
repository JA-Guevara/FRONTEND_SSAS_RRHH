import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { components } from '../../../shared/api/schema'
import { rolesApi } from '../api/rolesApi'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { Alert, Badge, Button, ConfirmDialog, Field, PageHeader, Panel } from '../../../shared/components'

type Role = components['schemas']['RoleSchema']
type Permission = components['schemas']['PermisoSchema']

/** Convierte un código de recurso/operación (ej. "postulaciones_publicas") en texto legible. */
function humanizar(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/[_\-]/g, ' ')
    .replace(/\b\w/g, (caracter) => caracter.toUpperCase())
}

function nombrePermiso(p: Permission): string {
  return `${humanizar(p.operacion)} ${humanizar(p.recurso)}`
}

export function RolesPage() {
  const { company } = useCompanyScope()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [savingPermissions, setSavingPermissions] = useState(false)
  const [creatingRole, setCreatingRole] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  // New role form
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleCodigo, setNewRoleCodigo] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')

  async function load() {
    setStatus('loading')
    setErrorMessage(null)
    try {
      const [availableRoles, availablePermissions] = await Promise.all([
        rolesApi.list(company?.id),
        rolesApi.permisos(),
      ])
      setRoles(availableRoles)
      setPermissions(availablePermissions)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'No se pudieron cargar los roles')
    }
  }

  useEffect(() => {
    void load()
  }, [company?.id])

  function editPermissions(role: Role) {
    setSelectedRole(role)
    setSelectedPermissions(new Set((role.permissions ?? []).map((p) => p.id)))
    setMessage(null)
    setErrorMessage(null)
  }

  async function savePermissions() {
    if (selectedRole === null) return
    setSavingPermissions(true)
    setMessage(null)
    setErrorMessage(null)
    try {
      const updated = await rolesApi.assignPermissions(selectedRole.id, [...selectedPermissions])
      setRoles((current) => current.map((role) => (role.id === updated.id ? updated : role)))
      setSelectedRole(updated)
      setMessage(`Permisos del rol "${updated.name}" actualizados correctamente.`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudieron actualizar los permisos')
    } finally {
      setSavingPermissions(false)
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setCreatingRole(true)
    setMessage(null)
    setErrorMessage(null)
    try {
      await rolesApi.create({
        name: newRoleName.trim(),
        codigo: newRoleCodigo.trim().toUpperCase(),
        description: newRoleDesc.trim() || null,
      })
      setNewRoleName('')
      setNewRoleCodigo('')
      setNewRoleDesc('')
      setMessage('Rol creado correctamente.')
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear el rol')
    } finally {
      setCreatingRole(false)
    }
  }

  async function confirmDelete() {
    if (!roleToDelete) return
    try {
      await rolesApi.remove(roleToDelete.id)
      if (selectedRole?.id === roleToDelete.id) {
        setSelectedRole(null)
      }
      setMessage(`Rol "${roleToDelete.name}" eliminado correctamente.`)
      setRoleToDelete(null)
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo eliminar el rol')
    }
  }

  // Group permissions by resource module
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {}
    for (const p of permissions) {
      const groupKey = p.modulo ? p.modulo.toUpperCase() : 'GENERAL'
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(p)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [permissions])

  function togglePermission(id: string) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedPermissions(new Set(permissions.map((p) => p.id)))
  }

  function deselectAll() {
    setSelectedPermissions(new Set())
  }

  function toggleGroup(groupPerms: Permission[]) {
    const allSelected = groupPerms.every((p) => selectedPermissions.has(p.id))
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        groupPerms.forEach((p) => next.delete(p.id))
      } else {
        groupPerms.forEach((p) => next.add(p.id))
      }
      return next
    })
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <PageHeader
        eyebrow="Seguridad y Control de Acceso"
        title="Roles y Permisos Granulares"
        description="Administra los perfiles de acceso y permisos RBAC asignados a los usuarios de la organización."
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
          <Alert tone="error" title="Error">
            {errorMessage}
          </Alert>
        </div>
      )}

      {/* Formulario de creación */}
      <Panel title="Crear Nuevo Rol" eyebrow="Define un rol personalizado para tu equipo">
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <Field label="Nombre del rol *">
            <input
              className="input"
              placeholder="Ej. Reclutador Senior"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
            />
          </Field>

          <Field label="Código (identificador) *">
            <input
              className="input"
              placeholder="RECLUTADOR_SENIOR"
              value={newRoleCodigo}
              onChange={(e) => setNewRoleCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              required
            />
          </Field>

          <Field label="Descripción">
            <input
              className="input"
              placeholder="Responsable de publicaciones..."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
            />
          </Field>

          <div>
            <Button variant="primary" type="submit" loading={creatingRole}>
              + Crear rol
            </Button>
          </div>
        </form>
      </Panel>

      {/* Lista de roles */}
      <div style={{ marginTop: '1.5rem' }}>
        <Panel title="Roles Configurados" eyebrow="Catálogo de perfiles disponibles">
          {status === 'loading' ? (
            <p style={{ color: '#64748b' }}>Cargando catálogo de roles...</p>
          ) : roles.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay roles registrados.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Nombre</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Código</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Permisos</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => {
                    const isSelected = selectedRole?.id === role.id
                    return (
                      <tr
                        key={role.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected ? '#f0fdf4' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                          {role.name}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <code style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '0.25rem' }}>
                            {role.codigo}
                          </code>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <Badge tone="neutral">{role.permissions?.length ?? 0} permisos</Badge>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <Badge tone={role.is_active ? 'success' : 'warning'}>
                            {role.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <Button
                              variant={isSelected ? 'primary' : 'secondary'}
                              size="sm"
                              onClick={() => editPermissions(role)}
                            >
                              {isSelected ? '✓ Editando' : 'Configurar permisos'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRoleToDelete(role)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* Editor granular de permisos para el rol seleccionado */}
      {selectedRole && (
        <div style={{ marginTop: '2rem' }}>
          <Panel
            title={`Permisos para: ${selectedRole.name}`}
            eyebrow={`${selectedPermissions.size} de ${permissions.length} permisos activos`}
            actions={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Seleccionar todos
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Deseleccionar todos
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={savingPermissions}
                  onClick={() => void savePermissions()}
                >
                  Guardar permisos
                </Button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {groupedPermissions.map(([modulo, perms]) => {
                const selectedInGroup = perms.filter((p) => selectedPermissions.has(p.id)).length
                const allGroupSelected = selectedInGroup === perms.length

                return (
                  <div
                    key={modulo}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      background: '#ffffff',
                    }}
                  >
                    {/* Header del módulo */}
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                          Módulo {modulo}
                        </span>
                        <Badge tone={selectedInGroup > 0 ? 'success' : 'neutral'}>
                          {selectedInGroup} / {perms.length} seleccionados
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroup(perms)}
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        {allGroupSelected ? 'Deseleccionar módulo' : 'Seleccionar módulo'}
                      </Button>
                    </div>

                    {/* Checkboxes de permisos */}
                    <div
                      style={{
                        padding: '1rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '0.75rem',
                      }}
                    >
                      {perms.map((p) => {
                        const isChecked = selectedPermissions.has(p.id)
                        return (
                          <label
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '0.375rem',
                              border: isChecked ? '1px solid #86efac' : '1px solid #f1f5f9',
                              background: isChecked ? '#f0fdf4' : '#fafafa',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.id)}
                              style={{ width: 16, height: 16, marginTop: '0.15rem', cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                                {nombrePermiso(p)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                                {p.descripcion || p.codigo}
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button
                variant="primary"
                loading={savingPermissions}
                onClick={() => void savePermissions()}
              >
                Guardar cambios para {selectedRole.name}
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Confirmación de eliminación */}
      {roleToDelete && (
        <ConfirmDialog
          title="Eliminar Rol"
          message={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete.name}"? Los usuarios que lo tengan asignado perderán los permisos asociados.`}
          confirmLabel="Eliminar definitivamente"
          tone="danger"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setRoleToDelete(null)}
        />
      )}
    </div>
  )
}
