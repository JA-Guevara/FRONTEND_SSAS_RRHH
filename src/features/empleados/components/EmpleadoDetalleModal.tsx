import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, EstadoBadge, LoadingBlock, Modal, Panel } from '../../../shared/components'
import { obtenerEmpleado, type EmpleadoDetalle } from '../api/empleadosApi'
import { formatearFecha } from '../../portal/utils/formato'

type Props = {
  empleadoId: string
  empresaId?: string
  onClose: () => void
}

function mostrar(valor: string | null | undefined): string {
  if (valor == null || valor.trim() === '') return 'Sin información'
  return valor
}

function enmascararCuenta(cuenta: string | null | undefined): string {
  if (!cuenta || !cuenta.trim()) return 'Sin información'
  const limpio = cuenta.trim()
  const ultimos = limpio.slice(-4)
  return `••••${ultimos}`
}

export function EmpleadoDetalleModal({ empleadoId, empresaId, onClose }: Props) {
  const [empleado, setEmpleado] = useState<EmpleadoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    obtenerEmpleado(empleadoId, empresaId)
      .then((data) => {
        if (active) setEmpleado(data)
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la ficha del empleado.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [empleadoId, empresaId])

  return (
    <Modal title="Ficha del empleado" size="lg" onClose={onClose}>
      {loading && <LoadingBlock />}
      {error && <Alert tone="error">{error}</Alert>}
      {!loading && empleado && (
        <div className="form-stack">
          <Panel title="Datos laborales">
            <div className="grid-2 text-sm">
              <div>
                <span className="text-muted">Código:</span> <strong>{mostrar(empleado.codigo)}</strong>
              </div>
              <div>
                <span className="text-muted">Cargo:</span> <strong>{mostrar(empleado.cargo_nombre)}</strong>
              </div>
              <div>
                <span className="text-muted">Fecha de ingreso:</span>{' '}
                <strong>{formatearFecha(empleado.fecha_ingreso) ?? mostrar(empleado.fecha_ingreso)}</strong>
              </div>
              <div>
                <span className="text-muted">Estado:</span> <EstadoBadge estado={empleado.estado} />
              </div>
              {empleado.fecha_salida && (
                <>
                  <div>
                    <span className="text-muted">Fecha de salida:</span>{' '}
                    <strong>{formatearFecha(empleado.fecha_salida) ?? mostrar(empleado.fecha_salida)}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Motivo de salida:</span>{' '}
                    <strong>{mostrar(empleado.motivo_salida)}</strong>
                  </div>
                </>
              )}
            </div>
          </Panel>

          <Panel title="Datos personales">
            <div className="grid-2 text-sm">
              <div>
                <span className="text-muted">CI:</span>{' '}
                <strong>
                  {mostrar(empleado.ci)} {empleado.ci_expedido ? `(${empleado.ci_expedido})` : ''}
                </strong>
              </div>
              <div>
                <span className="text-muted">Fecha de nacimiento:</span>{' '}
                <strong>{formatearFecha(empleado.fecha_nacimiento) ?? 'Sin información'}</strong>
              </div>
              <div>
                <span className="text-muted">Género:</span> <strong>{mostrar(empleado.genero)}</strong>
              </div>
              <div>
                <span className="text-muted">Estado civil:</span> <strong>{mostrar(empleado.estado_civil)}</strong>
              </div>
              <div>
                <span className="text-muted">Dirección:</span> <strong>{mostrar(empleado.direccion)}</strong>
              </div>
              <div>
                <span className="text-muted">Teléfono:</span> <strong>{mostrar(empleado.telefono)}</strong>
              </div>
              <div className="col-span-full">
                <span className="text-muted">Correo personal:</span> <strong>{mostrar(empleado.email_personal)}</strong>
              </div>
            </div>
          </Panel>

          <Panel title="Contacto de emergencia">
            <div className="grid-2 text-sm">
              <div>
                <span className="text-muted">Contacto:</span> <strong>{mostrar(empleado.contacto_emergencia)}</strong>
              </div>
              <div>
                <span className="text-muted">Teléfono:</span> <strong>{mostrar(empleado.telefono_emergencia)}</strong>
              </div>
            </div>
          </Panel>

          <Panel title="Datos de pago">
            <div className="grid-2 text-sm">
              <div>
                <span className="text-muted">NUA / CUA:</span> <strong>{mostrar(empleado.nua_cua)}</strong>
              </div>
              <div>
                <span className="text-muted">AFP:</span> <strong>{mostrar(empleado.afp)}</strong>
              </div>
              <div>
                <span className="text-muted">Banco:</span> <strong>{mostrar(empleado.banco)}</strong>
              </div>
              <div>
                <span className="text-muted">Tipo de cuenta:</span> <strong>{mostrar(empleado.tipo_cuenta)}</strong>
              </div>
              <div className="col-span-full">
                <span className="text-muted">Número de cuenta:</span>{' '}
                <strong>{enmascararCuenta(empleado.numero_cuenta)}</strong>
              </div>
            </div>
          </Panel>

          {empleado.postulacion_id && (
            <div className="pt-2">
              <Link
                to={'/seleccion?postulacion=' + empleado.postulacion_id}
                className="text-sm"
              >
                Ver proceso de selección
              </Link>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
