import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { VacantesPublicasList } from '../components/VacantesPublicasList'
import { VacantePublicaDetalle } from '../components/VacantePublicaDetalle'
import { PostulacionForm } from '../components/PostulacionForm'
import {
  getEmpresaPublica,
  getVacantePublica,
  getVacantesPublicas,
  type EmpresaPublica,
  type VacantePublica,
} from '../api/portalApi'
import '../portal.css'

type Vista = 'lista' | 'detalle' | 'form'

export function PortalPublicoPage() {
  const { slug = '' } = useParams()
  const [empresa, setEmpresa] = useState<EmpresaPublica | null>(null)
  const [vacantes, setVacantes] = useState<VacantePublica[]>([])
  const [vacante, setVacante] = useState<VacantePublica | null>(null)
  const [vista, setVista] = useState<Vista>('lista')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setError('')
    setEmpresa(null)
    setVacantes([])
    setVacante(null)
    setVista('lista')
    if (!slug) {
      setError('Empresa no encontrada')
      return
    }
    void Promise.all([getEmpresaPublica(slug), getVacantesPublicas(slug)])
      .then(([emp, list]) => {
        if (!active) return
        setEmpresa(emp)
        setVacantes(list)
      })
      .catch((err: Error) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [slug])

  async function abrirDetalle(id: string) {
    setError('')
    try {
      const item = await getVacantePublica(slug, id)
      setVacante(item)
      setVista('detalle')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo consultar la vacante')
    }
  }

  return (
    <div className="po-page">
      <div className="po-wrap">
        {empresa && (
          <div className="po-brand">
            <div className="po-mark">{empresa.nombre_comercial.charAt(0)}</div>
            <div>
              <b>{empresa.nombre_comercial}</b>
              <div className="po-sub">Trabajá con nosotros · {empresa.ciudad}</div>
            </div>
            <span className="po-chip po-right">{vacantes.length} vacantes abiertas</span>
          </div>
        )}
        {error && <div className="po-bad">{error}</div>}

        {vista === 'lista' && (
          <VacantesPublicasList vacantes={vacantes} onSelect={(id) => void abrirDetalle(id)} />
        )}
        {vista === 'detalle' && vacante && (
          <VacantePublicaDetalle
            vacante={vacante}
            onBack={() => setVista('lista')}
            onPostular={() => setVista('form')}
          />
        )}
        {vista === 'form' && vacante && (
          <PostulacionForm vacante={vacante} onBack={() => setVista('lista')} />
        )}
      </div>
    </div>
  )
}
