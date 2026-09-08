import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Field, Panel } from '../../../shared/components'
import {
  NIVELES_EDUCATIVOS,
  enviarPostulacion,
  type NivelEducativo,
  type VacantePublica,
} from '../api/portalApi'
import { etiquetaNivelEducativo } from '../utils/formato'

type Props = {
  vacante: VacantePublica
  empresaNombre: string
  /** Ruta de la página de seguimiento, para consultar el estado después. */
  seguimientoHref: string
  onBack: () => void
}

const VACIO = {
  nombres: '',
  apellidos: '',
  ci: '',
  email: '',
  telefono: '',
  ciudad: '',
  nivel_educativo: '' as NivelEducativo | '',
  anios_experiencia: '',
  linkedin: '',
  cv: null as File | null,
}

const MAX_CV_BYTES = 5 * 1024 * 1024

export function PostulacionForm({ vacante, empresaNombre, seguimientoHref, onBack }: Props) {
  const [form, setForm] = useState(VACIO)
  const [consiente, setConsiente] = useState(false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [codigo, setCodigo] = useState('')
  const [correoAvisado, setCorreoAvisado] = useState('')
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [errorCopia, setErrorCopia] = useState('')

  useEffect(() => {
    if (!copiado) return
    const temporizador = window.setTimeout(() => setCopiado(false), 2500)
    return () => window.clearTimeout(temporizador)
  }, [copiado])

  function actualizar(cambios: Partial<typeof VACIO>) {
    setForm((actual) => ({ ...actual, ...cambios }))
  }

  function validar() {
    const nuevos: Record<string, string> = {}
    if (form.nombres.trim() === '') nuevos.nombres = 'Escribe tus nombres.'
    if (form.apellidos.trim() === '') nuevos.apellidos = 'Escribe tus apellidos.'
    if (form.email.trim() === '') nuevos.email = 'Escribe tu correo electrónico.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevos.email = 'Ese correo no parece válido. Revisa que esté completo.'
    }
    if (form.cv === null) nuevos.cv = 'Adjunta tu hoja de vida.'
    else if (form.cv.size > MAX_CV_BYTES) nuevos.cv = 'El archivo pesa más de 5 MB.'
    else if (!/\.(pdf|docx?)$/i.test(form.cv.name)) {
      nuevos.cv = 'El archivo debe ser PDF o Word (.pdf, .doc o .docx).'
    }
    if (
      form.anios_experiencia !== '' &&
      (Number.isNaN(Number(form.anios_experiencia)) || Number(form.anios_experiencia) < 0)
    ) {
      nuevos.anios_experiencia = 'Escribe un número de 0 o más.'
    }
    if (!consiente) {
      nuevos.consentimiento = 'Necesitamos tu autorización para revisar tu postulación.'
    }
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault()
    setErrorEnvio('')
    setCodigo('')
    if (!validar()) return
    setEnviando(true)
    try {
      const respuesta = await enviarPostulacion(vacante.id, form)
      setCodigo(respuesta.codigo_seguimiento)
      setCorreoAvisado(form.email.trim())
      setForm(VACIO)
      setConsiente(false)
      setErrores({})
    } catch (causa) {
      const conCampos = causa as Error & { fields?: Record<string, string> }
      if (conCampos.fields) setErrores(conCampos.fields)
      setErrorEnvio(conCampos.message || 'No se pudo enviar tu postulación. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigo)
      setErrorCopia('')
      setCopiado(true)
    } catch {
      setErrorCopia('Tu navegador no dejó copiar el código. Selecciónalo y cópialo a mano.')
    }
  }

  if (codigo !== '') {
    return (
      <Panel title="Recibimos tu postulación" eyebrow={vacante.titulo}>
        <div className="form-stack">
          <Alert tone="success">
            Tu postulación ya está en manos del equipo de selección de {empresaNombre}.
          </Alert>

          <div>
            <p className="text-muted">
              Guarda este código de seguimiento: es lo único que necesitas para consultar en qué
              paso está tu postulación.
            </p>
            <p className="badge-list">
              <span className="tracking-code">
                {codigo}
                <Button variant="secondary" size="sm" onClick={() => void copiarCodigo()}>
                  {copiado ? 'Copiado' : 'Copiar'}
                </Button>
              </span>
            </p>
          </div>

          {errorCopia !== '' && <Alert tone="info">{errorCopia}</Alert>}

          {correoAvisado !== '' && (
            <p className="text-muted">
              Si tu perfil avanza te escribiremos a {correoAvisado}. Revisa también la carpeta de
              correo no deseado.
            </p>
          )}

          <p>
            <Link to={seguimientoHref}>Consultar el estado de mi postulación</Link>
          </p>

          <div className="form-actions-start">
            <Button variant="secondary" onClick={onBack}>
              Volver a la vacante
            </Button>
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <Panel
      title={`Postúlate a ${vacante.titulo}`}
      eyebrow={empresaNombre}
      actions={
        <Button variant="secondary" onClick={onBack}>
          Volver a la vacante
        </Button>
      }
    >
      <form className="form-stack" onSubmit={(evento) => void handleSubmit(evento)}>
        <div className="form-grid">
          <Field label="Nombres" error={errores.nombres}>
            <input
              value={form.nombres}
              onChange={(evento) => actualizar({ nombres: evento.target.value })}
              maxLength={120}
              autoComplete="given-name"
              required
            />
          </Field>
          <Field label="Apellidos" error={errores.apellidos}>
            <input
              value={form.apellidos}
              onChange={(evento) => actualizar({ apellidos: evento.target.value })}
              maxLength={120}
              autoComplete="family-name"
              required
            />
          </Field>
        </div>

        <div className="form-grid">
          <Field label="Correo electrónico" error={errores.email}>
            <input
              type="email"
              value={form.email}
              onChange={(evento) => actualizar({ email: evento.target.value })}
              autoComplete="email"
              required
            />
          </Field>
          <Field
            label="Teléfono"
            hint="Para avisarte de una entrevista."
            error={errores.telefono}
          >
            <input
              value={form.telefono}
              onChange={(evento) => actualizar({ telefono: evento.target.value })}
              maxLength={40}
              autoComplete="tel"
            />
          </Field>
        </div>

        <div className="form-grid">
          <Field
            label="Carné de identidad"
            hint="Solo para identificarte en el proceso."
            error={errores.ci}
          >
            <input
              value={form.ci}
              onChange={(evento) => actualizar({ ci: evento.target.value })}
              maxLength={40}
            />
          </Field>
          <Field label="Ciudad" error={errores.ciudad}>
            <input
              value={form.ciudad}
              onChange={(evento) => actualizar({ ciudad: evento.target.value })}
              maxLength={120}
              autoComplete="address-level2"
            />
          </Field>
        </div>

        <div className="form-grid">
          <Field label="Nivel educativo" error={errores.nivel_educativo}>
            <select
              value={form.nivel_educativo}
              onChange={(evento) =>
                actualizar({ nivel_educativo: evento.target.value as NivelEducativo | '' })
              }
            >
              <option value="">Elige una opción</option>
              {NIVELES_EDUCATIVOS.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {etiquetaNivelEducativo(nivel)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Años de experiencia" error={errores.anios_experiencia}>
            <input
              type="number"
              min={0}
              value={form.anios_experiencia}
              onChange={(evento) => actualizar({ anios_experiencia: evento.target.value })}
            />
          </Field>
        </div>

        <Field label="LinkedIn" hint="Opcional. Pega la dirección de tu perfil." error={errores.linkedin}>
          <input
            value={form.linkedin}
            onChange={(evento) => actualizar({ linkedin: evento.target.value })}
            placeholder="https://www.linkedin.com/in/tu-perfil"
          />
        </Field>

        <Field
          label="Hoja de vida"
          hint="Archivo PDF o Word (.pdf, .doc o .docx) de hasta 5 MB."
          error={errores.cv}
        >
          <span className="file-field">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(evento) => actualizar({ cv: evento.target.files?.[0] ?? null })}
              required
            />
            <span className="file-field-name">
              {form.cv !== null ? form.cv.name : 'Todavía no elegiste ningún archivo'}
            </span>
          </span>
        </Field>

        <Alert tone="info" title="Para qué usamos tus datos">
          {empresaNombre} usa tu carné de identidad para identificarte sin confusiones, tu correo y
          tu teléfono para avisarte de cada paso, y tu hoja de vida para comparar tu perfil con los
          requisitos de esta vacante. Solo el equipo de selección de la empresa ve esta información
          y la conserva mientras dure el proceso. Puedes pedir que la corrijan o la eliminen
          escribiendo a la empresa.
        </Alert>

        <div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={consiente}
              onChange={(evento) => setConsiente(evento.target.checked)}
            />
            Autorizo a {empresaNombre} a guardar y usar estos datos y mi hoja de vida para evaluar
            esta postulación.
          </label>
          {errores.consentimiento !== undefined && (
            <span className="field-error" role="alert">
              {errores.consentimiento}
            </span>
          )}
        </div>

        {errorEnvio !== '' && <Alert tone="error">{errorEnvio}</Alert>}

        <div className="form-actions-start">
          <Button type="submit" loading={enviando}>
            Enviar mi postulación
          </Button>
        </div>
      </form>
    </Panel>
  )
}
