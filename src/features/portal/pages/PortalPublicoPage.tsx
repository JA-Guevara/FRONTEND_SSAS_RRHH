import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { VacantesPublicasList } from '../components/VacantesPublicasList'
import { VacantePublicaDetalle } from '../components/VacantePublicaDetalle'
import { PostulacionForm } from '../components/PostulacionForm'
import { SeguimientoPostulacion } from '../components/SeguimientoPostulacion'
import {
  getEmpresaPublica,
  getVacantePublica,
  getVacantesPublicas,
  type EmpresaPublica,
  type VacantePublica,
} from '../api/portalApi'
import '../portal.css'

type Vista = 'lista' | 'detalle' | 'form' | 'seguimiento'

export function PortalPublicoPage() {
  const { slug = '', vacanteId } = useParams()
  const [empresa, setEmpresa] = useState<EmpresaPublica | null>(null)
  const [vacantes, setVacantes] = useState<VacantePublica[]>([])
  const [vacante, setVacante] = useState<VacantePublica | null>(null)
  const [vista, setVista] = useState<Vista>(vacanteId ? 'detalle' : 'lista')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    setError('')
    setLoading(true)

    Promise.all([getEmpresaPublica(slug), getVacantesPublicas(slug)])
      .then(([emp, list]) => {
        setEmpresa(emp)
        setVacantes(list)
        if (vacanteId) {
          getVacantePublica(slug, vacanteId)
            .then((v) => {
              setVacante(v)
              setVista('detalle')
            })
            .catch(() => setVista('lista'))
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug, vacanteId])

  async function abrirDetalle(id: string) {
    if (!slug) return
    try {
      const item = await getVacantePublica(slug, id)
      setVacante(item)
      setVista('detalle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle')
    }
  }

  const primaryColor = empresa?.color_primario || '#176b4b'
  const companyName = empresa ? (empresa.nombre_comercial || empresa.nombre) : ''

  return (
    <div
      className="po-page"
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div className="po-wrap" style={{ maxWidth: 880, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Encabezado Institucional de la Empresa */}
        {empresa && (
          <div
            className="po-brand"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {empresa.logo_url ? (
              <img
                src={empresa.logo_url}
                alt={companyName}
                style={{
                  width: 56,
                  height: 56,
                  objectFit: 'contain',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                }}
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <div
                className="po-mark"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '0.5rem',
                  background: primaryColor,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {companyName.charAt(0)}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                {companyName}
              </h2>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Oportunidades laborales activas
              </div>
              {empresa.descripcion && (
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
                  {empresa.descripcion}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span
                style={{
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  borderRadius: '1rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {vacantes.length} vacantes abiertas
              </span>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: primaryColor,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={() => setVista(vista === 'seguimiento' ? 'lista' : 'seguimiento')}
              >
                {vista === 'seguimiento' ? '← Ver vacantes' : '🔍 Consultar mi postulación'}
              </button>
            </div>
          </div>
        )}

        {/* Estado Inactivo */}
        {empresa && empresa.portal_publico_activo === false && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              textAlign: 'center',
              color: '#991b1b',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem' }}>Portal Temporalmente Pausado</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Esta empresa no está recibiendo postulaciones en este momento.
            </p>
          </div>
        )}

        {loading && <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Cargando portal de empleo...</p>}

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              color: '#991b1b',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {(!empresa || empresa.portal_publico_activo !== false) && !loading && (
          <>
            {vista === 'lista' && (
              <VacantesPublicasList
                vacantes={vacantes}
                onSelect={(id) => void abrirDetalle(id)}
              />
            )}

            {vista === 'detalle' && vacante && (
              <VacantePublicaDetalle
                vacante={vacante}
                onBack={() => setVista('lista')}
                onPostular={() => setVista('form')}
              />
            )}

            {vista === 'form' && vacante && (
              <PostulacionForm vacante={vacante} onBack={() => setVista('detalle')} />
            )}

            {vista === 'seguimiento' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setVista('lista')}
                  style={{ background: 'transparent', border: 'none', color: primaryColor, cursor: 'pointer', marginBottom: '1rem', fontWeight: 600 }}
                >
                  ← Volver a vacantes
                </button>
                <SeguimientoPostulacion />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
