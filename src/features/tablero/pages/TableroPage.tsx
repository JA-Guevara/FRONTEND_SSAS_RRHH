import { useCallback, useEffect, useState } from 'react'
import { TableroKanban } from '../components/TableroKanban'
import { getEtapas, getPostulaciones, type Etapa, type TarjetaPostulacion } from '../api/tableroApi'
import '../tablero.css'

export function TableroPage() {
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [postulaciones, setPostulaciones] = useState<TarjetaPostulacion[]>([])

  const load = useCallback(async () => {
    const [ets, posts] = await Promise.all([getEtapas(), getPostulaciones()])
    setEtapas(ets)
    setPostulaciones(posts)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="tb-page">
      <div className="tb-eyebrow">Selección · Sprint 1</div>
      <h1>Tablero de postulaciones</h1>
      <p className="tb-sub">
        Columnas según etapa_reclutamiento.orden. Arrastra una tarjeta o usa los botones para moverla.
      </p>
      <TableroKanban etapas={etapas} postulaciones={postulaciones} onChanged={load} />
    </div>
  )
}