const permissions = ['Ver usuarios', 'Crear usuarios', 'Editar usuarios', 'Administrar roles', 'Consultar bitácora']

export function PermissionMatrix({ roles, selectedRole, onSelectRole, matrix, onToggle }) {
  return (
    <section className="panel matrix-panel" aria-labelledby="matrix-title">
      <div className="panel-heading"><div><p className="eyebrow">Control de acceso</p><h2 id="matrix-title">Roles y permisos</h2></div><span className="panel-count">{roles.length} roles</span></div>
      <div className="role-tabs" role="tablist" aria-label="Roles"><div>{roles.map((role) => <button className={role === selectedRole ? 'role-tab selected' : 'role-tab'} key={role} onClick={() => onSelectRole(role)} role="tab" aria-selected={role === selectedRole} type="button">{role}</button>)}</div></div>
      <div className="permission-list">{permissions.map((permission) => <label className="permission-row" key={permission}><span>{permission}</span><input type="checkbox" checked={matrix[selectedRole]?.includes(permission) ?? false} onChange={() => onToggle(selectedRole, permission)} /></label>)}</div>
    </section>
  )
}