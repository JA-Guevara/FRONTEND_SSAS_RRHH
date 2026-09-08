import { useState, type FormEvent } from 'react'
import type { Departamento } from '../api/organizacionApi'
import { actualizarDepartamento, crearDepartamento } from '../api/organizacionApi'

type Props = { departamentos: Departamento[]; empresaId?: string; onChanged: () => Promise<void> }

export function DepartamentosPanel({ departamentos, empresaId, onChanged }: Props) {
  const [selected, setSelected] = useState<Departamento | null>(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function startCreate() {
    setSelected(null)
    setNombre('')
    setDescripcion('')
    setError('')
    setMessage('')
  }

  function startEdit(departamento: Departamento) {
    setSelected(departamento)
    setNombre(departamento.nombre)
    setDescripcion(departamento.descripcion ?? '')
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
      const payload = { nombre: nombre.trim(), descripcion: descripcion.trim() || null, activo: true }
      if (selected) {
        await actualizarDepartamento(selected.id, payload, empresaId)
        setMessage('Departamento actualizado')
      } else {
        await crearDepartamento(payload, empresaId)
        setMessage('Departamento creado')
        startCreate()
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
      <h2>Departamentos</h2>
      <p className="org-sub">Catálogo real de departamentos de la empresa activa.</p>
      <div className="org-table-wrap"><table className="org-table"><thead><tr><th>Nombre</th><th>Descripción</th><th>Estado</th><th /></tr></thead><tbody>
        {departamentos.map((departamento) => <tr key={departamento.id}><td>{departamento.nombre}</td><td>{departamento.descripcion ?? '—'}</td><td>{departamento.activo ? 'Activo' : 'Inactivo'}</td><td><button type="button" onClick={() => startEdit(departamento)}>Editar</button></td></tr>)}
  </tbody></table>{departamentos.length === 0 && <div className="empty-table">No hay departamentos.</div>}</div>
      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <h3 style={{ margin: '8px 0' }}>{selected ? 'Editar departamento' : 'Nuevo departamento'}</h3>
        <label className="org-label">Nombre *<input className="org-input" value={nombre} onChange={(event) => setNombre(event.target.value)} required /></label>
        <label className="org-label">Descripción<textarea className="org-textarea" rows={3} value={descripcion} onChange={(event) => setDescripcion(event.target.value)} /></label>
        {error && <div className="org-bad">{error}</div>}{message && <div className="org-ok">{message}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button className="org-btn" type="submit" disabled={saving}>{saving ? 'Guardando...' : selected ? 'Guardar cambios' : 'Crear departamento'}</button><button className="org-btn ghost" type="button" onClick={startCreate}>Nuevo</button></div>
      </form>
    </section>
  )
}
