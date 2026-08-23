import { useAuth } from '../../features/auth/hooks/useAuth.tsx'

export function DashboardPage() {
  const { user } = useAuth()
  return (
    <section className="page-stack" aria-labelledby="dashboard-title">
      <div>
        <p className="eyebrow">Panel principal</p>
        <h1 id="dashboard-title">Hola, {user?.name}</h1>
        <p className="page-description">La base está preparada para incorporar módulos por historias de usuario.</p>
      </div>
      <div className="card-grid">
        <article className="card"><span className="card-number">01</span><h2>Autenticación</h2><p>Inicio, renovación y cierre de sesión conectados al backend.</p></article>
        <article className="card"><span className="card-number">02</span><h2>Bitácora</h2><p>Preparada para crecer cuando esté disponible su contrato HTTP.</p></article>
        <article className="card card-muted"><span className="card-number">03</span><h2>Siguiente módulo</h2><p>Se añade cuando ingrese su primera historia al sprint.</p></article>
      </div>
    </section>
  )
}
