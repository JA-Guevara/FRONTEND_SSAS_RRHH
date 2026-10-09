import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Mic, MicOff, Send, X } from 'lucide-react'
import { chatbotApi, type ChatAnswer, type KnowledgeArticle } from '../api/chatbotApi'
import { asistenteApi, type AccionPropuesta, type ContextoAsistente } from '../api/asistenteApi'
import { AsistenteAvatar, type AsistenteAvatarEstado } from './AsistenteAvatar'
import './chat-widget.css'

export type AsistenteProps = {
  slug?: string
  contexto?: ContextoAsistente
}

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
  sources?: ChatAnswer['fuentes']
  links?: ChatAnswer['enlaces']
  accion?: AccionPropuesta
  accionEjecutada?: boolean
}

const STORAGE_KEY = 'ssas_asistente_historial'
const SUGERENCIA_KEY = 'ssas_asistente_sugerencia'
const PULSO_KEY = 'ssas_asistente_pulso'
const RETRASO_SUGERENCIA_MS = 3000
const DURACION_PULSO_MS = 7200

const SUGERENCIAS_PANTALLA = [
  { prefijo: '/seleccion', texto: '¿Querés que analice los CV pendientes?' },
  { prefijo: '/vacantes', texto: 'Puedo duplicar una vacante del mes pasado' },
  {
    prefijo: '/reportes',
    texto: 'Pedime un reporte hablando: «postulaciones de septiembre»',
  },
]

function sugerenciaDePantalla(pathname: string) {
  const item = SUGERENCIAS_PANTALLA.find((sugerencia) =>
    pathname.startsWith(sugerencia.prefijo)
  )
  if (!item) return null
  return { clave: `${SUGERENCIA_KEY}:${item.prefijo}`, texto: item.texto }
}

function sinSugerenciaPrevia(clave: string) {
  try {
    return !sessionStorage.getItem(clave)
  } catch {
    return true
  }
}

function primerPulsoDeLaSesion() {
  try {
    if (sessionStorage.getItem(PULSO_KEY)) return false
    sessionStorage.setItem(PULSO_KEY, '1')
    return true
  } catch {
    return true
  }
}

