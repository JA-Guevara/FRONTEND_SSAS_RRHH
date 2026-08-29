import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  MODALIDADES,
  crearVacante,
  actualizarVacante,
  type CargoOpcion,
  type ModalidadVacante,
  type Vacante,
} from '../api/vacantesApi'

type Props = {
  cargos: CargoOpcion[]
  vacante?: Vacante | null
}

type FormState = {
  titulo: string
  cargo_id: string
  descripcion: string
  requisitos: string
  beneficios: string
  cantidad_vacantes: string
  salario_min: string
  salario_max: string
  mostrar_salario: boolean
  modalidad: ModalidadVacante
  ubicacion: string
  experiencia_min: string
  fecha_cierre: string
}

const empty: FormState = {
  titulo: '',
  cargo_id: '',
  descripcion: '',
  requisitos: '',
  beneficios: '',
  cantidad_vacantes: '1',
  salario_min: '',
  salario_max: '',
  mostrar_salario: false,
  modalidad: 'PRESENCIAL',
  ubicacion: '',
  experiencia_min: '',
  fecha_cierre: '',
}

function toForm(v: Vacante): FormState {
  return {
    titulo: v.titulo,
    cargo_id: String(v.cargo_id),
    descripcion: v.descripcion,
    requisitos: v.requisitos,
    beneficios: v.beneficios,
    cantidad_vacantes: String(v.cantidad_vacantes),
    salario_min: v.salario_min == null ? '' : String(v.salario_min),
    salario_max: v.salario_max == null ? '' : String(v.salario_max),
    mostrar_salario: v.mostrar_salario,
    modalidad: v.modalidad,
    ubicacion: v.ubicacion,
    experiencia_min: v.experiencia_min == null ? '' : String(v.experiencia_min),
    fecha_cierre: v.fecha_cierre,
  }
}

