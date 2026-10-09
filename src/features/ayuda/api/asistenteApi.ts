import { apiRequest } from '../../../shared/api/httpClient'

export type ContextoAsistente = {
  ruta: string
  pantalla: string
  registro?: {
    tipo: 'vacante' | 'postulacion' | 'empleado' | 'candidato'
    id: string
    titulo?: string
  }
}

export type AccionPropuesta = {
  herramienta: string
  titulo: string
  descripcion: string
  argumentos: Record<string, unknown>
  resumen_confirmacion: Record<string, string | number | boolean>
}

export type MensajeAsistenteResponse = {
  tipo: 'texto' | 'accion'
  contenido: string
  accion?: AccionPropuesta
  fuentes?: { id: string; titulo: string }[]
}

export type EjecutarAccionResponse = {
  exito: boolean
  mensaje: string
  resultado?: Record<string, unknown>
}

export const asistenteApi = {
  enviarMensaje: (mensaje: string, contexto?: ContextoAsistente) =>
    apiRequest<MensajeAsistenteResponse>('/api/v1/asistente/mensajes', {
      method: 'POST',
      body: { mensaje, contexto },
      timeoutMs: 60_000,
    }),

  ejecutarAccion: (herramienta: string, argumentos: Record<string, unknown>) =>
    apiRequest<EjecutarAccionResponse>('/api/v1/asistente/ejecutar', {
      method: 'POST',
      body: { herramienta, argumentos },
      timeoutMs: 60_000,
    }),
}
