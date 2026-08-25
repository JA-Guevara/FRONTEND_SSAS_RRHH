import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { LoginForm } from '../components/LoginForm'
import type { AuthRealm } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const [realm, setRealm] = useState<AuthRealm>('tenant')
  return (
    <AuthShell title="Bienvenido" description="Seleccioná tu tipo de acceso e ingresá tus credenciales.">
      <LoginForm realm={realm} onRealmChange={setRealm} onSubmit={login} />
      {realm === 'tenant' ? (
        <p className="auth-link"><Link to="/recuperar-clave">¿Olvidaste tu contraseña?</Link></p>
      ) : (
        <p className="auth-link">La recuperación de plataforma debe gestionarla un administrador autorizado.</p>
      )}
    </AuthShell>
  )
}
