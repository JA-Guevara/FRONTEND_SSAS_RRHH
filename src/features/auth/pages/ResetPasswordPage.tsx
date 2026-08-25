import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { AuthShell } from '../components/AuthShell'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const token = params.get('token') ?? String(form.get('token') ?? '')
    try {
      const result = await authApi.resetPassword(token, String(form.get('password')))
      setMessage(result.message)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cambiar la contraseña')
    }
  }

  return (
    <AuthShell title="Nueva contraseña" description="La nueva contraseña debe tener al menos 12 caracteres.">
      <form className="form-stack" onSubmit={submit}>
        {!params.get('token') && <label>Token de recuperación<input name="token" required /></label>}
        <label>Nueva contraseña<input name="password" type="password" minLength={12} maxLength={72} required /></label>
        {message && <p className="success-message" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Guardar contraseña</button>
      </form>
      <p className="auth-link"><Link to="/login">Volver al ingreso</Link></p>
    </AuthShell>
  )
}
