import { useState, type FormEvent } from 'react'
import { authApi } from '../api/authApi'
import { useAuth } from '../hooks/useAuth'

export function ChangePasswordPage() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const next = String(form.get('new_password'))
    if (next !== String(form.get('confirmation'))) { setMessage('Las contraseñas no coinciden.'); return }
    try {
      const result = await authApi.changePassword(user?.realm ?? 'tenant', String(form.get('current_password')), next)
      setMessage(result.message)
      event.currentTarget.reset()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña') }
  }

  return <section className="page-stack"><div><p className="eyebrow">Seguridad</p><h1>Cambiar contraseña</h1><p className="page-description">Actualizá la contraseña de tu sesión actual.</p></div><form className="user-form" onSubmit={submit}><label>Contraseña actual<input name="current_password" type="password" required /></label><label>Nueva contraseña<input name="new_password" type="password" minLength={12} maxLength={72} required /></label><label>Confirmar contraseña<input name="confirmation" type="password" minLength={12} maxLength={72} required /></label>{message && <p className="notice">{message}</p>}<button className="button button-primary" type="submit">Guardar contraseña</button></form></section>
}
