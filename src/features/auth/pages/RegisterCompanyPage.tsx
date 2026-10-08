import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { tokenStorage } from '../../../shared/api/session'
import { useAuth } from '../hooks/useAuth'
import { Alert, Button, Field, Panel } from '../../../shared/components'
import { FormPage } from '../../../shared/templates'

export function RegisterCompanyPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [form, setForm] = useState({
    razon_social: '',
    nombre_comercial: '',
    slug: '',
    nit: '',
    email: '',
    telefono: '',
    ciudad: '',
    color_primario: '#176b4b',
    descripcion: '',
    admin_nombre: '',
    admin_apellido: '',
    admin_email: '',
    admin_username: '',
    admin_password: '',
    admin_password_confirm: '',
    admin_telefono: '',
  })

  function handleSlugAutofill(nombre: string) {
    if (!form.slug || form.slug === form.nombre_comercial.toLowerCase().replace(/[^a-z0-9]/g, '')) {
      const autoSlug = nombre.toLowerCase().replace(/[^a-z0-9]/g, '')
      setForm((prev) => ({ ...prev, nombre_comercial: nombre, slug: autoSlug }))
    } else {
      setForm((prev) => ({ ...prev, nombre_comercial: nombre }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (form.admin_password !== form.admin_password_confirm) {
      setErrorMsg('Las contraseñas ingresadas no coinciden.')
      return
    }

    if (form.admin_password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      const response = await authApi.registroEmpresa({
        razon_social: form.razon_social.trim(),
        nombre_comercial: form.nombre_comercial.trim(),
        slug: form.slug.trim().toLowerCase(),
        nit: form.nit.trim() || null,
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
        ciudad: form.ciudad.trim() || null,
        color_primario: form.color_primario.trim() || '#176b4b',
        descripcion: form.descripcion.trim() || null,
        admin_nombre: form.admin_nombre.trim(),
        admin_apellido: form.admin_apellido.trim(),
        admin_email: form.admin_email.trim(),
        admin_username: form.admin_username.trim(),
        admin_password: form.admin_password,
        admin_telefono: form.admin_telefono.trim() || null,
      })

      // Almacenar token y autenticar la sesión
      tokenStorage.set({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        realm: 'tenant',
      })

      await refreshUser()
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo completar el registro de la empresa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormPage
      header={{
        title: 'Registra tu Empresa en SSAS RRHH',
        subtitle: 'Comienza a gestionar tu equipo, departamentos, vacantes y postulaciones en minutos.',
        eyebrow: 'Alta de Organización',
      }}
      onSubmit={handleSubmit}
      footerActions={
        <div className="stack items-center col-span-full">
          <Button
            variant="primary"
            size="lg"
            type="submit"
            loading={loading}
            className="button-block max-w-sm"
          >
            Completar Registro y Entrar
          </Button>

          <p className="text-sm text-muted">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link to="/login" className="text-strong">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      }
    >
      {errorMsg && (
        <Alert tone="error" title="Error de registro">
          {errorMsg}
        </Alert>
      )}

      <Panel
        title="1. Información de la Empresa"
        eyebrow="Identificación oficial y comercial de tu organización"
      >
        <div className="grid-2">
          <Field label="Razón Social *">
            <input
              className="input"
              placeholder="Ej. Soluciones Digitales S.R.L."
              value={form.razon_social}
              onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
              required
            />
          </Field>

          <Field label="Nombre Comercial *">
            <input
              className="input"
              placeholder="Ej. SoluDigital"
              value={form.nombre_comercial}
              onChange={(e) => handleSlugAutofill(e.target.value)}
              required
            />
          </Field>

          <Field label="Slug de la empresa (Identificador URL) *">
            <input
              className="input"
              placeholder="ej. soludigital"
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                })
              }
              required
            />
          </Field>

          <Field label="NIT">
            <input
              className="input"
              placeholder="Ej. 1020304050"
              value={form.nit}
              onChange={(e) => setForm({ ...form, nit: e.target.value })}
            />
          </Field>

          <Field label="Email de Contacto Empresarial">
            <input
              type="email"
              className="input"
              placeholder="contacto@empresa.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <Field label="Teléfono Empresarial">
            <input
              className="input"
              placeholder="+591 70000000"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </Field>

          <Field label="Ciudad">
            <input
              className="input"
              placeholder="Ej. Santa Cruz de la Sierra"
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            />
          </Field>

          <Field label="Color Primario de la Marca">
            <div className="row">
              <input
                type="color"
                className="color-picker-input"
                value={form.color_primario}
                onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
              />
              <input
                className="input"
                value={form.color_primario}
                onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
                placeholder="#176b4b"
              />
            </div>
          </Field>
        </div>
      </Panel>

      <Panel
        title="2. Administrador Principal"
        eyebrow="Credenciales de acceso empresarial"
      >
        <div className="grid-2">
          <Field label="Nombre *">
            <input
              className="input"
              placeholder="Ej. Juan"
              value={form.admin_nombre}
              onChange={(e) => setForm({ ...form, admin_nombre: e.target.value })}
              required
            />
          </Field>

          <Field label="Apellido *">
            <input
              className="input"
              placeholder="Ej. Pérez"
              value={form.admin_apellido}
              onChange={(e) => setForm({ ...form, admin_apellido: e.target.value })}
              required
            />
          </Field>

          <Field label="Correo Electrónico (Login) *">
            <input
              type="email"
              className="input"
              placeholder="juan.perez@empresa.com"
              value={form.admin_email}
              onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
              required
            />
          </Field>

          <Field label="Nombre de Usuario (Username) *">
            <input
              className="input"
              placeholder="juanperez"
              value={form.admin_username}
              onChange={(e) =>
                setForm({
                  ...form,
                  admin_username: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9._-]/g, ''),
                })
              }
              required
            />
          </Field>

          <Field label="Contraseña (Mínimo 8 caracteres) *">
            <input
              type="password"
              className="input"
              placeholder="Mínimo 8 caracteres"
              value={form.admin_password}
              onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
              required
            />
          </Field>

          <Field label="Confirmar Contraseña *">
            <input
              type="password"
              className="input"
              placeholder="Repite la contraseña"
              value={form.admin_password_confirm}
              onChange={(e) => setForm({ ...form, admin_password_confirm: e.target.value })}
              required
            />
          </Field>

          <Field label="Teléfono de Contacto">
            <input
              className="input"
              placeholder="Ej. +591 71234567"
              value={form.admin_telefono}
              onChange={(e) => setForm({ ...form, admin_telefono: e.target.value })}
            />
          </Field>
        </div>
      </Panel>
    </FormPage>
  )
}
