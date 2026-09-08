import { useState, type FormEvent } from 'react'
import type { Departamento } from '../api/organizacionApi'
import { actualizarDepartamento, crearDepartamento } from '../api/organizacionApi'

type Props = { departamentos: Departamento[]; onChanged: () => Promise<void> }

export function DepartamentosPanel({ departamentos, onChanged }: Props) {
  const [selected, setSelected] = useState<Departamento | null>(null)
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [padreId, setPadreId] = useState('')
  const [activo, setActivo] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function startCreate() {
    setSelected(null)
    setNombre('')
    setCodigo('')
    setDescripcion('')
    setPadreId('')
    setActivo(true)
    setError('')
    setMessage('')
  }

  function startEdit(departamento: Departamento) {
    setSelected(departamento)
    setNombre(departamento.nombre)
    setCodigo(departamento.codigo ?? '')
    setDescripcion(departamento.descripcion ?? '')
    setPadreId(departamento.departamento_padre_id ?? '')
    setActivo(departamento.activo)
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
      const payload = {
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase() || null,
        descripcion: descripcion.trim() || null,
        departamento_padre_id: padreId || null,
        activo,
      }
      if (selected) {
        await actualizarDepartamento(selected.id, payload)
        setMessage('Departamento actualizado')
      } else {
        await crearDepartamento(payload)
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
      <p className="org-sub">Estructura organizativa y áreas de la empresa activa.</p>
      <div className="org-table-wrap">
        <table className="org-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Área Padre</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {departamentos.map((dept) => {
              const padre = departamentos.find((d) => d.id === dept.departamento_padre_id)
              return (
                <tr key={dept.id}>
                  <td>
                    <code>{dept.codigo || '—'}</code>
                  </td>
                  <td>
                    <strong>{dept.nombre}</strong>
                    {dept.descripcion && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{dept.descripcion}</div>
                    )}
                  </td>
                  <td>{padre?.nombre ?? '—'}</td>
                  <td>
                    <span style={{ color: dept.activo ? '#166534' : '#991b1b', fontWeight: 600 }}>
                      {dept.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button type="button" onClick={() => startEdit(dept)}>
                      Editar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {departamentos.length === 0 && <div className="empty-table">No hay departamentos registrados.</div>}
      </div>

      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <h3 style={{ margin: '8px 0' }}>{selected ? 'Editar departamento' : 'Nuevo departamento'}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
          <label className="org-label">
            Código
            <input
              className="org-input"
              placeholder="Ej. RRHH, IT, FIN"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            />
          </label>
          <label className="org-label">
            Nombre *
            <input
              className="org-input"
              placeholder="Ej. Recursos Humanos"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </label>
        </div>

        <label className="org-label">
          Departamento Padre (Jerarquía)
          <select className="org-select" value={padreId} onChange={(e) => setPadreId(e.target.value)}>
            <option value="">Ninguno (Área principal)</option>
            {departamentos
              .filter((d) => !selected || d.id !== selected.id)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} {d.codigo ? `(${d.codigo})` : ''}
                </option>
              ))}
          </select>
        </label>

        <label className="org-label">
          Descripción
          <textarea
            className="org-textarea"
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </label>

        <label className="check-label" style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />
          Área activa
        </label>

        {error && <div className="org-bad">{error}</div>}
        {message && <div className="org-ok">{message}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="org-btn" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : selected ? 'Guardar cambios' : 'Crear departamento'}
          </button>
          <button className="org-btn ghost" type="button" onClick={startCreate}>
            Nuevo
          </button>
        </div>
      </form>
    </section>
  )
}
