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
  const { slug = 'textiles-del-oriente' } = useParams()
  const [empresa, setEmpresa] = useState<EmpresaPublica | null>(null)
  const [vacantes, setVacantes] = useState<VacantePublica[]>([])
  const [vacante, setVacante] = useState<VacantePublica | null>(null)
  const [vista, setVista] = useState<Vista>('lista')
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    void Promise.all([getEmpresaPublica(slug), getVacantesPublicas(slug)])
      .then(([emp, list]) => {
        setEmpresa(emp)
        setVacantes(list)
      })
      .catch((err: Error) => setError(err.message))
  }, [slug])

  async function abrirDetalle(id: string) {
    const item = await getVacantePublica(slug, id)
    setVacante(item)
    setVista('detalle')
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
