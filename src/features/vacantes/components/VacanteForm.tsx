import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  MODALIDADES,
  crearVacante,
  actualizarVacante,
  type CargoOpcion,
  type ModalidadVacante,
  type Vacante,
} from '../api/vacantesApi'
import { listarHabilidades, type Habilidad } from '../../habilidades/api/habilidadesApi'

type Props = {
  cargos: CargoOpcion[]
  vacante?: Vacante | null
  empresaId?: string
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

type HabilidadSeleccionada = {
  habilidad_id: string
  nombre: string
  nivel_requerido: string
  es_obligatorio: boolean
  peso: number
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
  const cierre = v.fecha_cierre ? new Date(v.fecha_cierre) : null
  return {
    titulo: v.titulo,
    cargo_id: String(v.cargo_id),
    descripcion: v.descripcion,
    requisitos: v.requisitos ?? '',
    beneficios: v.beneficios ?? '',
    cantidad_vacantes: String(v.cantidad_vacantes),
    salario_min: v.salario_min == null ? '' : String(v.salario_min),
    salario_max: v.salario_max == null ? '' : String(v.salario_max),
    mostrar_salario: v.mostrar_salario,
    modalidad: v.modalidad as ModalidadVacante,
    ubicacion: v.ubicacion ?? '',
    experiencia_min: v.experiencia_min == null ? '' : String(v.experiencia_min),
    fecha_cierre: cierre
      ? `${cierre.getFullYear()}-${String(cierre.getMonth() + 1).padStart(2, '0')}-${String(cierre.getDate()).padStart(2, '0')}`
      : '',
  }
}

export function VacanteForm({ cargos, vacante, empresaId }: Props) {
  const [form, setForm] = useState<FormState>(vacante ? toForm(vacante) : empty)
  const [habilidadesRequeridas, setHabilidadesRequeridas] = useState<HabilidadSeleccionada[]>([])
  const [catalogoHabilidades, setCatalogoHabilidades] = useState<Habilidad[]>([])
  const [selectedHabilidadId, setSelectedHabilidadId] = useState('')
  const [selectedNivel, setSelectedNivel] = useState('INTERMEDIO')
  const [selectedObligatorio, setSelectedObligatorio] = useState(true)
  const [selectedPeso, setSelectedPeso] = useState('1.0')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ok, setOk] = useState('')
  const [bad, setBad] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!empresaId) {
      setCatalogoHabilidades([])
      return
    }
    let active = true
    listarHabilidades(empresaId)
      .then((data) => {
        if (active) setCatalogoHabilidades(data.filter((h) => h.activo))
      })
      .catch(() => {
        if (active) setCatalogoHabilidades([])
      })
    return () => {
      active = false
    }
  }, [empresaId])

  useEffect(() => {
    if (vacante) {
      setForm(toForm(vacante))
      if (vacante.habilidades && vacante.habilidades.length > 0) {
        setHabilidadesRequeridas(
          vacante.habilidades.map((h) => ({
            habilidad_id: h.habilidad_id,
            nombre: h.nombre || 'Habilidad',
            nivel_requerido: h.nivel_requerido,
            es_obligatorio: h.es_obligatorio,
            peso: Number(h.peso) || 1,
          })),
        )
      } else {
        setHabilidadesRequeridas([])
      }
    } else {
      setHabilidadesRequeridas([])
    }
  }, [vacante])

  const departamento = useMemo(() => {
    const cargo = cargos.find((c) => String(c.id) === form.cargo_id)
    return cargo?.departamento_nombre ?? ''
  }, [cargos, form.cargo_id])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio'
    if (!form.cargo_id) e.cargo_id = 'Selecciona un cargo'
    else if (!cargos.find((cargo) => cargo.id === form.cargo_id)?.departamento_id) {
      e.cargo_id = 'El cargo seleccionado no tiene departamento asignado'
    }
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
    else if (new Date(`${form.fecha_cierre}T23:59:59`) <= new Date()) e.fecha_cierre = 'Debe ser una fecha futura'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleAddHabilidad(e?: React.MouseEvent) {
    if (e) e.preventDefault()
    if (!selectedHabilidadId) return
    if (habilidadesRequeridas.some((h) => h.habilidad_id === selectedHabilidadId)) {
      return
    }
    const hab = catalogoHabilidades.find((h) => h.id === selectedHabilidadId)
    setHabilidadesRequeridas((prev) => [
      ...prev,
      {
        habilidad_id: selectedHabilidadId,
        nombre: hab ? hab.nombre : 'Habilidad',
        nivel_requerido: selectedNivel,
        es_obligatorio: selectedObligatorio,
        peso: Number(selectedPeso) || 1.0,
      },
    ])
    setSelectedHabilidadId('')
  }

  function handleRemoveHabilidad(habilidadId: string) {
    setHabilidadesRequeridas((prev) => prev.filter((h) => h.habilidad_id !== habilidadId))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setOk('')
    setBad('')
    if (!validate()) return
    setSaving(true)
    try {
      const cargo = cargos.find((item) => item.id === form.cargo_id)
      if (!cargo?.departamento_id) return
      const payload = {
        titulo: form.titulo.trim(),
        cargo_id: form.cargo_id,
        departamento_id: cargo.departamento_id,
        descripcion: form.descripcion.trim(),
        requisitos: form.requisitos.trim() || null,
        beneficios: form.beneficios.trim() || null,
        cantidad_vacantes: Number(form.cantidad_vacantes),
        salario_min: form.salario_min === '' ? null : Number(form.salario_min),
        salario_max: form.salario_max === '' ? null : Number(form.salario_max),
        mostrar_salario: form.mostrar_salario,
        modalidad: form.modalidad,
        ubicacion: form.ubicacion.trim() || null,
        experiencia_min: form.experiencia_min === '' ? 0 : Number(form.experiencia_min),
        fecha_cierre: new Date(`${form.fecha_cierre}T23:59:59`).toISOString(),
        habilidades: habilidadesRequeridas.map((h) => ({
          habilidad_id: h.habilidad_id,
          nivel_requerido: h.nivel_requerido,
          es_obligatorio: h.es_obligatorio,
          peso: Number(h.peso) || 1.0,
        })),
      }
      if (vacante) await actualizarVacante(vacante.id, payload, empresaId)
      else {
        await crearVacante(payload, empresaId)
        setForm(empty)
        setHabilidadesRequeridas([])
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

      {/* Sección de Habilidades Requeridas */}
      <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
        <label className="vac-label" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
          🎯 Habilidades requeridas para la vacante
        </label>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          Asocia competencias técnicas o blandas para evaluar automáticamente la compatibilidad de los candidatos.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', alignItems: 'flex-end', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="vac-label" style={{ fontSize: '0.8rem' }}>Habilidad</label>
            <select
              className="vac-select"
              value={selectedHabilidadId}
              onChange={(e) => setSelectedHabilidadId(e.target.value)}
            >
              <option value="">-- Seleccionar habilidad --</option>
              {catalogoHabilidades
                .filter((h) => !habilidadesRequeridas.some((req) => req.habilidad_id === h.id))
                .map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.nombre} ({h.categoria || 'General'})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="vac-label" style={{ fontSize: '0.8rem' }}>Nivel requerido</label>
            <select
              className="vac-select"
              value={selectedNivel}
              onChange={(e) => setSelectedNivel(e.target.value)}
            >
              <option value="BASICO">Básico</option>
              <option value="INTERMEDIO">Intermedio</option>
              <option value="AVANZADO">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="vac-label" style={{ fontSize: '0.8rem' }}>Peso (ponderación)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="5.0"
              className="vac-input"
              value={selectedPeso}
              onChange={(e) => setSelectedPeso(e.target.value)}
            />
          </div>

          <div style={{ paddingBottom: '0.4rem' }}>
            <label className="vac-switch" style={{ margin: 0, fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={selectedObligatorio}
                onChange={(e) => setSelectedObligatorio(e.target.checked)}
              />
              Obligatoria
            </label>
          </div>

          <div>
            <button
              type="button"
              className="vac-btn vac-btn-primary"
              style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              disabled={!selectedHabilidadId}
              onClick={handleAddHabilidad}
            >
              + Agregar
            </button>
          </div>
        </div>

        {habilidadesRequeridas.length > 0 ? (
          <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {habilidadesRequeridas.map((item) => (
              <div
                key={item.habilidad_id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '2rem',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.nombre}</span>
                <span
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    borderRadius: '1rem',
                    padding: '0.1rem 0.45rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {item.nivel_requerido}
                </span>
                {item.es_obligatorio && (
                  <span
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      borderRadius: '1rem',
                      padding: '0.1rem 0.45rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    Obligatoria
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>x{item.peso}</span>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    fontWeight: 'bold',
                    marginLeft: '0.25rem',
                    fontSize: '1rem',
                    lineHeight: 1,
                  }}
                  onClick={() => handleRemoveHabilidad(item.habilidad_id)}
                  title="Eliminar habilidad"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.85rem', color: '#94a3b8' }}>
            No se han asignado habilidades a esta vacante aún.
          </div>
        )}
      </div>

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
