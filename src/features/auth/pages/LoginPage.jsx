import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell.jsx'
import { LoginForm } from '../components/LoginForm.jsx'
import { useAuth } from '../hooks/useAuth.js'

export function LoginPage() {
  const { login } = useAuth()
  return (
    <AuthShell title="Bienvenido de nuevo" description="Ingresá con las credenciales de tu organización.">
      <LoginForm onSubmit={login} />
      <p className="auth-link">¿Todavía no tenés una cuenta? <Link to="/registro">Crear cuenta</Link></p>
    </AuthShell>
  )
}
