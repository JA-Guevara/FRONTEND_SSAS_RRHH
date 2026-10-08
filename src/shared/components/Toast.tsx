import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type ToastTone = 'success' | 'error' | 'warning' | 'info'

export type ToastMessage = {
  id: string
  message: ReactNode
  tone: ToastTone
}

type ToastContextType = {
  showToast: (message: ReactNode, tone?: ToastTone) => void
  removeToast: (id: string) => void
  toast: {
    success: (message: ReactNode) => void
    error: (message: ReactNode) => void
    warning: (message: ReactNode) => void
    info: (message: ReactNode) => void
  }
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: ReactNode, tone: ToastTone = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, message, tone }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const toast = {
    success: (msg: ReactNode) => showToast(msg, 'success'),
    error: (msg: ReactNode) => showToast(msg, 'error'),
    warning: (msg: ReactNode) => showToast(msg, 'warning'),
    info: (msg: ReactNode) => showToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toast }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notificaciones">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`} role="status">
            <span>{t.message}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Cerrar notificación"
              onClick={() => removeToast(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      showToast: (msg: ReactNode) => console.log('Toast:', msg),
      removeToast: () => {},
      toast: {
        success: (msg: ReactNode) => console.log('Toast success:', msg),
        error: (msg: ReactNode) => console.error('Toast error:', msg),
        warning: (msg: ReactNode) => console.warn('Toast warning:', msg),
        info: (msg: ReactNode) => console.info('Toast info:', msg),
      },
    }
  }
  return context
}
