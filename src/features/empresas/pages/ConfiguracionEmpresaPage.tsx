import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { empresasApi } from '../api/empresasApi'
import type { components } from '../../../shared/api/schema'
import { Alert, Button, Field, LoadingBlock, PageHeader, Panel } from '../../../shared/components'

type Empresa = components['schemas']['EmpresaResponse']

export function ConfiguracionEmpresaPage() {
  const { user } = useAuth()
  const { company: scopeCompany } = useCompanyScope()
  const activeEmpresaId = user?.empresaId || scopeCompany?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    razon_social: '',
    nombre_comercial: '',
    nit: '',
    slug: '',
    email: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    descripcion: '',
    logo_url: '',
    color_primario: '#176b4b',
    portal_publico_activo: true,
  })

  useEffect(() => {
    if (!activeEmpresaId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setErrorMsg(null)
    empresasApi
      .get(activeEmpresaId)
      .then((data) => {
        setEmpresa(data)
        setForm({
          razon_social: data.razon_social || '',
          nombre_comercial: data.nombre_comercial || '',
          nit: data.nit || '',
          slug: data.slug || '',
          email: data.email || '',
          telefono: data.telefono || '',
          ciudad: data.ciudad || '',
          direccion: data.direccion || '',
          descripcion: data.descripcion || '',
          logo_url: data.logo_url || '',
          color_primario: data.color_primario || '#176b4b',
          portal_publico_activo: data.portal_publico_activo ?? true,
        })
      })
      .catch((err: Error) => setErrorMsg(err.message || 'Error al cargar la información de la empresa'))
      .finally(() => setLoading(false))
  }, [activeEmpresaId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!activeEmpresaId) return
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      const updated = await empresasApi.update(activeEmpresaId, {
        razon_social: form.razon_social.trim(),
        nombre_comercial: form.nombre_comercial.trim(),
        nit: form.nit.trim(),
        slug: form.slug.trim().toLowerCase(),
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
        ciudad: form.ciudad.trim() || null,
        direccion: form.direccion.trim() || null,
        descripcion: form.descripcion.trim() || null,
        logo_url: form.logo_url.trim() || null,
        color_primario: form.color_primario.trim() || '#176b4b',
        portal_publico_activo: form.portal_publico_activo,
      })
      setEmpresa(updated)
      setSuccessMsg('Configuración de la empresa guardada exitosamente.')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem' }}>
        <LoadingBlock message="Cargando configuración de la empresa..." />
      </div>
    )
  }

  if (!activeEmpresaId) {
    return (
      <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem' }}>
        <Alert tone="info" title="Sin empresa seleccionada">
          Debes pertenecer a una empresa o seleccionar una en la barra superior para configurar su perfil.
        </Alert>
      </div>
    )
  }

  const portalUrl = `/empleos/${form.slug || empresa?.slug || ''}`

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <PageHeader
        eyebrow="Configuración institucional"
        title="Perfil y Branding de la Empresa"
        description="Administra la identidad corporativa, datos de contacto y la configuración del portal público de empleo."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {form.portal_publico_activo && form.slug && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                🌐 Ver portal público ↗
              </a>
            )}
            <Button
              variant="primary"
              onClick={(e) => void handleSubmit(e as unknown as FormEvent)}
              loading={saving}
            >
              Guardar cambios
            </Button>
          </div>
        }
      />

      {successMsg && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert tone="success" title="Guardado">
            {successMsg}
          </Alert>
        </div>
      )}

      {errorMsg && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert tone="error" title="Error">
            {errorMsg}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Datos Corporativos */}
        <Panel
          title="1. Información General y Legal"
          eyebrow="Datos de contacto e identificación fiscal"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Field label="Razón social *">
              <input
                className="input"
                value={form.razon_social}
                onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                required
              />
            </Field>

            <Field label="Nombre comercial *">
              <input
                className="input"
                value={form.nombre_comercial}
                onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })}
                required
              />
            </Field>

            <Field label="NIT *">
              <input
                className="input"
                value={form.nit}
                onChange={(e) => setForm({ ...form, nit: e.target.value })}
                required
              />
            </Field>

            <Field label="Slug identificador (URL única) *">
              <input
                className="input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                required
              />
            </Field>

            <Field label="Correo electrónico institucional">
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field label="Teléfono de contacto">
              <input
                className="input"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </Field>

            <Field label="Ciudad">
              <input
                className="input"
                value={form.ciudad}
                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              />
            </Field>

            <Field label="Dirección comercial / Oficina">
              <input
                className="input"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              />
            </Field>
          </div>
        </Panel>

        {/* Branding & Identidad Visual */}
        <Panel
          title="2. Identidad Visual y Marca (Branding)"
          eyebrow="Personalización corporativa"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div>
              <Field label="URL del logotipo (PNG, SVG, JPG)">
                <input
                  type="url"
                  className="input"
                  placeholder="https://ejemplo.com/logo.png"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                />
              </Field>

              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    overflow: 'hidden',
                  }}
                >
                  {form.logo_url ? (
                    <img
                      src={form.logo_url}
                      alt="Logo preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '1.5rem' }}>🏢</span>
                  )}
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Vista previa del logotipo.
                </span>
              </div>
            </div>

            <div>
              <Field label="Color primario de la marca">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={form.color_primario}
                    onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
                    style={{
                      width: 44,
                      height: 40,
                      padding: 2,
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                    }}
                  />
                  <input
                    type="text"
                    className="input"
                    value={form.color_primario}
                    onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
                    placeholder="#176b4b"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </Field>

              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '0.5rem',
                  background: form.color_primario,
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Muestra de Botón Principal ({form.color_primario})
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <Field label="Descripción de la empresa / Acerca de nosotros">
              <textarea
                className="input"
                rows={3}
                placeholder="Breve reseña institucional que verán los postulantes en la página de empleos..."
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </Field>
          </div>
        </Panel>

        {/* Portal Público de Empleo */}
        <Panel
          title="3. Portal Público de Empleos"
          eyebrow="Exposición pública de ofertas laborales"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.portal_publico_activo}
                onChange={(e) => setForm({ ...form, portal_publico_activo: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                Habilitar portal público de empleo para esta empresa
              </span>
            </label>

            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Si desactivas esta opción, los postulantes no podrán ver la lista de vacantes activas ni enviar candidaturas externas.
            </p>

            {form.portal_publico_activo && form.slug && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                    Dirección pública de tu portal de empleo:
                  </div>
                  <code style={{ fontSize: '0.9rem', color: '#0d9488', fontWeight: 600 }}>
                    {window.location.origin}/empleos/{form.slug}
                  </code>
                </div>
                <Link
                  to={`/empleos/${form.slug}`}
                  target="_blank"
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '0.375rem',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                  }}
                >
                  Abrir portal ↗
                </Link>
              </div>
            )}
          </div>
        </Panel>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="primary" type="submit" loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
