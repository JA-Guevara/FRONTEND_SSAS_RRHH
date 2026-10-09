import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Alert,
  Button,
  Field,
  FormActions,
  FormGrid,
  FormSection,
} from '../../../shared/components'
import { ApiError } from '../../../shared/api/httpClient'
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
  const [errorHabilidades, setErrorHabilidades] = useState<string | null>(null)
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
      setErrorHabilidades(null)
      return
    }
    let active = true
    setErrorHabilidades(null)
    listarHabilidades(empresaId)
      .then((data) => {
        if (active) setCatalogoHabilidades(data.filter((h) => h.activo))
      })
      .catch((cause: unknown) => {
        if (!active) return
        setCatalogoHabilidades([])
        setErrorHabilidades(
          cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo de habilidades.',
        )
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

  const habilidadesDisponibles = catalogoHabilidades.filter(
    (h) => !habilidadesRequeridas.some((req) => req.habilidad_id === h.id),
  )

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

  function handleAddHabilidad() {
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
    if (!validate()) {
      setTimeout(() => {
        const firstInvalid = document.querySelector<HTMLElement>(
          'input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]'
        )
        firstInvalid?.focus()
      }, 10)
      return
    }
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
      setOk(vacante ? 'Vacante actualizada con éxito' : 'Vacante guardada como borrador con éxito')
    } catch (cause) {
      if (cause instanceof ApiError) setErrors(cause.fieldErrors)
      setBad(cause instanceof Error ? cause.message : 'No se pudo guardar la vacante.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form-stack" noValidate onSubmit={(evento) => void handleSubmit(evento)}>
      <FormSection
        title="Datos de la vacante"
        description="Información básica sobre el puesto, modalidad de trabajo y plazo de convocatoria."
      >
        <FormGrid columns={2}>
          <Field label="Título del puesto" required error={errors.titulo}>
            {fieldProps => (
              <input
                {...fieldProps}
                className="input"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej. Desarrollador Fullstack Senior"
              />
            )}
          </Field>

          <Field label="Cargo de la estructura" required error={errors.cargo_id}>
            {fieldProps => (
              <select
                {...fieldProps}
                className="input"
                value={form.cargo_id}
                onChange={(e) => setForm({ ...form, cargo_id: e.target.value })}
              >
                <option value="">Seleccionar cargo</option>
                {cargos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Departamento" hint="Asignado automáticamente por el cargo.">
            {fieldProps => (
              <input {...fieldProps} className="input" value={departamento} disabled />
            )}
          </Field>

          <Field label="Cantidad de puestos" required error={errors.cantidad_vacantes}>
            {fieldProps => (
              <input
                {...fieldProps}
                className="input"
                type="number"
                min="1"
                value={form.cantidad_vacantes}
                onChange={(e) => setForm({ ...form, cantidad_vacantes: e.target.value })}
              />
            )}
          </Field>

          <Field label="Salario mínimo" optional error={errors.salario_min} hint="En moneda local">
            {fieldProps => (
              <input
                {...fieldProps}
                className="input"
                type="number"
                placeholder="Ej. 7000"
                value={form.salario_min}
                onChange={(e) => setForm({ ...form, salario_min: e.target.value })}
              />
            )}
          </Field>

          <Field label="Salario máximo" optional error={errors.salario_max} hint="En moneda local">
            {fieldProps => (
              <input
                {...fieldProps}
                className="input"
                type="number"
                placeholder="Ej. 10000"
                value={form.salario_max}
                onChange={(e) => setForm({ ...form, salario_max: e.target.value })}
              />
            )}
          </Field>

          <Field label="Modalidad de trabajo">
            {fieldProps => (
              <select
                {...fieldProps}
                className="input"
                value={form.modalidad}
                onChange={(e) => setForm({ ...form, modalidad: e.target.value as ModalidadVacante })}
              >
                {MODALIDADES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Ubicación física" optional hint="Ciudad o sede de la empresa">
            {fieldProps => (
              <input
                {...fieldProps}
                className="input"
                placeholder="Ej. Santa Cruz de la Sierra"
                value={form.ubicacion}
                onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              />
            )}
          </Field>

          <Field label="Experiencia mínima (años)" optional error={errors.experiencia_min}>
            {fieldProps => (
              <input
                {...fieldProps}
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={form.experiencia_min}
                onChange={(e) => setForm({ ...form, experiencia_min: e.target.value })}
              />
            )}
          </Field>

          <Field label="Fecha de cierre" required error={errors.fecha_cierre} hint="Límite para recibir postulaciones">
            {fieldProps => (
              <input
                {...fieldProps}
                className="input"
                type="date"
                value={form.fecha_cierre}
                onChange={(e) => setForm({ ...form, fecha_cierre: e.target.value })}
              />
            )}
          </Field>
        </FormGrid>

        <label className="check-label mt-4">
          <input
            type="checkbox"
            checked={form.mostrar_salario}
            onChange={(e) => setForm({ ...form, mostrar_salario: e.target.checked })}
          />
          Mostrar el salario en el portal público de empleo
        </label>
      </FormSection>

      <FormSection
        title="Detalle de la oferta"
        description="Describe las responsabilidades principales, requisitos mínimos y beneficios que ofrece la empresa."
      >
        <div className="form-stack">
          <Field label="Descripción del rol" required error={errors.descripcion}>
            {fieldProps => (
              <textarea
                {...fieldProps}
                className="input"
                rows={4}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Describe el propósito del rol y los objetivos principales..."
              />
            )}
          </Field>

          <Field label="Requisitos y competencias" optional>
            {fieldProps => (
              <textarea
                {...fieldProps}
                className="input"
                rows={3}
                value={form.requisitos}
                onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
                placeholder="Formación académica, tecnologías deseadas o certificaciones..."
              />
            )}
          </Field>

          <Field label="Beneficios y compensaciones" optional>
            {fieldProps => (
              <textarea
                {...fieldProps}
                className="input"
                rows={2}
                value={form.beneficios}
                onChange={(e) => setForm({ ...form, beneficios: e.target.value })}
                placeholder="Seguro médico, capacitaciones, horarios flexibles..."
              />
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Habilidades requeridas"
        description="Asocia competencias técnicas o blandas para evaluar la compatibilidad de los candidatos."
      >
        <div className="form-stack">
          {errorHabilidades !== null && <Alert tone="error">{errorHabilidades}</Alert>}

          {errorHabilidades === null && catalogoHabilidades.length === 0 && (
            <Alert tone="info">
              No hay habilidades activas en el catálogo de la empresa. Regístralas en «Habilidades»
              para poder exigirlas en una vacante.
            </Alert>
          )}

          <FormGrid columns={2}>
            <Field label="Habilidad">
              {fieldProps => (
                <select
                  {...fieldProps}
                  className="input"
                  value={selectedHabilidadId}
                  onChange={(e) => setSelectedHabilidadId(e.target.value)}
                  disabled={habilidadesDisponibles.length === 0}
                >
                  <option value="">Seleccionar habilidad</option>
                  {habilidadesDisponibles.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nombre} ({h.categoria || 'General'})
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="Nivel requerido">
              {fieldProps => (
                <select
                  {...fieldProps}
                  className="input"
                  value={selectedNivel}
                  onChange={(e) => setSelectedNivel(e.target.value)}
                >
                  <option value="BASICO">Básico</option>
                  <option value="INTERMEDIO">Intermedio</option>
                  <option value="AVANZADO">Avanzado</option>
                </select>
              )}
            </Field>

            <Field label="Peso (ponderación)" hint="Entre 0,1 y 5,0">
              {fieldProps => (
                <input
                  {...fieldProps}
                  className="input"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5.0"
                  value={selectedPeso}
                  onChange={(e) => setSelectedPeso(e.target.value)}
                />
              )}
            </Field>
          </FormGrid>

          <label className="check-label">
            <input
              type="checkbox"
              checked={selectedObligatorio}
              onChange={(e) => setSelectedObligatorio(e.target.checked)}
            />
            Es una habilidad obligatoria
          </label>

          <div className="form-actions-start">
            <Button variant="secondary" disabled={!selectedHabilidadId} onClick={handleAddHabilidad}>
              Agregar habilidad
            </Button>
          </div>

          {habilidadesRequeridas.length > 0 ? (
            <div className="badge-list">
              {habilidadesRequeridas.map((item) => (
                <span className="chip" key={item.habilidad_id}>
                  <strong>{item.nombre}</strong>
                  <span>· {item.nivel_requerido}</span>
                  {item.es_obligatorio && <span>· obligatoria</span>}
                  <span>· peso {item.peso}</span>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Quitar ${item.nombre}`}
                    onClick={() => handleRemoveHabilidad(item.habilidad_id)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted">Todavía no se han asignado habilidades a esta vacante.</p>
          )}
        </div>
      </FormSection>

      {bad !== '' && <Alert tone="error">{bad}</Alert>}
      {ok !== '' && <Alert tone="success">{ok}</Alert>}

      <FormActions sticky align="end">
        <Button type="submit" loading={saving} size="lg">
          {vacante ? 'Guardar cambios' : 'Guardar borrador'}
        </Button>
      </FormActions>
    </form>
  )
}