export function VacanteForm({ cargos, vacante }: Props) {
  const [form, setForm] = useState<FormState>(vacante ? toForm(vacante) : empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ok, setOk] = useState('')
  const [bad, setBad] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (vacante) setForm(toForm(vacante))
  }, [vacante])

  const departamento = useMemo(() => {
    const cargo = cargos.find((c) => String(c.id) === form.cargo_id)
    return cargo?.departamento_nombre ?? ''
  }, [cargos, form.cargo_id])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio'
    if (!form.cargo_id) e.cargo_id = 'Selecciona un cargo'
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria'
    const cantidad = Number(form.cantidad_vacantes)
    if (!form.cantidad_vacantes || Number.isNaN(cantidad) || cantidad < 1) {
      e.cantidad_vacantes = 'Debe ser 1 o más'
    }
    if (form.salario_min && Number.isNaN(Number(form.salario_min))) e.salario_min = 'Numérico'
    if (form.salario_max && Number.isNaN(Number(form.salario_max))) e.salario_max = 'Numérico'
    if (form.salario_min && form.salario_max && Number(form.salario_min) > Number(form.salario_max)) {
      e.salario_max = 'Debe ser mayor o igual al mínimo'
    }
    if (form.experiencia_min && (Number.isNaN(Number(form.experiencia_min)) || Number(form.experiencia_min) < 0)) {
      e.experiencia_min = 'Debe ser 0 o más'
    }
    if (!form.fecha_cierre) e.fecha_cierre = 'La fecha de cierre es obligatoria'
    else if (new Date(form.fecha_cierre) <= new Date()) e.fecha_cierre = 'Debe ser una fecha futura'
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
        titulo: form.titulo.trim(),
        cargo_id: Number(form.cargo_id),
        descripcion: form.descripcion.trim(),
        requisitos: form.requisitos.trim(),
        beneficios: form.beneficios.trim(),
        cantidad_vacantes: Number(form.cantidad_vacantes),
        salario_min: form.salario_min === '' ? null : Number(form.salario_min),
        salario_max: form.salario_max === '' ? null : Number(form.salario_max),
        mostrar_salario: form.mostrar_salario,
        modalidad: form.modalidad,
        ubicacion: form.ubicacion.trim(),
        experiencia_min: form.experiencia_min === '' ? null : Number(form.experiencia_min),
        fecha_cierre: form.fecha_cierre,
      }
      if (vacante) await actualizarVacante(vacante.id, payload)
      else {
        await crearVacante(payload)
        setForm(empty)
      }
      setOk(vacante ? 'Vacante actualizada' : 'Vacante guardada como borrador')
    } catch (err) {
      const withFields = err as Error & { fields?: Record<string, string> }
      if (withFields.fields) setErrors(withFields.fields)
      setBad(withFields.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="vac-card" onSubmit={handleSubmit}>
      <div className="vac-grid">
        <div>
          <label className="vac-label">Título <i>*</i></label>
          <input className={`vac-input ${errors.titulo ? 'error' : ''}`} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          {errors.titulo && <div className="vac-error">{errors.titulo}</div>}
        </div>
        <div>
          <label className="vac-label">Cargo <i>*</i></label>
          <select className={`vac-select ${errors.cargo_id ? 'error' : ''}`} value={form.cargo_id} onChange={(e) => setForm({ ...form, cargo_id: e.target.value })}>
            <option value="">Seleccionar</option>
            {cargos.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {errors.cargo_id && <div className="vac-error">{errors.cargo_id}</div>}
        </div>
        <div>
          <label className="vac-label">Departamento</label>
          <input className="vac-input" value={departamento} disabled placeholder="Se completa al elegir cargo" />
        </div>
        <div>
          <label className="vac-label">Cantidad de vacantes <i>*</i></label>
          <input className={`vac-input ${errors.cantidad_vacantes ? 'error' : ''}`} value={form.cantidad_vacantes} onChange={(e) => setForm({ ...form, cantidad_vacantes: e.target.value })} />
          {errors.cantidad_vacantes && <div className="vac-error">{errors.cantidad_vacantes}</div>}
        </div>
        <div>
          <label className="vac-label">Salario mín.</label>
          <input className={`vac-input ${errors.salario_min ? 'error' : ''}`} value={form.salario_min} onChange={(e) => setForm({ ...form, salario_min: e.target.value })} />
          {errors.salario_min && <div className="vac-error">{errors.salario_min}</div>}
        </div>
        <div>
          <label className="vac-label">Salario máx.</label>
          <input className={`vac-input ${errors.salario_max ? 'error' : ''}`} value={form.salario_max} onChange={(e) => setForm({ ...form, salario_max: e.target.value })} />
          {errors.salario_max && <div className="vac-error">{errors.salario_max}</div>}
        </div>
        <div>
          <label className="vac-label">Modalidad</label>
          <select className="vac-select" value={form.modalidad} onChange={(e) => setForm({ ...form, modalidad: e.target.value as ModalidadVacante })}>
            {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="vac-label">Ubicación</label>
          <input className="vac-input" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
        </div>
        <div>
          <label className="vac-label">Experiencia mín. (años)</label>
          <input className={`vac-input ${errors.experiencia_min ? 'error' : ''}`} value={form.experiencia_min} onChange={(e) => setForm({ ...form, experiencia_min: e.target.value })} />
          {errors.experiencia_min && <div className="vac-error">{errors.experiencia_min}</div>}
        </div>
        <div>
          <label className="vac-label">Fecha de cierre <i>*</i></label>
          <input type="date" className={`vac-input ${errors.fecha_cierre ? 'error' : ''}`} value={form.fecha_cierre} onChange={(e) => setForm({ ...form, fecha_cierre: e.target.value })} />
          {errors.fecha_cierre && <div className="vac-error">{errors.fecha_cierre}</div>}
        </div>
      </div>

      <label className="vac-switch">
        <input type="checkbox" checked={form.mostrar_salario} onChange={(e) => setForm({ ...form, mostrar_salario: e.target.checked })} />
        Mostrar salario
      </label>

      <label className="vac-label">Descripción <i>*</i></label>
      <textarea className={`vac-textarea ${errors.descripcion ? 'error' : ''}`} rows={4} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
      {errors.descripcion && <div className="vac-error">{errors.descripcion}</div>}

      <label className="vac-label">Requisitos</label>
      <textarea className="vac-textarea" rows={3} value={form.requisitos} onChange={(e) => setForm({ ...form, requisitos: e.target.value })} />

      <label className="vac-label">Beneficios</label>
      <textarea className="vac-textarea" rows={2} value={form.beneficios} onChange={(e) => setForm({ ...form, beneficios: e.target.value })} />

      {bad && <div className="vac-bad">{bad}</div>}
      {ok && <div className="vac-ok">{ok}</div>}

      <div className="vac-actions">
        <button className="vac-btn" type="submit" disabled={saving}>
          {saving ? 'Guardando...' : vacante ? 'Guardar cambios' : 'Guardar borrador'}
        </button>
      </div>
    </form>
  )
}