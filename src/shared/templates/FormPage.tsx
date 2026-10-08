import type { FormEvent, ReactNode } from 'react'
import { PageHeader, type PageHeaderProps } from '../components/PageHeader'

export type FormPageProps = {
  header: PageHeaderProps
  progress?: ReactNode
  children: ReactNode
  footerActions?: ReactNode
  onSubmit?: (e: FormEvent) => void
  className?: string
}

/** Plantilla estándar para pantallas de altas, edición y configuración. */
export function FormPage({
  header,
  progress,
  children,
  footerActions,
  onSubmit,
  className = '',
}: FormPageProps) {
  return (
    <div className={`page-stack ${className}`.trim()}>
      <PageHeader {...header} />
      {progress && <div className="form-progress">{progress}</div>}
      <form onSubmit={onSubmit} className="form-stack">
        {children}
        {footerActions && <div className="sticky-actions">{footerActions}</div>}
      </form>
    </div>
  )
}