function TarjetaConfirmacion({
  accion,
  ejecutada,
  onConfirmar,
  onCancelar,
}: {
  accion: AccionPropuesta
  ejecutada?: boolean
  onConfirmar: () => Promise<void>
  onCancelar: () => void
}) {
  const [ejecutando, setEjecutando] = useState(false)

  async function handleConfirm() {
    setEjecutando(true)
    try {
      await onConfirmar()
    } finally {
      setEjecutando(false)
    }
  }

  return (
    <div className="chat-card-action" role="region" aria-label={`Confirmar acción: ${accion.titulo}`}>
      <div className="chat-card-title">⚡ {accion.titulo}</div>
      <p className="chat-card-desc">{accion.descripcion}</p>

      {accion.resumen_confirmacion && (
        <table className="chat-card-table">
          <tbody>
            {Object.entries(accion.resumen_confirmacion).map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td>{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {ejecutada ? (
        <div className="chat-card-confirmed">
          <Check size={14} /> Acción confirmada y registrada en auditoría
        </div>
      ) : (
        <div className="chat-card-buttons">
          <button
            type="button"
            className="chat-card-btn-cancel"
            disabled={ejecutando}
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="chat-card-btn-confirm"
            disabled={ejecutando}
            onClick={() => void handleConfirm()}
          >
            {ejecutando ? 'Ejecutando…' : 'Confirmar y ejecutar'}
          </button>
        </div>
      )}
    </div>
  )
}

function useCurrentPath() {
  const [path, setPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'))
  useEffect(() => {
    if (typeof window === 'undefined') return
    const update = () => setPath(window.location.pathname)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  return path
}

export function Asistente({ slug, contexto }: AsistenteProps) {
  const currentPath = useCurrentPath()
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined' || slug) return []
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sourceArticle, setSourceArticle] = useState<KnowledgeArticle | null>(null)
  const [sourceLoading, setSourceLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [destello, setDestello] = useState(false)
  const [sugerencia, setSugerencia] = useState<{ clave: string; texto: string } | null>(
    null
  )
  const [llamando, setLlamando] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Guardar historial en sesión
  useEffect(() => {
    if (!slug && messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)))
      } catch {
        // Ignorar quota storage
      }
    }
  }, [messages, slug])

  // Inicializar reconocimiento de voz en es-BO si existe
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const instance = new SpeechRecognition()
      instance.lang = 'es-BO'
      instance.continuous = false
      instance.interimResults = false

      instance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuestion(transcript)
        setListening(false)
      }

      instance.onerror = () => {
        setListening(false)
      }

      instance.onend = () => {
        setListening(false)
      }

      recognitionRef.current = instance
    }
  }, [])

  function toggleVoice() {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      setListening(true)
      try {
        recognitionRef.current.start()
      } catch {
        setListening(false)
      }
    }
  }

  useEffect(() => {
    let active = true
    chatbotApi
      .suggestions(slug)
      .then((items) => {
        if (active) setSuggestions(items)
      })
      .catch(() => {
        if (active) setSuggestions([])
      })
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages])

  // R4-10 · El robot parpadea "listo" cuando llega una respuesta
  useEffect(() => {
    if (messages.length === 0) return
    const ultimo = messages[messages.length - 1]
    if (ultimo.role !== 'assistant') return
    setDestello(true)
    const timer = window.setTimeout(() => setDestello(false), 1400)
    return () => window.clearTimeout(timer)
  }, [messages])

  // R4-12 · Globo de sugerencia: a los 3 s en pantallas concretas, solo si el
  // usuario todavía no interactuó y no la cerró antes en esta sesión.
  useEffect(() => {
    setSugerencia(null)
    setLlamando(false)
    if (slug || open) return
    const candidata = sugerenciaDePantalla(currentPath)
    if (!candidata || !sinSugerenciaPrevia(candidata.clave)) return

    let interactuo = false
    const marcarInteraccion = () => {
      interactuo = true
    }
    document.addEventListener('pointerdown', marcarInteraccion, true)
    document.addEventListener('keydown', marcarInteraccion, true)

    const timer = window.setTimeout(() => {
      document.removeEventListener('pointerdown', marcarInteraccion, true)
      document.removeEventListener('keydown', marcarInteraccion, true)
      if (interactuo) return
      setSugerencia(candidata)
      if (primerPulsoDeLaSesion()) setLlamando(true)
    }, RETRASO_SUGERENCIA_MS)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', marcarInteraccion, true)
      document.removeEventListener('keydown', marcarInteraccion, true)
    }
  }, [currentPath, open, slug])

  // El pulso del lanzador dura lo que el keyframes (3 vueltas de 2.4 s)
  useEffect(() => {
    if (!llamando) return
    const timer = window.setTimeout(() => setLlamando(false), DURACION_PULSO_MS)
    return () => window.clearTimeout(timer)
  }, [llamando])

  async function send(value = question) {
    const text = value.trim()
    if (text.length < 3 || loading) return
    setQuestion('')
    setError('')
    setMessages((previous) => [...previous, { id: Date.now(), role: 'user', text }])
    setLoading(true)

    try {
      if (slug) {
        // Modo portal público: solo base de conocimiento
        const answer = await chatbotApi.ask(text, slug)
        setMessages((previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            role: 'assistant',
            text: answer.respuesta,
            sources: answer.fuentes,
            links: answer.enlaces,
          },
        ])
      } else {
        // Modo copiloto autenticado
        const ctx: ContextoAsistente = contexto || {
          ruta: currentPath,
          pantalla: typeof document !== 'undefined' ? document.title || 'Panel' : 'Panel',
        }
        const resp = await asistenteApi.enviarMensaje(text, ctx)
        setMessages((previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            role: 'assistant',
            text: resp.contenido,
            accion: resp.accion,
            sources: resp.fuentes,
          },
        ])
      }
    } catch (cause) {
      setQuestion(text)
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la consulta.')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmarAccion(messageId: number, accion: AccionPropuesta) {
    setError('')
    try {
      const res = await asistenteApi.ejecutarAccion(accion.herramienta, accion.argumentos)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                accionEjecutada: true,
                text: `${m.text}\n\n✓ ${res.mensaje}`,
              }
            : m
        )
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al ejecutar la acción.')
    }
  }

  function handleCancelarAccion(messageId: number) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              accion: undefined,
              text: `${m.text}\n\n(Acción cancelada por el usuario)`,
            }
          : m
      )
    )
  }

  function cerrarSugerencia() {
    if (sugerencia) {
      try {
        sessionStorage.setItem(sugerencia.clave, '1')
      } catch {
        // Sin storage la sugerencia podrá ofrecerse de nuevo
      }
    }
    setSugerencia(null)
    setLlamando(false)
  }

  async function openSource(id: string) {
    setSourceLoading(true)
    setError('')
    try {
      setSourceArticle(await chatbotApi.article(id, slug))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo abrir la fuente.')
    } finally {
      setSourceLoading(false)
    }
  }

  const estadoAvatar: AsistenteAvatarEstado = error
    ? 'alerta'
    : loading
      ? 'pensando'
      : listening
        ? 'escuchando'
        : destello
          ? 'listo'
          : 'reposo'

  return (
    <div className="chat-widget">
      {open && (
        <section className="chat-panel" role="dialog" aria-label="Asistente RRHH">
          <header className="chat-header">
            <div>
              <strong>Asistente RRHH</strong>
              <small>{slug ? 'Ayuda pública' : 'Copiloto de gestión'}</small>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              title="Cerrar asistente"
            >
              <X size={18} />
            </button>
          </header>

          {sourceArticle !== null && (
            <button className="chat-back" type="button" onClick={() => setSourceArticle(null)}>
              <ArrowLeft size={16} /> Volver al chat
            </button>
          )}

          {sourceArticle === null && suggestions.length > 0 && (
            <div className="chat-suggestions" aria-label="Preguntas sugeridas">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={loading}
                  onClick={() => void send(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          <div className="chat-messages" aria-live="polite">
            {sourceArticle !== null ? (
              <article className="chat-source">
                <h3>{sourceArticle.titulo}</h3>
                <p>{sourceArticle.contenido}</p>
              </article>
            ) : (
              <>
                {messages.length === 0 && (
                  <p className="chat-bubble assistant">
                    {slug
                      ? 'Hola. Pregúntame sobre la información publicada por esta empresa. No compartas datos personales.'
                      : 'Hola. Soy tu copiloto de RRHH. Puedo responder dudas del sistema o preparar acciones como programar entrevistas y mover etapas. ¿Qué deseas hacer?'}
                  </p>
                )}
                {messages.map((item) => (
                  <div key={item.id} className={`chat-bubble ${item.role}`}>
                    <p>{item.text}</p>
                    {item.accion && (
                      <TarjetaConfirmacion
                        accion={item.accion}
                        ejecutada={item.accionEjecutada}
                        onConfirmar={() => handleConfirmarAccion(item.id, item.accion!)}
                        onCancelar={() => handleCancelarAccion(item.id)}
                      />
                    )}
                    {item.sources && item.sources.length > 0 && (
                      <div className="chat-sources">
                        Fuentes:{' '}
                        {item.sources.map((source) => (
                          <button
                            key={source.id}
                            type="button"
                            onClick={() => void openSource(source.id)}
                          >
                            {source.titulo}
                          </button>
                        ))}
                      </div>
                    )}
                    {item.links && item.links.length > 0 && (
                      <div className="chat-links">
                        {item.links.map((link) => (
                          <a key={link.ruta} href={link.ruta}>
                            {link.titulo}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && <p className="chat-status">Consultando…</p>}
                {sourceLoading && <p className="chat-status">Abriendo fuente…</p>}
                {error && (
                  <p className="chat-error" role="alert">
                    {error}
                  </p>
                )}
                <div ref={endRef} />
              </>
            )}
          </div>

          {sourceArticle === null && (
            <>
              {speechSupported && (
                <div className="chat-voice-notice">
                  🎙 El navegador usa el servicio de voz del sistema. Solo se envía el texto transcrito.
                </div>
              )}
              <form
                className="chat-compose"
                onSubmit={(event) => {
                  event.preventDefault()
                  void send()
                }}
              >
                {speechSupported && (
                  <button
                    type="button"
                    className={`chat-mic-btn ${listening ? 'active' : ''}`}
                    onClick={toggleVoice}
                    aria-label={listening ? 'Detener dictado por voz' : 'Dictar por voz (es-BO)'}
                    title={listening ? 'Detener dictado por voz' : 'Dictar por voz (es-BO)'}
                  >
                    {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
                <input
                  ref={inputRef}
                  aria-label="Pregunta para el asistente"
                  placeholder="Escribe tu pregunta o instrucción…"
                  value={question}
                  maxLength={350}
                  onChange={(event) => setQuestion(event.target.value)}
                />
                <button
                  type="submit"
                  disabled={question.trim().length < 3 || loading}
                  aria-label="Enviar pregunta"
                  title="Enviar pregunta"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </section>
      )}

      {sugerencia && (
        <div className="asistente-hint" role="status">
          <p>{sugerencia.texto}</p>
          <button
            type="button"
            aria-label="Cerrar sugerencia"
            title="Cerrar sugerencia"
            onClick={cerrarSugerencia}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <button
        className={`asistente-launcher${llamando ? ' llamando' : ''}`}
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Ocultar asistente' : 'Abrir asistente'}
        aria-expanded={open}
        title={open ? 'Ocultar asistente' : 'Abrir asistente'}
      >
        <AsistenteAvatar estado={estadoAvatar} />
      </button>
    </div>
  )
}

/** Wrapper para retrocompatibilidad directa */
export const ChatWidget = Asistente
