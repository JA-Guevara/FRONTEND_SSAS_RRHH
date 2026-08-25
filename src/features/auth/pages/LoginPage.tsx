import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  return (
    <AuthShell title="Bienvenido" description="Seleccioná tu tipo de acceso e ingresá tus credenciales.">
      <LoginForm onSubmit={login} />
      <p className="auth-link"><Link to="/recuperar-clave">¿Olvidaste tu contraseña?</Link></p>
    </AuthShell>
  )
}
