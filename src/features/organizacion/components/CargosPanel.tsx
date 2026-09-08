import { useState, type FormEvent } from 'react'
import type { Cargo, Departamento } from '../api/organizacionApi'
import { actualizarCargo, crearCargo } from '../api/organizacionApi'

type Props = { cargos: Cargo[]; departamentos: Departamento[]; onChanged: () => Promise<void> }

export function CargosPanel({ cargos, departamentos, onChanged }: Props) {
  const [editing, setEditing] = useState<Cargo | null>(null)
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [departamentoId, setDepartamentoId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [nivel, setNivel] = useState('JUNIOR')
  const [salarioMin, setSalarioMin] = useState('')
  const [salarioMax, setSalarioMax] = useState('')
  const [activo, setActivo] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function reset() {
    setEditing(null)
    setNombre('')
    setCodigo('')
    setDepartamentoId('')
    setDescripcion('')
    setNivel('JUNIOR')
    setSalarioMin('')
    setSalarioMax('')
    setActivo(true)
    setError('')
    setMessage('')
  }

  function startEdit(cargo: Cargo) {
    setEditing(cargo)
    setNombre(cargo.nombre)
    setCodigo(cargo.codigo ?? '')
    setDepartamentoId(cargo.departamento_id ?? '')
    setDescripcion(cargo.descripcion ?? '')
    setNivel(cargo.nivel ?? 'JUNIOR')
    setSalarioMin(cargo.salario_min != null ? String(cargo.salario_min) : '')
    setSalarioMax(cargo.salario_max != null ? String(cargo.salario_max) : '')
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
      const payload = {
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase() || null,
        departamento_id: departamentoId || null,
        descripcion: descripcion.trim() || null,
        nivel: nivel || null,
        salario_min: salarioMin === '' ? null : Number(salarioMin),
        salario_max: salarioMax === '' ? null : Number(salarioMax),
        activo,
      }
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
      <h2>Cargos y Posiciones</h2>
      <p className="org-sub">Puestos de trabajo definidos con escala salarial y nivel.</p>
      <div className="org-table-wrap">
        <table className="org-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Puesto / Cargo</th>
              <th>Departamento</th>
              <th>Nivel</th>
              <th>Rango Salarial</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cargos.map((cargo) => (
              <tr key={cargo.id}>
                <td>
                  <code>{cargo.codigo || '—'}</code>
                </td>
                <td>
                  <strong>{cargo.nombre}</strong>
                  {cargo.descripcion && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{cargo.descripcion}</div>
                  )}
                </td>
                <td>
                  {departamentos.find((item) => item.id === cargo.departamento_id)?.nombre ?? (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin área</span>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '0.25rem' }}>
                    {cargo.nivel || 'General'}
                  </span>
                </td>
                <td>
                  {cargo.salario_min != null || cargo.salario_max != null ? (
                    <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
                      Bs. {cargo.salario_min ?? '0'} - {cargo.salario_max ?? '—'}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <span style={{ color: cargo.activo ? '#166534' : '#991b1b', fontWeight: 600 }}>
                    {cargo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button type="button" onClick={() => startEdit(cargo)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cargos.length === 0 && <div className="empty-table">No hay cargos registrados.</div>}
      </div>

      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <h3 style={{ margin: '8px 0' }}>{editing ? 'Editar cargo' : 'Nuevo cargo'}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
          <label className="org-label">
            Código
            <input
              className="org-input"
              placeholder="Ej. DEV-SR, REC-JR"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            />
          </label>
          <label className="org-label">
            Nombre del cargo *
            <input
              className="org-input"
              placeholder="Ej. Desarrollador Fullstack"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <label className="org-label">
            Departamento
            <select
              className="org-select"
              value={departamentoId}
              onChange={(e) => setDepartamentoId(e.target.value)}
            >
              <option value="">-- Sin departamento --</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="org-label">
            Nivel / Seniority
            <select className="org-select" value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option value="TRAINEE">Trainee / Pasante</option>
              <option value="JUNIOR">Junior</option>
              <option value="SEMI_SENIOR">Semi Senior</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead / Jefe</option>
              <option value="DIRECTOR">Director / Gerencial</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <label className="org-label">
            Salario mín. referencial (Bs.)
            <input
              type="number"
              className="org-input"
              value={salarioMin}
              onChange={(e) => setSalarioMin(e.target.value)}
              placeholder="Ej. 5000"
            />
          </label>
          <label className="org-label">
            Salario máx. referencial (Bs.)
            <input
              type="number"
              className="org-input"
              value={salarioMax}
              onChange={(e) => setSalarioMax(e.target.value)}
              placeholder="Ej. 8000"
            />
          </label>
        </div>

        <label className="org-label">
          Descripción de funciones
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
          Cargo activo para selección
        </label>

        {error && <div className="org-bad">{error}</div>}
        {message && <div className="org-ok">{message}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="org-btn" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear cargo'}
          </button>
          <button className="org-btn ghost" type="button" onClick={reset}>
            Nuevo
          </button>
        </div>
      </form>
    </section>
  )
}
