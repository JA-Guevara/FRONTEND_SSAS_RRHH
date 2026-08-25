import { useState } from 'react'
import type { FormEvent } from 'react'

type RegisterFormProps = { onSubmit: (data: { name: string; email: string; password: string }) => Promise<void> }

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    try {
      await onSubmit({
        name: String(form.get('name') ?? ''), email: String(form.get('email') ?? ''), password: String(form.get('password') ?? ''),
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo crear la cuenta')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>Nombre completo<input name="name" autoComplete="name" minLength={2} required /></label>
      <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
      <label>Contraseña<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary" disabled={submitting} type="submit">
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}
