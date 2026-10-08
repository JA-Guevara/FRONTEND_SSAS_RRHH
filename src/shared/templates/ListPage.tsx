import type { ReactNode } from 'react'
import { PageHeader, type PageHeaderProps } from '../components/PageHeader'

export type ListPageProps = {
  header: PageHeaderProps
  stats?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  detail?: ReactNode
  className?: string
}

/** Plantilla estándar para pantallas de listado (Vacantes, Postulantes, Usuarios, Empleados, Bitácora). */
export function ListPage({
  header,
  stats,
  toolbar,
  children,
  detail,
  className = '',
}: ListPageProps) {
  return (
    <div className={`page-stack ${className}`.trim()}>
      <PageHeader {...header} />
      {stats && <div className="card-grid">{stats}</div>}
      {toolbar}
      <div className="list-content">{children}</div>
      {detail}
    </div>
  )
}
