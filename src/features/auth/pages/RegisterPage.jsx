import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell.jsx'
import { RegisterForm } from '../components/RegisterForm.jsx'
import { useAuth } from '../hooks/useAuth.js'

export function RegisterPage() {
  const { register } = useAuth()
  const [registered, setRegistered] = useState(false)

  async function handleRegister(data) {
    await register(data)
    setRegistered(true)
  }

  return (
    <AuthShell title="Crear una cuenta" description="Registrá el primer acceso para comenzar a trabajar.">
      {registered ? (
        <div className="success-message" role="status">
          <h3>Cuenta creada</h3><p>Ya podés ingresar con tus nuevas credenciales.</p>
          <Link className="button button-primary" to="/login">Ir al ingreso</Link>
        </div>
      ) : <RegisterForm onSubmit={handleRegister} />}
      <p className="auth-link">¿Ya tenés una cuenta? <Link to="/login">Ingresar</Link></p>
    </AuthShell>
  )
}
