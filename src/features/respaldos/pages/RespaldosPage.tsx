import { useCallback, useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  DatabaseBackup,
  Download,
  HardDrive,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  Panel,
} from '../../../shared/components'
import {
  respaldosApi,
  type CrearRespaldoProgramacion,
  type Respaldo,
  type RespaldoProgramacion,
} from '../api/respaldosApi'
import '../respaldos.css'

const RESTORE_PHRASE = 'RESTAURAR BASE DE DATOS'
const DEFAULT_STORAGE_QUOTA_BYTES = 1024 * 1024 * 1024 // 1 GB de cuota base
const dateFormatter = new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' })

const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

function formatBytes(value: number | null): string {
  if (value === null) return 'Pendiente'
  if (value < 1024) return `${value} B`
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 ** 2).toFixed(1)} MB`
}

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'COMPLETADO') return 'success'
  if (status === 'FALLIDO') return 'danger'
  if (status.includes('PROCESANDO') || status.includes('RESTAUR')) return 'warning'
  return 'neutral'
}

function isRunning(status: string): boolean {
  return ['PENDIENTE', 'PROCESANDO', 'RESTAURACION_PENDIENTE', 'RESTAURANDO'].includes(status)
}

function describirFrecuencia(prog: RespaldoProgramacion): string {
  if (prog.frecuencia === 'DIARIA') {
    return `Todos los días a las ${prog.hora}`
  }
  if (prog.frecuencia === 'SEMANAL') {
    const dia = prog.dia_semana !== null ? DIAS_SEMANA[prog.dia_semana] ?? 'Lunes' : 'Lunes'
    return `Semanal los ${dia} a las ${prog.hora}`
  }
  return `Mensual el día ${prog.dia_mes ?? 1} a las ${prog.hora}`
}

export function RespaldosPage() {
  const [items, setItems] = useState<Respaldo[]>([])
  const [programaciones, setProgramaciones] = useState<RespaldoProgramacion[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<Respaldo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Respaldo | null>(null)
  const [deletePolicyTarget, setDeletePolicyTarget] = useState<RespaldoProgramacion | null>(null)
  const [confirmation, setConfirmation] = useState('')

  // Verificación de integridad
  const [verificandoId, setVerificandoId] = useState<string | null>(null)
  const [verificaciones, setVerificaciones] = useState<Record<string, { integro: boolean }>>({})

  // Modal nueva programación
  const [showNuevaProg, setShowNuevaProg] = useState(false)
  const [progForm, setProgForm] = useState<CrearRespaldoProgramacion>({
    nombre: '',
    frecuencia: 'DIARIA',
    hora: '03:00',
    dia_semana: 0,
    dia_mes: 1,
    retencion_dias: 30,
  })

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const [backupsList, progList] = await Promise.all([
        respaldosApi.list(),
        respaldosApi.listProgramaciones().catch(() => []),
      ])
      setItems(backupsList)
      setProgramaciones(progList)
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudieron consultar los respaldos.',
      })
    } finally {
      if (!quiet) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!items.some((item) => isRunning(item.estado))) return
    const timer = window.setInterval(() => void load(true), 4000)
    return () => window.clearInterval(timer)
  }, [items, load])

  const totalBytesUsados = items
    .filter((b) => b.estado === 'COMPLETADO' && b.tamano_bytes !== null)
    .reduce((acc, b) => acc + (b.tamano_bytes ?? 0), 0)

  async function createBackup() {
    setBusy(true)
    setMessage(null)
    try {
      await respaldosApi.create(name)
      setName('')
      setMessage({ tone: 'success', text: 'El respaldo comenzó a generarse.' })
      await load(true)
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo iniciar el respaldo.',
      })
    } finally {
      setBusy(false)
    }
  }

  async function restoreBackup() {
    if (!restoreTarget) return
    setBusy(true)
    try {
      const result = await respaldosApi.restore(restoreTarget.id, confirmation)
      setMessage({ tone: 'info', text: result.mensaje })
      setRestoreTarget(null)
      setConfirmation('')
      await load(true)
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo restaurar.',
      })
    } finally {
      setBusy(false)
    }
  }

  async function deleteBackup() {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await respaldosApi.remove(deleteTarget.id)
      setDeleteTarget(null)
      setMessage({ tone: 'success', text: 'El respaldo fue eliminado.' })
      await load(true)
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo eliminar.',
      })
    } finally {
      setBusy(false)
    }
  }

  async function verificarIntegridad(id: string) {
    setVerificandoId(id)
    try {
      const res = await respaldosApi.verificar(id)
      setVerificaciones((prev) => ({ ...prev, [id]: { integro: res.integro } }))
      setMessage({
        tone: res.integro ? 'success' : 'error',
        text: res.integro
          ? 'Integridad confirmada: el hash SHA-256 coincide exactamente con el archivo.'
          : '¡Alerta de integridad! El archivo almacenado difiere del hash registrado.',
      })
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo verificar la integridad.',
      })
    } finally {
      setVerificandoId(null)
    }
  }

  async function togglePolicyActive(prog: RespaldoProgramacion) {
    try {
      await respaldosApi.updateProgramacion(prog.id, { activo: !prog.activo })
      await load(true)
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo cambiar el estado de la programación.',
      })
    }
  }

  async function ejecutarPolicyAhora(prog: RespaldoProgramacion) {
    setBusy(true)
    try {
      await respaldosApi.ejecutarProgramacionAhora(prog.id)
      setMessage({
        tone: 'success',
        text: `Se inició la ejecución manual de "${prog.nombre}".`,
      })
      await load(true)
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo ejecutar la programación.',
      })
    } finally {
      setBusy(false)
    }
  }

  async function deletePolicy() {
    if (!deletePolicyTarget) return
    try {
      await respaldosApi.deleteProgramacion(deletePolicyTarget.id)
      setDeletePolicyTarget(null)
      setMessage({ tone: 'success', text: 'Programación eliminada.' })
      await load(true)
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo eliminar la programación.',
      })
    }
  }

  async function guardarNuevaProgramacion() {
    if (!progForm.nombre.trim()) return
    setBusy(true)
    try {
      await respaldosApi.createProgramacion({
        ...progForm,
        nombre: progForm.nombre.trim(),
        hora: progForm.hora.length === 5 ? `${progForm.hora}:00` : progForm.hora,
      })
      setShowNuevaProg(false)
      setProgForm({
        nombre: '',
        frecuencia: 'DIARIA',
        hora: '03:00',
        dia_semana: 0,
        dia_mes: 1,
        retencion_dias: 30,
      })
      setMessage({ tone: 'success', text: 'Programación creada exitosamente.' })
      await load(true)
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo crear la programación.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Continuidad operativa"
        title="Backup / Restore"
        description="Respalda la base de datos, programa copias automáticas y verifica su integridad SHA-256."
        actions={
          <Button variant="secondary" onClick={() => void load()} loading={loading}>
            <RefreshCw size={17} aria-hidden="true" />
            Actualizar
          </Button>
        }
      />

      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      {/* Medidor de almacenamiento */}
      <div className="backup-storage-bar">
        <div className="backup-storage-header">
          <span>
            <HardDrive size={16} aria-hidden="true" /> Almacenamiento utilizado:{' '}
            <strong>{formatBytes(totalBytesUsados)}</strong> de{' '}
            {formatBytes(DEFAULT_STORAGE_QUOTA_BYTES)}
          </span>
          <span>
            {Math.min(100, Math.round((totalBytesUsados / DEFAULT_STORAGE_QUOTA_BYTES) * 100))}%
          </span>
        </div>
        <progress
          className="backup-progress"
          value={totalBytesUsados}
          max={DEFAULT_STORAGE_QUOTA_BYTES}
        />
      </div>

      {/* Programaciones automáticas (S-16 .. S-20) */}
      <Panel
        title="Respaldos programados"
        eyebrow="Automatización y retención"
        count={`${programaciones.length} activas`}
        actions={
          <Button size="sm" onClick={() => setShowNuevaProg(true)}>
            <Plus size={16} aria-hidden="true" />
            Nueva programación
          </Button>
        }
      >
        {programaciones.length === 0 ? (
          <EmptyState
            title="Sin programaciones automáticas"
            message="Configura una política de respaldo periódica (diaria, semanal o mensual) con retención automática."
          />
        ) : (
          <div className="backup-policies-grid">
            {programaciones.map((prog) => (
              <div key={prog.id} className="backup-policy-card">
                <div className="backup-policy-header">
                  <div>
                    <strong>{prog.nombre}</strong>
                    <div className="backup-policy-meta">
                      <Clock size={12} aria-hidden="true" /> {describirFrecuencia(prog)}
                    </div>
                  </div>
                  <Badge tone={prog.activo ? 'success' : 'neutral'}>
                    {prog.activo ? 'Activa' : 'Pausada'}
                  </Badge>
                </div>
                <div className="backup-policy-meta">
                  Próxima ejecución: {dateFormatter.format(new Date(prog.proxima_ejecucion))}
                </div>
                <div className="backup-policy-meta">
                  Retención: Conserva últimos {prog.retencion_dias} días
                </div>
                <div className="backup-policy-actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void togglePolicyActive(prog)}
                  >
                    {prog.activo ? 'Pausar' : 'Activar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void ejecutarPolicyAhora(prog)}
                    loading={busy}
                  >
                    <Play size={14} aria-hidden="true" /> Ejecutar ahora
                  </Button>
                  <button
                    className="icon-button icon-button-danger"
                    type="button"
                    title="Eliminar programación"
                    aria-label={`Eliminar programación ${prog.nombre}`}
                    onClick={() => setDeletePolicyTarget(prog)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Creación manual */}
      <Panel title="Crear respaldo manual" eyebrow="Base de datos completa">
        <div className="backup-create-row">
          <Field label="Nombre opcional">
            <input
              value={name}
              maxLength={180}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Antes del cierre mensual"
            />
          </Field>
          <Button onClick={() => void createBackup()} loading={busy}>
            <DatabaseBackup size={17} aria-hidden="true" />
            Crear respaldo
          </Button>
        </div>
        <p className="field-hint">
          El paquete comprimido se custodia en almacenamiento privado con hash SHA-256 verificado.
        </p>
      </Panel>

      {/* Historial */}
      <Panel title="Historial" count={`${items.length} respaldos`}>
        {loading && <p>Cargando respaldos…</p>}
        {!loading && items.length === 0 && (
          <EmptyState
            title="Todavía no hay respaldos"
            message="Crea el primero antes de realizar cambios importantes en el sistema."
          />
        )}
        {!loading && items.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Respaldo</th>
                  <th>Creado</th>
                  <th>Tamaño</th>
                  <th>Estado</th>
                  <th>Integridad SHA-256</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.nombre}</strong>
                      <small>{item.formato.toUpperCase()}</small>
                      {item.mensaje_error && (
                        <small className="backup-error">{item.mensaje_error}</small>
                      )}
                    </td>
                    <td>
                      {dateFormatter.format(new Date(item.fecha_creacion))}
                      {item.fecha_restauracion && (
                        <small>
                          Restaurado: {dateFormatter.format(new Date(item.fecha_restauracion))}
                        </small>
                      )}
                    </td>
                    <td>{formatBytes(item.tamano_bytes)}</td>
                    <td>
                      <Badge tone={statusTone(item.estado)}>
                        {item.estado.replaceAll('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      {item.sha256 ? (
                        <div>
                          <code title={item.sha256}>{item.sha256.slice(0, 10)}…</code>
                          {verificaciones[item.id] && (
                            <Badge
                              tone={verificaciones[item.id].integro ? 'success' : 'danger'}
                            >
                              {verificaciones[item.id].integro ? (
                                <>
                                  <CheckCircle2 size={12} aria-hidden="true" /> Íntegro
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} aria-hidden="true" /> Corrupto
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        'Pendiente'
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={item.estado !== 'COMPLETADO'}
                          loading={verificandoId === item.id}
                          onClick={() => void verificarIntegridad(item.id)}
                          title="Recalcula el hash leyendo el archivo en almacenamiento"
                        >
                          <ShieldCheck size={16} aria-hidden="true" />
                          Verificar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={item.estado !== 'COMPLETADO'}
                          onClick={() =>
                            void respaldosApi
                              .download(item.id)
                              .catch((error: Error) =>
                                setMessage({ tone: 'error', text: error.message }),
                              )
                          }
                        >
                          <Download size={16} aria-hidden="true" />
                          Descargar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={item.estado !== 'COMPLETADO'}
                          onClick={() => {
                            setRestoreTarget(item)
                            setConfirmation('')
                          }}
                        >
                          <RotateCcw size={16} aria-hidden="true" />
                          Restaurar
                        </Button>
                        <button
                          className="icon-button icon-button-danger"
                          type="button"
                          disabled={isRunning(item.estado)}
                          title="Eliminar respaldo"
                          aria-label={`Eliminar ${item.nombre}`}
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Modal crear nueva programación */}
      {showNuevaProg && (
        <Modal
          title="Nueva programación de respaldo"
          onClose={() => setShowNuevaProg(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowNuevaProg(false)}>
                Cancelar
              </Button>
              <Button onClick={() => void guardarNuevaProgramacion()} loading={busy}>
                Guardar programación
              </Button>
            </>
          }
        >
          <div className="backup-modal-form">
            <Field label="Nombre de la programación" required>
              <input
                value={progForm.nombre}
                onChange={(e) => setProgForm({ ...progForm, nombre: e.target.value })}
                placeholder="Ej. Respaldo diario madrugada"
              />
            </Field>

            <div className="backup-form-row">
              <Field label="Frecuencia" required>
                <select
                  value={progForm.frecuencia}
                  onChange={(e) =>
                    setProgForm({
                      ...progForm,
                      frecuencia: e.target.value as 'DIARIA' | 'SEMANAL' | 'MENSUAL',
                    })
                  }
                >
                  <option value="DIARIA">Diaria</option>
                  <option value="SEMANAL">Semanal</option>
                  <option value="MENSUAL">Mensual</option>
                </select>
              </Field>

              <Field label="Hora (HH:MM)" required>
                <input
                  type="time"
                  value={progForm.hora}
                  onChange={(e) => setProgForm({ ...progForm, hora: e.target.value })}
                />
              </Field>
            </div>

            {progForm.frecuencia === 'SEMANAL' && (
              <Field label="Día de la semana" required>
                <select
                  value={progForm.dia_semana ?? 0}
                  onChange={(e) =>
                    setProgForm({ ...progForm, dia_semana: Number(e.target.value) })
                  }
                >
                  {DIAS_SEMANA.map((dia, idx) => (
                    <option key={dia} value={idx}>
                      {dia}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {progForm.frecuencia === 'MENSUAL' && (
              <Field label="Día del mes (1 - 28)" required>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={progForm.dia_mes ?? 1}
                  onChange={(e) =>
                    setProgForm({ ...progForm, dia_mes: Number(e.target.value) })
                  }
                />
              </Field>
            )}

            <Field label="Retención en días" hint="Los respaldos de esta programación que superen estos días se purgarán automáticamente.">
              <input
                type="number"
                min={1}
                max={365}
                value={progForm.retencion_dias ?? 30}
                onChange={(e) =>
                  setProgForm({ ...progForm, retencion_dias: Number(e.target.value) })
                }
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* Confirmar restauración */}
      {restoreTarget && (
        <ConfirmDialog
          title="Restaurar toda la base de datos"
          tone="danger"
          confirmLabel="Iniciar restauración"
          loading={busy}
          onCancel={() => {
            setRestoreTarget(null)
            setConfirmation('')
          }}
          onConfirm={() => void restoreBackup()}
          message={
            <div className="restore-warning">
              <Alert tone="error">
                Esta operación reemplazará los datos actuales. No uses el sistema mientras esté en curso.
              </Alert>
              <Field label={`Escribe: ${RESTORE_PHRASE}`}>
                <input
                  autoFocus
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              </Field>
              {confirmation !== RESTORE_PHRASE && (
                <p className="field-hint">La confirmación debe coincidir exactamente.</p>
              )}
            </div>
          }
        />
      )}

      {/* Confirmar eliminación de respaldo */}
      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar respaldo"
          message={
            <>
              Se eliminará permanentemente <strong>{deleteTarget.nombre}</strong> del almacenamiento privado.
            </>
          }
          tone="danger"
          confirmLabel="Eliminar"
          loading={busy}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void deleteBackup()}
        />
      )}

      {/* Confirmar eliminación de programación */}
      {deletePolicyTarget && (
        <ConfirmDialog
          title="Eliminar programación de respaldo"
          message={
            <>
              Se eliminará la programación <strong>{deletePolicyTarget.nombre}</strong>. Los respaldos ya generados se mantendrán en el historial.
            </>
          }
          tone="danger"
          confirmLabel="Eliminar programación"
          loading={busy}
          onCancel={() => setDeletePolicyTarget(null)}
          onConfirm={() => void deletePolicy()}
        />
      )}
    </section>
  )
}
