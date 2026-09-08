import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { useAuth } from '../../auth/hooks/useAuth'
import { perfilApi } from '../api/perfilApi'
import { Alert, Badge, Button, Field, Panel } from '../../../shared/components'
import type { components } from '../../../shared/api/schema'

type Perfil = components['schemas']['UsuarioResponse']

export function MiPerfilPage() {
  const { accessToken, user, refreshUser } = useAuth()
  const { company } = useCompanyScope()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (accessToken === null) return
    setLoading(true)
    setLoadError(null)
    try {
      const resultado = await perfilApi.obtenerMiPerfil(accessToken)
      setPerfil(resultado)
      setNombre(resultado.nombre ?? '')
      setApellido(resultado.apellido ?? '')
      setTelefono(resultado.telefono ?? '')
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'No se pudo cargar tu perfil.')
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function guardar(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setErrorMessage(null)
    try {
      const payload = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() === '' ? null : telefono.trim(),
      }
      const actualizado = await perfilApi.actualizarMiPerfil(accessToken ?? '', payload)
      setPerfil(actualizado)
      setNombre(actualizado.nombre ?? '')
      setApellido(actualizado.apellido ?? '')
      setTelefono(actualizado.telefono ?? '')
      setMessage('Tu perfil se actualizó correctamente.')
      await refreshUser()
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : 'No se pudo guardar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  const nombreEmpresa = company?.nombre_comercial ?? null
  const esPlataforma = user?.realm === 'platform'

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Mi cuenta</p>
        <h1>Mi perfil</h1>
        <p className="page-description">
          Consulta y actualiza tu información personal. Los datos de seguridad se gestionan por
          separado.
        </p>
      </div>

      {message !== null && <Alert tone="success" title="Perfil actualizado">{message}</Alert>}
      {errorMessage !== null && <Alert tone="error" title="No se pudo guardar">{errorMessage}</Alert>}

      {loading ? (
        <p className="page-description">Cargando tu perfil…</p>
      ) : loadError !== null ? (
        <Alert tone="error" title="Error al cargar el perfil">
          {loadError}
          <div style={{ marginTop: '0.75rem' }}>
            <Button variant="secondary" size="sm" onClick={() => void cargar()}>
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : perfil !== null ? (
        <>
          <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', alignItems: 'start' }}>
            <Panel title="Información personal" eyebrow="Datos editables de tu cuenta">
              <form onSubmit={guardar} className="form-stack">
                <Field label="Nombre *">
                  <input
                    className="input"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    minLength={2}
                    required
                  />
                </Field>
                <Field label="Apellido *">
                  <input
                    className="input"
                    value={apellido}
                    onChange={(event) => setApellido(event.target.value)}
                    minLength={1}
                    required
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    className="input"
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                    placeholder="+591 7 1234567"
                  />
                </Field>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <Button variant="primary" type="submit" loading={saving}>
                    Guardar cambios
                  </Button>
                </div>
              </form>
            </Panel>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <Panel title="Cuenta y acceso" eyebrow="Identidad de inicio de sesión">
                <dl className="detail-list">
                  <div><dt>Correo electrónico</dt><dd>{perfil.email}</dd></div>
                  <div><dt>Usuario</dt><dd>{perfil.username}</dd></div>
                  <div>
                    <dt>Empresa</dt>
                    <dd>{esPlataforma ? 'Alcance global (plataforma)' : (nombreEmpresa ?? 'Empresa asociada')}</dd>
                  </div>
                  <div>
                    <dt>Estado</dt>
                    <dd>
                      <Badge tone={perfil.is_active ? 'success' : 'warning'}>
                        {perfil.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>{' '}
                      <Badge tone={perfil.email_verified ? 'success' : 'warning'}>
                        {perfil.email_verified ? 'Correo verificado' : 'Correo sin verificar'}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt>Roles</dt>
                    <dd>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {(perfil.roles ?? []).map((rol) => <Badge key={rol} tone="brand">{rol}</Badge>)}
                      </div>
                    </dd>
                  </div>
                </dl>
              </Panel>

              <Panel title="Seguridad" eyebrow="Contraseña y acceso">
                <p className="page-description" style={{ marginBottom: '0.75rem' }}>
                  Cambia tu contraseña o gestiona el estado de tu cuenta desde la pantalla de
                  seguridad.
                </p>
                <Link to="/cambiar-clave">
                  <Button variant="secondary">
                    Cambiar contraseña
                  </Button>
                </Link>
              </Panel>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}