import type { ReactNode } from 'react'

export type FormGridProps = {
  children: ReactNode
  columns?: 1 | 2
  className?: string
}

/**
 * Rejilla de campos de formulario que colapsa responsive y distribuye de 1 o 2 columnas.
 */
export function FormGrid({
  children,
  columns = 2,
  className = '',
}: FormGridProps) {
  const classes = [
    columns === 2 ? 'form-grid-2' : 'form-grid',
    className,
  ].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}
