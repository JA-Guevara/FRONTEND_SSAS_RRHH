import type { ReactNode } from 'react'

export type ToolbarProps = {
  children: ReactNode
  dense?: boolean
  className?: string
}

export function Toolbar({ children, dense = false, className = '' }: ToolbarProps) {
  const denseClass = dense ? 'toolbar-dense' : ''
  return (
    <section aria-label="Controles de búsqueda y filtros" className={`toolbar ${denseClass} ${className}`.trim()}>
      {children}
    </section>
  )
}
