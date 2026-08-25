import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { AuthShell } from '../components/AuthShell'

export function ForgotPasswordPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await authApi.forgotPassword(String(form.get('email')), String(form.get('empresaSlug')))
      setMessage(result.message)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo enviar la solicitud')
    }
  }

  return (
    <AuthShell title="Recuperar contraseña" description="Te enviaremos las instrucciones asociadas a tu empresa.">
      <form className="form-stack" onSubmit={submit}>
        <label>Identificador de empresa<input name="empresaSlug" pattern="[a-zA-Z0-9-]+" required /></label>
        <label>Correo electrónico<input name="email" type="email" required /></label>
        {message && <p className="success-message" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Solicitar recuperación</button>
      </form>
      <p className="auth-link"><Link to="/login">Volver al ingreso</Link></p>
    </AuthShell>
  )
}
