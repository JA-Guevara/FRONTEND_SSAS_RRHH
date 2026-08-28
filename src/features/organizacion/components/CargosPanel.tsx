import { useState, type FormEvent } from 'react'
import type { Cargo, Departamento, NivelCargo } from '../api/organizacionApi'
import { NIVELES_CARGO, actualizarCargo, crearCargo } from '../api/organizacionApi'

type Props = {
  cargos: Cargo[]
  departamentos: Departamento[]
  onChanged: () => Promise<void>
}

const empty = {
  nombre: '',
  departamento_id: '',
  nivel: 'PROFESIONAL' as NivelCargo,
  salario_min: '',
  salario_max: '',
  descripcion: '',
}

export function CargosPanel({ cargos, departamentos, onChanged }: Props) {
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ok, setOk] = useState('')
  const [bad, setBad] = useState('')
  const [saving, setSaving] = useState(false)

  const nombreDepto = (id: number) => departamentos.find((d) => d.id === id)?.nombre ?? '—'

  function startEdit(c: Cargo) {
    setEditingId(c.id)
    setForm({
      nombre: c.nombre,
      departamento_id: String(c.departamento_id),
      nivel: c.nivel,
      salario_min: c.salario_min == null ? '' : String(c.salario_min),
      salario_max: c.salario_max == null ? '' : String(c.salario_max),
      descripcion: c.descripcion,
    })
    setErrors({})
    setOk('')
    setBad('')
  }

  function reset() {
    setEditingId(null)
    setForm(empty)
    setErrors({})
    setOk('')
    setBad('')
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.departamento_id) e.departamento_id = 'Selecciona un departamento'
    if (form.salario_min && Number.isNaN(Number(form.salario_min))) e.salario_min = 'Numérico'
    if (form.salario_max && Number.isNaN(Number(form.salario_max))) e.salario_max = 'Numérico'
    if (form.salario_min && form.salario_max && Number(form.salario_min) > Number(form.salario_max)) {
      e.salario_max = 'Debe ser mayor o igual al mínimo'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setOk('')
    setBad('')
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        departamento_id: Number(form.departamento_id),
        nivel: form.nivel,
        salario_min: form.salario_min === '' ? null : Number(form.salario_min),
        salario_max: form.salario_max === '' ? null : Number(form.salario_max),
        descripcion: form.descripcion.trim(),
      }
      if (editingId) {
        await actualizarCargo(editingId, payload)
        setOk('Cargo actualizado')
      } else {
        await crearCargo(payload)
        setOk('Cargo creado')
        setForm(empty)
      }
      await onChanged()
    } catch (err) {
      setBad(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="org-card">
      <h2>Cargos</h2>
      <div className="org-table-wrap">
        <table className="org-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Departamento</th>
              <th>Nivel</th>
              <th>Salario</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cargos.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{nombreDepto(c.departamento_id)}</td>
                <td><span className="org-chip">{c.nivel}</span></td>
                <td>
                  {c.salario_min ?? '—'} – {c.salario_max ?? '—'}
                </td>
                <td className="org-actions">
                  <button type="button" onClick={() => startEdit(c)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <h3 style={{ margin: '8px 0' }}>{editingId ? 'Editar cargo' : 'Nuevo cargo'}</h3>
        <div className="org-form-grid">
          <div>
            <label className="org-label">Nombre *</label>
            <input className={`org-input ${errors.nombre ? 'error' : ''}`} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            {errors.nombre && <div className="org-error">{errors.nombre}</div>}
          </div>
          <div>
            <label className="org-label">Departamento *</label>
            <select className={`org-select ${errors.departamento_id ? 'error' : ''}`} value={form.departamento_id} onChange={(e) => setForm({ ...form, departamento_id: e.target.value })}>
              <option value="">Seleccionar</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
            {errors.departamento_id && <div className="org-error">{errors.departamento_id}</div>}
          </div>
          <div>
            <label className="org-label">Nivel</label>
            <select className="org-select" value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value as NivelCargo })}>
              {NIVELES_CARGO.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="org-label">Salario mín.</label>
            <input className={`org-input ${errors.salario_min ? 'error' : ''}`} value={form.salario_min} onChange={(e) => setForm({ ...form, salario_min: e.target.value })} />
            {errors.salario_min && <div className="org-error">{errors.salario_min}</div>}
          </div>
          <div>
            <label className="org-label">Salario máx.</label>
            <input className={`org-input ${errors.salario_max ? 'error' : ''}`} value={form.salario_max} onChange={(e) => setForm({ ...form, salario_max: e.target.value })} />
            {errors.salario_max && <div className="org-error">{errors.salario_max}</div>}
          </div>
        </div>
        <label className="org-label">Descripción</label>
        <textarea className="org-textarea" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

        {bad && <div className="org-bad">{bad}</div>}
        {ok && <div className="org-ok">{ok}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="org-btn" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear cargo'}
          </button>
          <button className="org-btn ghost" type="button" onClick={reset}>Cancelar</button>
        </div>
      </form>
    </section>
  )
}