import { useState } from 'react'

export function RegisterForm({ onSubmit }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    try {
      await onSubmit({
        name: form.get('name'), email: form.get('email'), password: form.get('password'),
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>Nombre completo<input name="name" autoComplete="name" minLength="2" required /></label>
      <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
      <label>Contraseña<input name="password" type="password" autoComplete="new-password" minLength="8" maxLength="72" required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary" disabled={submitting} type="submit">
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}
