import { useAuth } from '../../features/auth/hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const isPlatform = user?.realm === 'platform'
  return (
    <section className="page-stack" aria-labelledby="dashboard-title">
      <div>
        <p className="eyebrow">Panel principal</p>
        <h1 id="dashboard-title">Hola, {user?.name}</h1>
        <p className="page-description">
          {isPlatform
            ? 'Administra empresas desde los servicios globales de la plataforma.'
            : 'Administra usuarios, roles y eventos de auditoría de tu empresa.'}
        </p>
      </div>
      <div className="card-grid">
        <article className="card"><span className="card-number">01</span><h2>Sesión segura</h2><p>Inicio, renovación, cambio de contraseña y cierre de sesión conectados a la API.</p></article>
        {isPlatform ? (
          <article className="card"><span className="card-number">02</span><h2>Empresas</h2><p>Consulta y aprovisiona empresas con su administrador inicial.</p></article>
        ) : (
          <>
            <article className="card"><span className="card-number">02</span><h2>Seguridad</h2><p>Gestiona usuarios y roles de la empresa actual.</p></article>
            <article className="card"><span className="card-number">03</span><h2>Auditoría</h2><p>Consulta y filtra los eventos reales registrados por el backend.</p></article>
          </>
        )}
      </div>
    </section>
  )
}
