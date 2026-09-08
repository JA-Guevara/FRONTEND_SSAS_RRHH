import type { ReactNode } from 'react'

type AlertProps = {
  tone: 'error' | 'success' | 'info'
  children: ReactNode
  title?: string
}

export function Alert({ tone, children, title }: AlertProps) {
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {title !== undefined && <strong>{title}</strong>}
      {children}
    </div>
  )
}
