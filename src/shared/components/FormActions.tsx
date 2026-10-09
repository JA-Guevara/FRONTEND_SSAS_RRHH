import type { ReactNode } from 'react'

export type FormActionsProps = {
  children: ReactNode
  sticky?: boolean
  className?: string
  align?: 'end' | 'start'
}

/**
 * Barra de acciones de formulario (guardar, cancelar, etc.), con soporte para fijado inferior sticky.
 */
export function FormActions({
  children,
  sticky = false,
  className = '',
  align = 'end',
}: FormActionsProps) {
  const classes = [
    'form-actions',
    sticky ? 'form-actions-sticky' : '',
    align === 'start' ? 'form-actions-start' : '',
    className,
  ].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}
