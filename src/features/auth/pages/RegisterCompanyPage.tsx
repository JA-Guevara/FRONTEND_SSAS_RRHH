import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { tokenStorage } from '../../../shared/api/session'
import { useAuth } from '../hooks/useAuth'
import {
  Alert,
  Button,
  Field,
  FormActions,
  FormGrid,
  FormSection,
  PageHeader,
} from '../../../shared/components'
import { useFormulario, type ValidationErrors } from '../../../shared/hooks'

type RegisterCompanyForm = {
  razon_social: string
  nombre_comercial: string
  slug: string
  nit: string
  email: string
  telefono: string
  ciudad: string
  color_primario: string
  descripcion: string
  admin_nombre: string
  admin_apellido: string
  admin_email: string
  admin_username: string
  admin_password: string
  admin_password_confirm: string
  admin_telefono: string
}

export function RegisterCompanyPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [generalError, setGeneralError] = useState<string | null>(null)

  const {
    values,
    errors,
    isSubmitting,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
  } = useFormulario<RegisterCompanyForm>({
    initialValues: {
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
    },
    validate: (form): ValidationErrors<RegisterCompanyForm> => {
      const errs: ValidationErrors<RegisterCompanyForm> = {}

      if (!form.razon_social.trim()) {
        errs.razon_social = 'Ingresa la razón social oficial de la empresa.'
      }
      if (!form.nombre_comercial.trim()) {
        errs.nombre_comercial = 'Ingresa el nombre comercial que verán los candidatos.'
      }
      if (!form.slug.trim()) {
        errs.slug = 'El identificador URL (slug) es obligatorio.'
      } else if (!/^[a-z0-9-]+$/.test(form.slug.trim())) {
        errs.slug = 'El slug solo debe contener letras minúsculas, números y guiones.'
      }

      if (form.nit.trim() && !/^\d{7,12}$/.test(form.nit.trim())) {
        errs.nit = 'El NIT debe contener entre 7 y 12 dígitos numéricos.'
      }

      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errs.email = 'Ingresa un correo electrónico corporativo válido.'
      }

      if (!form.admin_nombre.trim()) {
        errs.admin_nombre = 'El nombre del administrador es obligatorio.'
      }
      if (!form.admin_apellido.trim()) {
        errs.admin_apellido = 'El apellido del administrador es obligatorio.'
      }
      if (!form.admin_email.trim()) {
        errs.admin_email = 'El correo del administrador es obligatorio para iniciar sesión.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_email.trim())) {
        errs.admin_email = 'Ingresa un correo electrónico válido.'
      }

      if (!form.admin_username.trim()) {
        errs.admin_username = 'El nombre de usuario es obligatorio.'
      } else if (form.admin_username.trim().length < 3) {
        errs.admin_username = 'El nombre de usuario debe tener al menos 3 caracteres.'
      }

      if (!form.admin_password) {
        errs.admin_password = 'La contraseña debe tener al menos 8 caracteres.'
      } else if (form.admin_password.length < 8) {
        errs.admin_password = 'La contraseña debe tener al menos 8 caracteres.'
      }

      if (!form.admin_password_confirm) {
        errs.admin_password_confirm = 'Confirma la contraseña ingresada.'
      } else if (form.admin_password !== form.admin_password_confirm) {
        errs.admin_password_confirm = 'Las contraseñas ingresadas no coinciden.'
      }

      return errs
    },
    onSubmit: async (form) => {
      setGeneralError(null)
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

        tokenStorage.set({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          realm: 'tenant',
        })

        await refreshUser()
        navigate('/', { replace: true })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No se pudo completar el registro de la empresa.'
        if (message.toLowerCase().includes('slug') || message.toLowerCase().includes('empresa ya existe')) {
          setFieldError('slug', 'Este slug ya está en uso. Por favor elige otro identificador.')
        } else if (message.toLowerCase().includes('usuario') || message.toLowerCase().includes('username')) {
          setFieldError('admin_username', 'Este nombre de usuario ya está registrado.')
        } else if (message.toLowerCase().includes('correo') || message.toLowerCase().includes('email')) {
          setFieldError('admin_email', 'Este correo ya tiene una cuenta asociada.')
        } else {
          setGeneralError(message)
        }
      }
    },
  })

  function handleNombreComercialChange(val: string) {
    setFieldValue('nombre_comercial', val)
    if (!values.slug || values.slug === values.nombre_comercial.toLowerCase().replace(/[^a-z0-9-]/g, '')) {
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
      setFieldValue('slug', autoSlug)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Alta de Organización"
        title="Registra tu Empresa en SSAS RRHH"
        subtitle="Comienza a gestionar tu equipo, departamentos, vacantes y postulaciones en minutos."
      />


      {generalError && (
        <Alert tone="error" title="Error de registro">
          {generalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="form-stack">
        <FormSection
          title="1. Información de la Empresa"
          description="Identificación oficial y comercial de tu organización en el portal."
        >
          <FormGrid columns={2}>
            <Field
              label="Razón Social"
              required
              error={errors.razon_social}
              hint="Nombre legal inscrito en el registro de comercio"
            >
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="text"
                  placeholder="Ej. Soluciones Digitales S.R.L."
                  value={values.razon_social}
                  onChange={e => setFieldValue('razon_social', e.target.value)}
                  onBlur={() => handleBlur('razon_social')}
                />
              )}
            </Field>

            <Field
              label="Nombre Comercial"
              required
              error={errors.nombre_comercial}
              hint="El nombre público visible para los postulantes"
            >
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="text"
                  placeholder="Ej. SoluDigital"
                  value={values.nombre_comercial}
                  onChange={e => handleNombreComercialChange(e.target.value)}
                  onBlur={() => handleBlur('nombre_comercial')}
                />
              )}
            </Field>

            <Field
              label="Identificador URL (Slug)"
              required
              error={errors.slug}
              hint="Se usará en la dirección del portal: portal/tu-empresa"
            >
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="text"
                  placeholder="ej. soludigital"
                  value={values.slug}
                  onChange={e =>
                    setFieldValue('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }
                  onBlur={() => handleBlur('slug')}
                />
              )}
            </Field>

            <Field label="NIT" optional error={errors.nit} hint="Entre 7 y 12 dígitos numéricos">
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="text"
                  placeholder="Ej. 1020304050"
                  value={values.nit}
                  onChange={e => setFieldValue('nit', e.target.value)}
                  onBlur={() => handleBlur('nit')}
                />
              )}
            </Field>

            <Field
              label="Email de Contacto"
              optional
              error={errors.email}
              hint="Para notificaciones y soporte"
            >
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={values.email}
                  onChange={e => setFieldValue('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                />
              )}
            </Field>

            <Field label="Teléfono Empresarial" optional error={errors.telefono}>
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="tel"
                  placeholder="+591 70000000"
                  value={values.telefono}
                  onChange={e => setFieldValue('telefono', e.target.value)}
                  onBlur={() => handleBlur('telefono')}
                />
              )}
            </Field>

            <Field label="Ciudad" optional error={errors.ciudad}>
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="text"
                  placeholder="Ej. Santa Cruz de la Sierra"
                  value={values.ciudad}
                  onChange={e => setFieldValue('ciudad', e.target.value)}
                  onBlur={() => handleBlur('ciudad')}
                />
              )}
            </Field>

            <Field
              label="Color Primario de Marca"
              optional
              hint="Color de acento en el portal de empleo"
            >
              {fieldProps => (
                <div className="row">
                  <input
                    type="color"
                    aria-label="Selector visual de color"
                    className="color-picker-input"
                    value={values.color_primario}
                    onChange={e => setFieldValue('color_primario', e.target.value)}
                  />
                  <input
                    {...fieldProps}
                    type="text"
                    value={values.color_primario}
                    onChange={e => setFieldValue('color_primario', e.target.value)}
                    placeholder="#176b4b"
                  />
                </div>
              )}
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection
          title="2. Administrador Principal"
          description="Cuenta de acceso inicial con permisos de administración empresarial."
        >
          <FormGrid columns={2}>
            <Field label="Nombre" required error={errors.admin_nombre}>
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="text"
                  placeholder="Ej. Juan"
                  value={values.admin_nombre}
                  onChange={e => setFieldValue('admin_nombre', e.target.value)}
                  onBlur={() => handleBlur('admin_nombre')}
                />
              )}
            </Field>

            <Field label="Apellido" required error={errors.admin_apellido}>
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="text"
                  placeholder="Ej. Pérez"
                  value={values.admin_apellido}
                  onChange={e => setFieldValue('admin_apellido', e.target.value)}
                  onBlur={() => handleBlur('admin_apellido')}
                />
              )}
            </Field>

            <Field
              label="Correo Electrónico (Login)"
              required
              error={errors.admin_email}
              hint="Se usará para iniciar sesión y recuperar acceso"
            >
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="email"
                  placeholder="juan.perez@empresa.com"
                  value={values.admin_email}
                  onChange={e => setFieldValue('admin_email', e.target.value)}
                  onBlur={() => handleBlur('admin_email')}
                />
              )}
            </Field>

            <Field
              label="Nombre de Usuario (Username)"
              required
              error={errors.admin_username}
              hint="Identificador único para login alternativo"
            >
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="text"
                  placeholder="juanperez"
                  value={values.admin_username}
                  onChange={e =>
                    setFieldValue(
                      'admin_username',
                      e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')
                    )
                  }
                  onBlur={() => handleBlur('admin_username')}
                />
              )}
            </Field>

            <Field
              label="Contraseña"
              required
              error={errors.admin_password}
              hint="Mínimo 8 caracteres"
            >
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={values.admin_password}
                  onChange={e => setFieldValue('admin_password', e.target.value)}
                  onBlur={() => handleBlur('admin_password')}
                />
              )}
            </Field>

            <Field
              label="Confirmar Contraseña"
              required
              error={errors.admin_password_confirm}
              hint="Repite la contraseña para confirmar"
            >
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="password"
                  placeholder="Repite la contraseña"
                  value={values.admin_password_confirm}
                  onChange={e => setFieldValue('admin_password_confirm', e.target.value)}
                  onBlur={() => handleBlur('admin_password_confirm')}
                />
              )}
            </Field>

            <Field label="Teléfono de Contacto" optional error={errors.admin_telefono}>
              {fieldProps => (
                <input
                  {...fieldProps}
                  type="tel"
                  placeholder="Ej. +591 71234567"
                  value={values.admin_telefono}
                  onChange={e => setFieldValue('admin_telefono', e.target.value)}
                  onBlur={() => handleBlur('admin_telefono')}
                />
              )}
            </Field>
          </FormGrid>
        </FormSection>

        <FormActions sticky align="end">
          <div className="stack items-center">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={isSubmitting}
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
        </FormActions>
      </form>
    </div>
  )
}
