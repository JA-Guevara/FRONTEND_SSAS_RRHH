import { useEffect, useState } from 'react'

const emptyForm = { name: '', email: '', role: 'Consulta', active: true }

export function UserForm({ user, onCancel, onSave }) {
  const [form, setForm] = useState(user ?? emptyForm)

  useEffect(() => setForm(user ?? emptyForm), [user])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    onSave(form)
  }

  return (
    <form className="user-form" onSubmit={submit}>
      <div className="panel-heading"><div><p className="eyebrow">{user ? 'Editar registro' : 'Nuevo registro'}</p><h2>{user ? 'Actualizar usuario' : 'Agregar usuario'}</h2></div><button className="icon-button" type="button" onClick={onCancel} aria-label="Cerrar formulario">×</button></div>
      <label>Nombre completo<input value={form.name} onChange={(event) => update('name', event.target.value)} required minLength="2" /></label>
      <label>Correo electrónico<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required /></label>
      {!user && <label>Contraseña temporal<input type="password" minLength="8" value={form.password ?? ''} onChange={(event) => update('password', event.target.value)} required /></label>}
      <label>Rol<select value={form.role} onChange={(event) => update('role', event.target.value)}><option>Administrador</option><option>RRHH</option><option>Consulta</option></select></label>
      <label className="check-label"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} /> Usuario activo</label>
      <div className="form-actions"><button className="button button-quiet-dark" type="button" onClick={onCancel}>Cancelar</button><button className="button button-primary" type="submit">{user ? 'Guardar cambios' : 'Crear usuario'}</button></div>
    </form>
  )
}