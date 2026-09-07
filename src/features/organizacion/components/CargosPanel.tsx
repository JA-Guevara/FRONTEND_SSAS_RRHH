import { useState, type FormEvent } from 'react'
import type { Cargo, Departamento } from '../api/organizacionApi'
import { actualizarCargo, crearCargo } from '../api/organizacionApi'

type Props = { cargos: Cargo[]; departamentos: Departamento[]; onChanged: () => Promise<void> }

export function CargosPanel({ cargos, departamentos, onChanged }: Props) {
  const [editing, setEditing] = useState<Cargo | null>(null)
  const [nombre, setNombre] = useState('')
  const [departamentoId, setDepartamentoId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [activo, setActivo] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function reset() {
    setEditing(null)
    setNombre('')
    setDepartamentoId('')
    setDescripcion('')
    setActivo(true)
    setError('')
    setMessage('')
  }

  function startEdit(cargo: Cargo) {
    setEditing(cargo)
    setNombre(cargo.nombre)
    setDepartamentoId(cargo.departamento_id ?? '')
    setDescripcion(cargo.descripcion ?? '')
    setActivo(cargo.activo)
    setError('')
    setMessage('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { nombre: nombre.trim(), departamento_id: departamentoId || null, descripcion: descripcion.trim() || null, activo }
      if (editing) {
        await actualizarCargo(editing.id, payload)
        setMessage('Cargo actualizado')
      } else {
        await crearCargo(payload)
        setMessage('Cargo creado')
        reset()
      }
      await onChanged()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="org-card">
      <h2>Cargos</h2>
      <p className="org-sub">Cargos reales asociados a departamentos.</p>
      <div className="org-table-wrap"><table className="org-table"><thead><tr><th>Nombre</th><th>Departamento</th><th>Estado</th><th /></tr></thead><tbody>
        {cargos.map((cargo) => <tr key={cargo.id}><td>{cargo.nombre}</td><td>{departamentos.find((item) => item.id === cargo.departamento_id)?.nombre ?? '—'}</td><td>{cargo.activo ? 'Activo' : 'Inactivo'}</td><td><button type="button" onClick={() => startEdit(cargo)}>Editar</button></td></tr>)}
      </tbody></table>{cargos.length === 0 && <div className="empty-table">No hay cargos.</div>}</div>
      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <h3 style={{ margin: '8px 0' }}>{editing ? 'Editar cargo' : 'Nuevo cargo'}</h3>
        <label className="org-label">Nombre *<input className="org-input" value={nombre} onChange={(event) => setNombre(event.target.value)} required /></label>
        <label className="org-label">Departamento<select className="org-select" value={departamentoId} onChange={(event) => setDepartamentoId(event.target.value)}><option value="">Sin departamento</option>{departamentos.map((departamento) => <option key={departamento.id} value={departamento.id}>{departamento.nombre}</option>)}</select></label>
        <label className="org-label">Descripción<textarea className="org-textarea" rows={3} value={descripcion} onChange={(event) => setDescripcion(event.target.value)} /></label>
        <label className="check-label"><input type="checkbox" checked={activo} onChange={(event) => setActivo(event.target.checked)} />Activo</label>
        {error && <div className="org-bad">{error}</div>}{message && <div className="org-ok">{message}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button className="org-btn" type="submit" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear cargo'}</button><button className="org-btn ghost" type="button" onClick={reset}>Nuevo</button></div>
      </form>
    </section>
  )
}
