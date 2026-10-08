import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { Trash2, UploadCloud } from 'lucide-react'
import { Avatar } from '../../../shared/components/avatar/Avatar'
import { Button } from '../../../shared/components'
import './avatarUploader.css'

export type AvatarUploaderProps = {
  fotoUrl?: string | null
  nombre?: string | null
  id?: string | null
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
  disabled?: boolean
}

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB

export function AvatarUploader({
  fotoUrl,
  nombre,
  id,
  onUpload,
  onDelete,
  disabled = false,
}: AvatarUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setErrorMessage(null)
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Formato no soportado. Debe ser un archivo JPEG, PNG o WebP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setErrorMessage('El archivo excede el tamaño máximo permitido de 2 MB.')
      return
    }

    try {
      setIsProcessing(true)
      await onUpload(file)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al subir la imagen.')
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      void handleFile(file)
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!disabled && !isProcessing) {
      setIsDragOver(true)
    }
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled || isProcessing) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      void handleFile(file)
    }
  }

  async function handleDelete() {
    setErrorMessage(null)
    try {
      setIsProcessing(true)
      await onDelete()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al eliminar la foto.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={`avatar-uploader ${isDragOver ? 'avatar-uploader-dragover' : ''}`.trim()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="avatar-uploader-main">
        <Avatar src={fotoUrl} name={nombre} id={id} size="xl" />

        <div className="avatar-uploader-actions">
          <div className="avatar-uploader-buttons">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="avatar-uploader-file-input"
              onChange={handleInputChange}
              disabled={disabled || isProcessing}
            />

            <Button
              variant="secondary"
              size="sm"
              disabled={disabled || isProcessing}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={16} aria-hidden="true" />
              {isProcessing ? 'Procesando...' : fotoUrl ? 'Cambiar foto' : 'Subir foto'}
            </Button>

            {Boolean(fotoUrl) && (
              <Button
                variant="danger"
                size="sm"
                disabled={disabled || isProcessing}
                onClick={() => void handleDelete()}
              >
                <Trash2 size={16} aria-hidden="true" />
                Eliminar
              </Button>
            )}
          </div>

          <span className="avatar-uploader-hint">
            Arrastra una imagen aquí o haz clic en Subir. Formatos: JPEG, PNG, WebP (máx. 2 MB).
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="avatar-uploader-error" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
