import { Link } from 'react-router-dom'
import { EmptyState } from '../../shared/components'

export function NotFoundPage() {
  return (
    <div className="page-stack">
      <EmptyState
        title="Página no encontrada"
        message="La dirección que abriste no existe o ya no está disponible."
        action={
          <Link className="button button-secondary" to="/">
            Volver al inicio
          </Link>
        }
      />
    </div>
  )
}
