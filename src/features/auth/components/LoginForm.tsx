import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AuthRealm, LoginCredentials } from '../context/AuthContext'

type Props = {
  onRealmChange: (realm: AuthRealm) => void
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  realm: AuthRealm
}

export function LoginForm({ onRealmChange, onSubmit, realm }: Props) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    try {
      await onSubmit({
        realm,
        empresaSlug: realm === 'tenant' ? String(form.get('empresaSlug') ?? '') : undefined,
        login: String(form.get('login') ?? ''),
        password: String(form.get('password') ?? ''),
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <div className="realm-selector" role="group" aria-label="Tipo de acceso">
        <button className={realm === 'tenant' ? 'selected' : ''} onClick={() => onRealmChange('tenant')} type="button">Empresa</button>
        <button className={realm === 'platform' ? 'selected' : ''} onClick={() => onRealmChange('platform')} type="button">Plataforma</button>
      </div>
      {realm === 'tenant' && (
        <label>Código de empresa<input name="empresaSlug" placeholder="mi-empresa" pattern="[a-zA-Z0-9-]+" minLength={2} required /></label>
      )}
      <label>{realm === 'platform' ? 'Usuario o correo' : 'Correo o usuario'}<input name="login" autoComplete="username" required /></label>
      <label>Contraseña<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary" disabled={submitting} type="submit">
        {submitting ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}
