import { useEffect, type ReactNode } from 'react'

export type DrawerProps = {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right'
  title?: ReactNode
  children: ReactNode
  className?: string
}

export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
  className = '',
}: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <div
        className={`drawer drawer-${side} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className="drawer-header">
            <h3>{title}</h3>
            <button
              type="button"
              className="icon-button"
              aria-label="Cerrar panel"
              onClick={onClose}
            >
              ×
            </button>
          </header>
        )}
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  )
}
