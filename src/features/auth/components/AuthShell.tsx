import type { ReactNode } from 'react'

type AuthShellProps = { children: ReactNode; description: string; title: string }

export function AuthShell({ children, description, title }: AuthShellProps) {
  return (
    <main className="auth-page">
      <section className="auth-brand" aria-label="SSAH Recursos Humanos">
        <div className="brand-mark" aria-hidden="true">S</div>
        <div>
          <p className="eyebrow">SSAH</p>
          <h1>Personas que hacen avanzar organizaciones.</h1>
          <p>Gestión de recursos humanos clara, segura y preparada para crecer.</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Acceso seguro</p>
          <h2>{title}</h2>
          <p className="auth-description">{description}</p>
          {children}
        </div>
      </section>
    </main>
  )
}
