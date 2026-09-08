import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

type ConfirmDialogProps = {
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

/** Sustituye a `window.confirm`: misma confirmación en toda la aplicación. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div>{message}</div>
      {error != null && <p className="form-error">{error}</p>}
    </Modal>
  )
}
