import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Activity,
  Bell,
  CheckCircle2,
  Laptop,
  Palette,
  Shield,
  Smartphone,
  User as UserIcon,
  XCircle,
} from 'lucide-react'
import { Button } from '../../../shared/components'
import { useAuth } from '../../auth/hooks/useAuth'
import { authApi } from '../../auth/api/authApi'
import { perfilApi } from '../../perfil/api/perfilApi'
import type { ActividadItem, SesionItem } from '../../perfil/api/perfilApi'
import { AvatarUploader } from '../components/AvatarUploader'
import './cuenta.css'

type TabType = 'perfil' | 'seguridad' | 'sesiones' | 'preferencias' | 'notificaciones' | 'actividad'

export function CuentaPage() {
  const { user, accessToken, refreshUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabType) || 'perfil'

  // Perfil state
  const [nombre, setNombre] = useState(user?.name?.split(' ')[0] ?? '')
  const [apellido, setApellido] = useState(user?.name?.split(' ').slice(1).join(' ') ?? '')
  const [telefono, setTelefono] = useState('')
  const [perfilSuccess, setPerfilSuccess] = useState<string | null>(null)
  const [perfilError, setPerfilError] = useState<string | null>(null)
  const [savingPerfil, setSavingPerfil] = useState(false)

  // Seguridad state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  // Sesiones state
  const [sesiones, setSesiones] = useState<SesionItem[]>([])
  const [loadingSesiones, setLoadingSesiones] = useState(false)
  const [sesionesMsg, setSesionesMsg] = useState<string | null>(null)

  // Preferencias state (guardadas en localStorage)
  const [themePref, setThemePref] = useState<'system' | 'light' | 'dark'>(() => {
    return (localStorage.getItem('ssas_theme_pref') as 'system' | 'light' | 'dark') || 'system'
  })
  const [densityPref, setDensityPref] = useState<'normal' | 'compact'>(() => {
    return (localStorage.getItem('ssas_density_pref') as 'normal' | 'compact') || 'normal'
  })
  const [homePagePref, setHomePagePref] = useState<string>(() => {
    return localStorage.getItem('ssas_home_pref') || '/inicio'
  })

  // Notificaciones state
  const [notifPostulaciones, setNotifPostulaciones] = useState(true)
  const [notifEntrevistas, setNotifEntrevistas] = useState(true)
  const [notifEvaluaciones, setNotifEvaluaciones] = useState(true)
  const [notifSeguridad, setNotifSeguridad] = useState(true)

  // Actividad state
  const [actividades, setActividades] = useState<ActividadItem[]>([])
  const [loadingActividad, setLoadingActividad] = useState(false)

  // Cargar datos del perfil
  useEffect(() => {
    if (!accessToken) return
    void perfilApi
      .obtenerMiPerfil(accessToken)
      .then((data) => {
        setNombre(data.nombre ?? '')
        setApellido(data.apellido ?? '')
        setTelefono(data.telefono ?? '')
      })
      .catch(() => {
        // En caso de fallo se preservan los valores de sesión
      })
  }, [accessToken])

  // Cargar sesiones cuando la pestaña está activa
  useEffect(() => {
    if (activeTab === 'sesiones' && accessToken) {
      setLoadingSesiones(true)
      void perfilApi
        .obtenerSesiones(accessToken)
        .then((items) => setSesiones(items))
        .catch(() => setSesiones([]))
        .finally(() => setLoadingSesiones(false))
    }
  }, [activeTab, accessToken])

  // Cargar actividad cuando la pestaña está activa
  useEffect(() => {
    if (activeTab === 'actividad' && accessToken) {
      setLoadingActividad(true)
      void perfilApi
        .obtenerActividad(accessToken)
        .then((items) => setActividades(items))
        .catch(() => setActividades([]))
        .finally(() => setLoadingActividad(false))
    }
  }, [activeTab, accessToken])

  function setTab(tab: TabType) {
    setSearchParams({ tab })
  }

  // Guardar perfil
  async function handleGuardarPerfil(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setPerfilSuccess(null)
    setPerfilError(null)
    setSavingPerfil(true)
    try {
      await perfilApi.actualizarMiPerfil(accessToken, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
      })
      setPerfilSuccess('Perfil actualizado correctamente.')
      await refreshUser()
    } catch (err) {
      setPerfilError(err instanceof Error ? err.message : 'Error al guardar el perfil.')
    } finally {
      setSavingPerfil(false)
    }
  }

  // Subir / eliminar foto
  async function handleUploadFoto(file: File) {
    if (!accessToken) return
    await perfilApi.subirFoto(accessToken, file)
    await refreshUser()
  }

  async function handleDeleteFoto() {
    if (!accessToken) return
    await perfilApi.eliminarFoto(accessToken)
    await refreshUser()
  }

  // Cambiar contraseña
  async function handleCambiarPassword(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setPasswordSuccess(null)
    setPasswordError(null)

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }

    setChangingPassword(true)
    try {
      const res = await authApi.changePassword(user.realm, currentPassword, newPassword)
      setPasswordSuccess(res.message || 'Contraseña actualizada correctamente.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      await refreshUser()
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.')
    } finally {
      setChangingPassword(false)
    }
  }

  // Cerrar sesión
  async function handleCerrarSesion(id: string) {
    if (!accessToken) return
    setSesionesMsg(null)
    try {
      await perfilApi.cerrarSesion(accessToken, id)
      setSesiones((prev) => prev.filter((s) => s.id !== id))
      setSesionesMsg('Sesión cerrada con éxito.')
    } catch (err) {
      setSesionesMsg(err instanceof Error ? err.message : 'Error al cerrar sesión.')
    }
  }

  async function handleCerrarTodasSesiones() {
    if (!accessToken) return
    setSesionesMsg(null)
    try {
      await perfilApi.cerrarTodasSesiones(accessToken)
      setSesiones((prev) => prev.filter((s) => s.es_actual))
      setSesionesMsg('Todas las demás sesiones fueron cerradas.')
    } catch (err) {
      setSesionesMsg(err instanceof Error ? err.message : 'Error al cerrar sesiones.')
    }
  }

  // Guardar preferencias
  function handleSavePreferences() {
    localStorage.setItem('ssas_theme_pref', themePref)
    localStorage.setItem('ssas_density_pref', densityPref)
    localStorage.setItem('ssas_home_pref', homePagePref)
    document.documentElement.dataset.density = densityPref
  }

  // Evaluación de fortaleza de contraseña
  const hasMinLength = newPassword.length >= 12
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasLower = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length

  return (
    <div className="page-stack">
      <div>
        <p className="eyebrow">Ajustes personales</p>
        <h1>Mi Cuenta</h1>
        <p className="page-description">
          Administrá tu perfil, credenciales de seguridad, sesiones activas y preferencias.
        </p>
      </div>

      <div className="cuenta-layout">
        {/* Pestañas verticales */}
        <nav className="cuenta-tabs" aria-label="Secciones de cuenta">
          <button
            type="button"
            className={`cuenta-tab-button ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setTab('perfil')}
          >
            <UserIcon size={18} />
            <span>Perfil</span>
          </button>
          <button
            type="button"
            className={`cuenta-tab-button ${activeTab === 'seguridad' ? 'active' : ''}`}
            onClick={() => setTab('seguridad')}
          >
            <Shield size={18} />
            <span>Seguridad</span>
          </button>
          <button
            type="button"
            className={`cuenta-tab-button ${activeTab === 'sesiones' ? 'active' : ''}`}
            onClick={() => setTab('sesiones')}
          >
            <Laptop size={18} />
            <span>Sesiones</span>
          </button>
          <button
            type="button"
            className={`cuenta-tab-button ${activeTab === 'preferencias' ? 'active' : ''}`}
            onClick={() => setTab('preferencias')}
          >
            <Palette size={18} />
            <span>Preferencias</span>
          </button>
          <button
            type="button"
            className={`cuenta-tab-button ${activeTab === 'notificaciones' ? 'active' : ''}`}
            onClick={() => setTab('notificaciones')}
          >
            <Bell size={18} />
            <span>Notificaciones</span>
          </button>
          <button
            type="button"
            className={`cuenta-tab-button ${activeTab === 'actividad' ? 'active' : ''}`}
            onClick={() => setTab('actividad')}
          >
            <Activity size={18} />
            <span>Mi actividad</span>
          </button>
        </nav>

        {/* Contenido de la pestaña */}
        <div className="cuenta-content">
          {/* 1. PERFIL */}
          {activeTab === 'perfil' && (
            <section aria-labelledby="tab-perfil-title">
              <div className="cuenta-section-header">
                <h2 id="tab-perfil-title" className="cuenta-section-title">
                  Información personal
                </h2>
                <p className="cuenta-section-desc">
                  Tu foto y datos de contacto visibles para el equipo.
                </p>
              </div>

              <div className="cuenta-avatar-wrap">
                <AvatarUploader
                  fotoUrl={user?.foto_url}
                  nombre={user?.name}
                  id={user?.id}
                  onUpload={handleUploadFoto}
                  onDelete={handleDeleteFoto}
                />
              </div>

              <form onSubmit={handleGuardarPerfil}>
                <div className="cuenta-form-grid">
                  <div className="cuenta-field">
                    <label htmlFor="perfil-nombre">Nombre</label>
                    <input
                      id="perfil-nombre"
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="cuenta-field">
                    <label htmlFor="perfil-apellido">Apellido</label>
                    <input
                      id="perfil-apellido"
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                    />
                  </div>

                  <div className="cuenta-field">
                    <label htmlFor="perfil-email">Correo corporativo</label>
                    <input
                      id="perfil-email"
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      aria-describedby="perfil-email-hint"
                    />
                    <small id="perfil-email-hint" className="avatar-uploader-hint">
                      El correo se administra por un administrador.
                    </small>
                  </div>

                  <div className="cuenta-field">
                    <label htmlFor="perfil-username">Nombre de usuario</label>
                    <input
                      id="perfil-username"
                      type="text"
                      value={user?.username ?? ''}
                      disabled
                    />
                  </div>

                  <div className="cuenta-field">
                    <label htmlFor="perfil-telefono">Teléfono</label>
                    <input
                      id="perfil-telefono"
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+591 70000000"
                    />
                  </div>

                  <div className="cuenta-field">
                    <label htmlFor="perfil-zona">Zona horaria</label>
                    <select id="perfil-zona" defaultValue="America/La_Paz">
                      <option value="America/La_Paz">America/La_Paz (GMT-4)</option>
                      <option value="America/Santiago">America/Santiago (GMT-3)</option>
                      <option value="America/Buenos_Aires">America/Buenos_Aires (GMT-3)</option>
                      <option value="America/Lima">America/Lima (GMT-5)</option>
                      <option value="America/Bogota">America/Bogota (GMT-5)</option>
                    </select>
                  </div>
                </div>

                {perfilSuccess && (
                  <div className="notice cuenta-status-msg" role="status">
                    {perfilSuccess}
                  </div>
                )}
                {perfilError && (
                  <div className="avatar-uploader-error cuenta-status-msg" role="alert">
                    {perfilError}
                  </div>
                )}

                <Button variant="primary" type="submit" disabled={savingPerfil}>
                  {savingPerfil ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </form>
            </section>
          )}

          {/* 2. SEGURIDAD */}
          {activeTab === 'seguridad' && (
            <section aria-labelledby="tab-seguridad-title">
              <div className="cuenta-section-header">
                <h2 id="tab-seguridad-title" className="cuenta-section-title">
                  Seguridad y contraseña
                </h2>
                <p className="cuenta-section-desc">
                  Actualizá la clave de acceso de tu cuenta.
                </p>
              </div>

              <form onSubmit={handleCambiarPassword}>
                <div className="cuenta-security-form">
                  <div className="cuenta-field">
                    <label htmlFor="pwd-actual">Contraseña actual</label>
                    <input
                      id="pwd-actual"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="cuenta-field">
                    <label htmlFor="pwd-nueva">Nueva contraseña</label>
                    <input
                      id="pwd-nueva"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={12}
                      maxLength={72}
                      required
                    />
                    {newPassword.length > 0 && (
                      <div className="cuenta-strength-meter">
                        <div className="cuenta-strength-bars">
                          <span className={`cuenta-strength-bar ${strengthScore >= 1 ? (strengthScore <= 2 ? 'weak' : strengthScore <= 4 ? 'medium' : 'strong') : ''}`} />
                          <span className={`cuenta-strength-bar ${strengthScore >= 3 ? (strengthScore <= 4 ? 'medium' : 'strong') : ''}`} />
                          <span className={`cuenta-strength-bar ${strengthScore >= 5 ? 'strong' : ''}`} />
                        </div>
                      </div>
                    )}

                    <ul className="cuenta-policy-list">
                      <li className={`cuenta-policy-item ${hasMinLength ? 'met' : ''}`}>
                        {hasMinLength ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        Al menos 12 caracteres
                      </li>
                      <li className={`cuenta-policy-item ${hasUpper && hasLower ? 'met' : ''}`}>
                        {hasUpper && hasLower ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        Mayúsculas y minúsculas
                      </li>
                      <li className={`cuenta-policy-item ${hasNumber ? 'met' : ''}`}>
                        {hasNumber ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        Al menos un número
                      </li>
                      <li className={`cuenta-policy-item ${hasSpecial ? 'met' : ''}`}>
                        {hasSpecial ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        Al menos un símbolo especial
                      </li>
                    </ul>
                  </div>

                  <div className="cuenta-field">
                    <label htmlFor="pwd-confirm">Confirmar contraseña</label>
                    <input
                      id="pwd-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={12}
                      maxLength={72}
                      required
                    />
                  </div>

                  {passwordSuccess && (
                    <div className="notice" role="status">
                      {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="avatar-uploader-error" role="alert">
                      {passwordError}
                    </div>
                  )}

                  <Button variant="primary" type="submit" disabled={changingPassword}>
                    {changingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                  </Button>
                </div>
              </form>
            </section>
          )}

          {/* 3. SESIONES */}
          {activeTab === 'sesiones' && (
            <section aria-labelledby="tab-sesiones-title">
              <div className="cuenta-section-header cuenta-header-row">
                <div>
                  <h2 id="tab-sesiones-title" className="cuenta-section-title">
                    Sesiones activas
                  </h2>
                  <p className="cuenta-section-desc">
                    Dispositivos conectados con acceso a tu cuenta.
                  </p>
                </div>
                {sesiones.length > 1 && (
                  <Button variant="secondary" size="sm" onClick={handleCerrarTodasSesiones}>
                    Cerrar otras sesiones
                  </Button>
                )}
              </div>

              {sesionesMsg && (
                <div className="notice cuenta-status-msg">
                  {sesionesMsg}
                </div>
              )}

              {loadingSesiones ? (
                <p>Cargando sesiones...</p>
              ) : (
                <div className="cuenta-sesiones-list">
                  {sesiones.map((sesion) => (
                    <div key={sesion.id} className="cuenta-sesion-card">
                      <div className="cuenta-sesion-info">
                        {sesion.dispositivo.toLowerCase().includes('mobile') ? (
                          <Smartphone size={24} />
                        ) : (
                          <Laptop size={24} />
                        )}
                        <div className="cuenta-sesion-details">
                          <div className="cuenta-sesion-device">
                            <span>{sesion.dispositivo}</span>
                            {sesion.es_actual && (
                              <span className="cuenta-badge-current">Esta sesión</span>
                            )}
                          </div>
                          <span className="cuenta-sesion-meta">
                            IP: {sesion.ip} · Iniciada:{' '}
                            {new Date(sesion.inicio).toLocaleDateString('es-BO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {!sesion.es_actual && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleCerrarSesion(sesion.id)}
                        >
                          Cerrar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 4. PREFERENCIAS */}
          {activeTab === 'preferencias' && (
            <section aria-labelledby="tab-pref-title">
              <div className="cuenta-section-header">
                <h2 id="tab-pref-title" className="cuenta-section-title">
                  Preferencias del sistema
                </h2>
                <p className="cuenta-section-desc">
                  Personalizá el aspecto y comportamiento de la interfaz.
                </p>
              </div>

              <div className="cuenta-pref-form">
                <div className="cuenta-field">
                  <label htmlFor="pref-theme">Tema de color</label>
                  <select
                    id="pref-theme"
                    value={themePref}
                    onChange={(e) => setThemePref(e.target.value as 'system' | 'light' | 'dark')}
                  >
                    <option value="system">Automático (según el sistema)</option>
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </div>

                <div className="cuenta-field">
                  <label htmlFor="pref-density">Densidad visual</label>
                  <select
                    id="pref-density"
                    value={densityPref}
                    onChange={(e) => setDensityPref(e.target.value as 'normal' | 'compact')}
                  >
                    <option value="normal">Cómoda (espaciado estándar)</option>
                    <option value="compact">Compacta (mayor densidad de datos)</option>
                  </select>
                </div>

                <div className="cuenta-field">
                  <label htmlFor="pref-home">Página de inicio preferida</label>
                  <select
                    id="pref-home"
                    value={homePagePref}
                    onChange={(e) => setHomePagePref(e.target.value)}
                  >
                    <option value="/inicio">Inicio (Dashboard)</option>
                    <option value="/vacantes">Vacantes</option>
                    <option value="/seleccion">Selección</option>
                    <option value="/reportes">Reportes</option>
                  </select>
                </div>

                <Button variant="primary" onClick={handleSavePreferences}>
                  Guardar preferencias
                </Button>
              </div>
            </section>
          )}

          {/* 5. NOTIFICACIONES */}
          {activeTab === 'notificaciones' && (
            <section aria-labelledby="tab-notif-title">
              <div className="cuenta-section-header">
                <h2 id="tab-notif-title" className="cuenta-section-title">
                  Canales de notificación
                </h2>
                <p className="cuenta-section-desc">
                  Seleccioná qué eventos deben notificarte por correo y en la app.
                </p>
              </div>

              <div>
                <div className="cuenta-toggle-row">
                  <div className="cuenta-toggle-info">
                    <span className="cuenta-toggle-title">Nuevas postulaciones</span>
                    <span className="cuenta-toggle-desc">
                      Avisar cuando un candidato se postule a vacantes activas.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPostulaciones}
                    onChange={(e) => setNotifPostulaciones(e.target.checked)}
                    aria-label="Notificar nuevas postulaciones"
                  />
                </div>

                <div className="cuenta-toggle-row">
                  <div className="cuenta-toggle-info">
                    <span className="cuenta-toggle-title">Entrevistas programadas</span>
                    <span className="cuenta-toggle-desc">
                      Recordatorios de entrevistas agendadas con candidatos.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEntrevistas}
                    onChange={(e) => setNotifEntrevistas(e.target.checked)}
                    aria-label="Notificar entrevistas programadas"
                  />
                </div>

                <div className="cuenta-toggle-row">
                  <div className="cuenta-toggle-info">
                    <span className="cuenta-toggle-title">Evaluaciones completadas</span>
                    <span className="cuenta-toggle-desc">
                      Avisar cuando un evaluador califique a un candidato.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEvaluaciones}
                    onChange={(e) => setNotifEvaluaciones(e.target.checked)}
                    aria-label="Notificar evaluaciones completadas"
                  />
                </div>

                <div className="cuenta-toggle-row">
                  <div className="cuenta-toggle-info">
                    <span className="cuenta-toggle-title">Alertas de seguridad</span>
                    <span className="cuenta-toggle-desc">
                      Nuevos inicios de sesión y cambios de contraseña.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSeguridad}
                    onChange={(e) => setNotifSeguridad(e.target.checked)}
                    aria-label="Notificar alertas de seguridad"
                  />
                </div>
              </div>
            </section>
          )}

          {/* 6. MI ACTIVIDAD */}
          {activeTab === 'actividad' && (
            <section aria-labelledby="tab-actividad-title">
              <div className="cuenta-section-header">
                <h2 id="tab-actividad-title" className="cuenta-section-title">
                  Mi actividad reciente
                </h2>
                <p className="cuenta-section-desc">
                  Las últimas 50 operaciones realizadas por tu cuenta en la plataforma.
                </p>
              </div>

              {loadingActividad ? (
                <p>Cargando actividad...</p>
              ) : actividades.length === 0 ? (
                <p className="text-muted">No se registran acciones recientes.</p>
              ) : (
                <div className="cuenta-actividad-timeline">
                  {actividades.map((act) => (
                    <div key={act.id} className="cuenta-actividad-item">
                      <span className="cuenta-actividad-dot" />
                      <div className="cuenta-actividad-body">
                        <span className="cuenta-actividad-desc">{act.descripcion}</span>
                        <div className="cuenta-actividad-meta">
                          <span>Módulo: {act.modulo}</span>
                          <span>Acción: {act.accion}</span>
                          {act.ip_origen && <span>IP: {act.ip_origen}</span>}
                          <span>
                            {new Date(act.fecha).toLocaleDateString('es-BO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
