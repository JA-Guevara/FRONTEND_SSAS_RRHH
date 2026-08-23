import { useEffect, useState } from 'react'
import { bitacoraApi } from '../api/bitacoraApi.js'

export function BitacoraPage() {
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')

  useEffect(() => {
    let active = true
    bitacoraApi.health()
      .then(() => active && setServiceStatus('available'))
      .catch(() => active && setServiceStatus('unavailable'))
    return () => { active = false }
  }, [])

  const messages = {
    checking: 'Comprobando disponibilidad…',
    available: 'El servicio de bitácora está disponible.',
    unavailable: 'No se pudo contactar al servicio de bitácora.',
  }

  return (
    <section className="page-stack" aria-labelledby="bitacora-title">
      <div>
        <p className="eyebrow">Seguridad y administración</p>
        <h1 id="bitacora-title">Bitácora</h1>
        <p className="page-description">La tabla y sus filtros se incorporarán cuando el backend publique los endpoints de consulta.</p>
      </div>
      <article className="empty-state">
        <span className={`status-dot status-${serviceStatus}`} aria-hidden="true" />
        <div><h2>Estado del módulo</h2><p>{messages[serviceStatus]}</p></div>
      </article>
    </section>
  )
}
