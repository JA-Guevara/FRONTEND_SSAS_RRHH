import { ApiError } from '../../../shared/api/httpClient'

export type Etapa = {
  id: number
  nombre: string
  orden: number
  color: string
}

export type EstadoPostulacion = 'EN_PROCESO' | 'CONTRATADO' | 'RECHAZADO'

export type NotaPostulante = {
  id: number
  autor: string
  texto: string
  fecha: string
}

export type PostulanteDetalle = {
  id: number
  vacante_id: number
  vacante_titulo: string
  etapa_id: number
  nombre_postulante: string
  email: string
  telefono: string
  ciudad: string
  documento_identidad: string
  fecha_postulacion: string
  expectativa_salarial: number | null
  experiencia_anios: number
  educacion: string
  resumen_profesional: string
  cv_nombre_archivo: string
  cv_contenido_texto: string
  puntaje_manual: number | null
  estado: EstadoPostulacion
  motivo_rechazo: string | null
  notas_rechazo: string | null
  fecha_rechazo: string | null
  notas: NotaPostulante[]
}

// Compatibilidad con el tipo TarjetaPostulacion
export type TarjetaPostulacion = PostulanteDetalle

export const MOTIVOS_RECHAZO = [
  'No cumple con los requisitos técnicos',
  'Expectativa salarial fuera del presupuesto',
  'Experiencia laboral insuficiente para el cargo',
  'No superó la evaluación técnica / psicotécnica',
  'No se presentó a la entrevista / Sin respuesta',
  'Vacante cubierta por otro candidato',
  'Perfil sobrecalificado',
  'Disponibilidad horaria incompatible',
  'Otro motivo',
] as const

export const ETAPAS: Etapa[] = [
  { id: 1, nombre: 'Postulación', orden: 1, color: '#E7EFE6' },
  { id: 2, nombre: 'Preselección', orden: 2, color: '#E7EFE6' },
  { id: 3, nombre: 'Entrevista', orden: 3, color: '#E7EFE6' },
  { id: 4, nombre: 'Oferta', orden: 4, color: '#E7EFE6' },
  { id: 5, nombre: 'Contratado', orden: 5, color: '#E7EFE6' },
]

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

let postulaciones: PostulanteDetalle[] = [
  {
    id: 1,
    vacante_id: 1,
    vacante_titulo: 'Desarrollador Backend Semi Senior',
    etapa_id: 1,
    nombre_postulante: 'Julia Quispe',
    email: 'julia.quispe@ejemplo.com',
    telefono: '+591 71029384',
    ciudad: 'Santa Cruz de la Sierra',
    documento_identidad: '7829103 SC',
    fecha_postulacion: '2026-08-20',
    expectativa_salarial: 6500,
    experiencia_anios: 3,
    educacion: 'Lic. en Ingeniería de Sistemas - UAGRM (2022)',
    resumen_profesional: 'Desarrolladora de software con 3 años de experiencia en Python, FastAPI, PostgreSQL y Docker. Interés en microservicios y clean architecture.',
    cv_nombre_archivo: 'CV_Julia_Quispe_2026.pdf',
    cv_contenido_texto: `CURRÍCULUM VITAE
----------------------------------------
Nombre: Julia Quispe
Profesión: Ingeniera de Sistemas
Email: julia.quispe@ejemplo.com
Teléfono: +591 71029384
Ubicación: Santa Cruz de la Sierra

PERFIL PROFESIONAL:
Desarrolladora Backend con amplia experiencia en APIs REST, Python, FastAPI, PostgreSQL, Git y Docker. Enfoque en código mantenible, testing unitario y diseño modular.

EXPERIENCIA LABORAL:
- Software Engineer Jr. en Datatech S.R.L. (2023 - 2025):
  * Desarrollo de microservicios en Python y FastAPI.
  * Optimización de consultas PostgreSQL y reducción del 30% en latencia.
  * Mantenimiento de pipelines CI/CD en GitHub Actions.

EDUCACIÓN:
- Licenciatura en Ingeniería de Sistemas - UAGRM (Graduada con honores, 2022).

HABILIDADES:
- Python, FastAPI, Django, PostgreSQL, Docker, Git, REST APIs, Linux.`,
    puntaje_manual: 80,
    estado: 'EN_PROCESO',
    motivo_rechazo: null,
    notas_rechazo: null,
    fecha_rechazo: null,
    notas: [
      {
        id: 101,
        autor: 'Analista de Selección',
        texto: 'Perfil técnico alineado a la vacante. Buen manejo de FastAPI.',
        fecha: '2026-08-20 14:30',
      },
    ],
  },
  {
    id: 2,
    vacante_id: 1,
    vacante_titulo: 'Desarrollador Backend Semi Senior',
    etapa_id: 1,
    nombre_postulante: 'Marco Terceros',
    email: 'marco.terceros@ejemplo.com',
    telefono: '+591 78492011',
    ciudad: 'Santa Cruz de la Sierra',
    documento_identidad: '6391024 SC',
    fecha_postulacion: '2026-08-21',
    expectativa_salarial: 7000,
    experiencia_anios: 2,
    educacion: 'Ingeniería Informática - UPSA (2023)',
    resumen_profesional: 'Ingeniero informático con foco en desarrollo backend con Node.js y Python. Manejo de bases de datos relacionales y no relacionales.',
    cv_nombre_archivo: 'CV_Marco_Terceros.pdf',
    cv_contenido_texto: `CURRÍCULUM VITAE
----------------------------------------
Nombre: Marco Terceros
Profesión: Ingeniero Informático
Email: marco.terceros@ejemplo.com
Teléfono: +591 78492011

EXPERIENCIA LABORAL:
- Desarrollador Backend en InnovaTech (2023 - 2026)
  * Construcción de servicios REST y GraphQL.
  * Integración con pasarelas de pago y webhooks.`,
    puntaje_manual: 70,
    estado: 'EN_PROCESO',
    motivo_rechazo: null,
    notas_rechazo: null,
    fecha_rechazo: null,
    notas: [],
  },
  {
    id: 3,
    vacante_id: 1,
    vacante_titulo: 'Desarrollador Backend Semi Senior',
    etapa_id: 1,
    nombre_postulante: 'Rosa Mamani',
    email: 'rosa.mamani@ejemplo.com',
    telefono: '+591 69023451',
    ciudad: 'La Paz',
    documento_identidad: '8930192 LP',
    fecha_postulacion: '2026-08-21',
    expectativa_salarial: 8000,
    experiencia_anios: 1,
    educacion: 'Técnico Superior en Sistemas - Instituto Tecnológico (2024)',
    resumen_profesional: 'Desarrolladora inicial con conocimientos en PHP y MySQL.',
    cv_nombre_archivo: 'CV_Rosa_Mamani.pdf',
    cv_contenido_texto: `CURRÍCULUM VITAE
----------------------------------------
Nombre: Rosa Mamani
Teléfono: +591 69023451
Email: rosa.mamani@ejemplo.com
Educación: Técnico Superior en Sistemas`,
    puntaje_manual: 55,
    estado: 'EN_PROCESO',
    motivo_rechazo: null,
    notas_rechazo: null,
    fecha_rechazo: null,
    notas: [],
  },
  {
    id: 4,
    vacante_id: 1,
    vacante_titulo: 'Desarrollador Backend Semi Senior',
    etapa_id: 2,
    nombre_postulante: 'Renata Suárez',
    email: 'renata.suarez@ejemplo.com',
    telefono: '+591 75019283',
    ciudad: 'Santa Cruz de la Sierra',
    documento_identidad: '5920194 SC',
    fecha_postulacion: '2026-08-18',
    expectativa_salarial: 7500,
    experiencia_anios: 4,
    educacion: 'Lic. en Ingeniería de Software - UTEPSA (2021)',
    resumen_profesional: 'Especialista en arquitectura backend con Python y Go. Experiencia liderando proyectos de microservicios de alto tráfico.',
    cv_nombre_archivo: 'CV_Renata_Suarez.pdf',
    cv_contenido_texto: `CURRÍCULUM VITAE
----------------------------------------
Nombre: Renata Suárez
Profesión: Ingeniera de Software
Email: renata.suarez@ejemplo.com

EXPERIENCIA LABORAL:
- Líder Técnico Backend en CloudBolivia (2022 - 2026)
  * Arquitectura cloud en AWS y GCP.
  * Implementación de microservicios con FastAPI y Redis.`,
    puntaje_manual: 85,
    estado: 'EN_PROCESO',
    motivo_rechazo: null,
    notas_rechazo: null,
    fecha_rechazo: null,
    notas: [
      {
        id: 102,
        autor: 'Jefe de Tecnología',
        texto: 'Excelente resultado en prueba técnica de arquitectura (85/100). Pasa a entrevista.',
        fecha: '2026-08-22 10:15',
      },
    ],
  },
  {
    id: 5,
    vacante_id: 1,
    vacante_titulo: 'Desarrollador Backend Semi Senior',
    etapa_id: 3,
    nombre_postulante: 'Diego Roca',
    email: 'diego.roca@ejemplo.com',
    telefono: '+591 76049281',
    ciudad: 'Cochabamba',
    documento_identidad: '6829104 CB',
    fecha_postulacion: '2026-08-16',
    expectativa_salarial: 6800,
    experiencia_anios: 3,
    educacion: 'Lic. en Informática - UMSS (2022)',
    resumen_profesional: 'Desarrollador enfocado en Python, Django y FastAPI. Experiencia en metodologías ágiles SCRUM.',
    cv_nombre_archivo: 'CV_Diego_Roca.pdf',
    cv_contenido_texto: `CURRÍCULUM VITAE
----------------------------------------
Nombre: Diego Roca
Profesión: Licenciado en Informática
Email: diego.roca@ejemplo.com`,
    puntaje_manual: 78,
    estado: 'EN_PROCESO',
    motivo_rechazo: null,
    notas_rechazo: null,
    fecha_rechazo: null,
    notas: [
      {
        id: 103,
        autor: 'Recursos Humanos',
        texto: 'Entrevista por competencias muy favorable. Se coordina entrevista técnica final.',
        fecha: '2026-08-24 16:00',
      },
    ],
  },
  {
    id: 6,
    vacante_id: 1,
    vacante_titulo: 'Desarrollador Backend Semi Senior',
    etapa_id: 4,
    nombre_postulante: 'Pablo Arias',
    email: 'pablo.arias@ejemplo.com',
    telefono: '+591 70019284',
    ciudad: 'Santa Cruz de la Sierra',
    documento_identidad: '4920194 SC',
    fecha_postulacion: '2026-08-12',
    expectativa_salarial: 8000,
    experiencia_anios: 4,
    educacion: 'Lic. en Ingeniería de Sistemas - NUR (2021)',
    resumen_profesional: 'Desarrollador backend senior con dominio de Python, FastAPI y PostgreSQL.',
    cv_nombre_archivo: 'CV_Pablo_Arias.pdf',
    cv_contenido_texto: `CURRÍCULUM VITAE
----------------------------------------
Nombre: Pablo Arias
Profesión: Ingeniero de Sistemas
Email: pablo.arias@ejemplo.com`,
    puntaje_manual: 90,
    estado: 'EN_PROCESO',
    motivo_rechazo: null,
    notas_rechazo: null,
    fecha_rechazo: null,
    notas: [
      {
        id: 104,
        autor: 'Gerente General',
        texto: 'Aprobada la oferta económica de Bs. 7,800. Pendiente de firma de contrato.',
        fecha: '2026-08-28 11:30',
      },
    ],
  },
]

export async function getEtapas(): Promise<Etapa[]> {
  await delay(100)
  return [...ETAPAS].sort((a, b) => a.orden - b.orden)
}

export async function getPostulaciones(vacanteId?: number): Promise<PostulanteDetalle[]> {
  await delay(150)
  if (vacanteId != null) {
    return postulaciones.filter((p) => p.vacante_id === Number(vacanteId))
  }
  return [...postulaciones]
}

export async function getPostulante(id: number): Promise<PostulanteDetalle> {
  await delay(150)
  const postulante = postulaciones.find((p) => p.id === id)
  if (!postulante) throw new ApiError('Postulante no encontrado', 404)
  return { ...postulante }
}

export async function moverPostulacion(id: number, etapa_id: number): Promise<PostulanteDetalle> {
  await delay(150)
  const index = postulaciones.findIndex((p) => p.id === id)
  if (index === -1) throw new ApiError('Postulante no encontrado', 404)

  postulaciones[index] = { ...postulaciones[index], etapa_id }
  return { ...postulaciones[index] }
}

/**
 * T1-16: Rechazar postulante con motivo y notas opcionales.
 */
export async function rechazarPostulante(
  id: number,
  data: { motivo_rechazo: string; notas_rechazo?: string },
): Promise<PostulanteDetalle> {
  await delay(250)
  if (!data.motivo_rechazo || !data.motivo_rechazo.trim()) {
    throw new ApiError('Debes seleccionar un motivo de rechazo válido.', 400)
  }

  const index = postulaciones.findIndex((p) => p.id === id)
  if (index === -1) throw new ApiError('Postulante no encontrado', 404)

  const now = new Date()
  const fechaStr = now.toLocaleDateString('es-BO') + ' ' + now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

  const notasActualizadas = [...postulaciones[index].notas]
  if (data.notas_rechazo?.trim()) {
    notasActualizadas.push({
      id: Date.now(),
      autor: 'Reclutador / Sistema',
      texto: `Postulación rechazada por: "${data.motivo_rechazo}". Observación: ${data.notas_rechazo.trim()}`,
      fecha: fechaStr,
    })
  }

  postulaciones[index] = {
    ...postulaciones[index],
    estado: 'RECHAZADO',
    motivo_rechazo: data.motivo_rechazo.trim(),
    notas_rechazo: data.notas_rechazo?.trim() || null,
    fecha_rechazo: fechaStr,
    notas: notasActualizadas,
  }

  return { ...postulaciones[index] }
}

/**
 * T1-16: Agregar nota interna al postulante.
 */
export async function agregarNotaPostulante(
  id: number,
  texto: string,
  autor = 'Reclutador',
): Promise<PostulanteDetalle> {
  await delay(150)
  if (!texto || !texto.trim()) {
    throw new ApiError('La nota no puede estar vacía.', 400)
  }

  const index = postulaciones.findIndex((p) => p.id === id)
  if (index === -1) throw new ApiError('Postulante no encontrado', 404)

  const now = new Date()
  const fechaStr = now.toLocaleDateString('es-BO') + ' ' + now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

  const nuevaNota: NotaPostulante = {
    id: Date.now(),
    autor,
    texto: texto.trim(),
    fecha: fechaStr,
  }

  postulaciones[index] = {
    ...postulaciones[index],
    notas: [nuevaNota, ...postulaciones[index].notas],
  }

  return { ...postulaciones[index] }
}

/**
 * T1-16: Actualizar puntaje manual del postulante.
 */
export async function actualizarPuntajePostulante(
  id: number,
  puntaje: number,
): Promise<PostulanteDetalle> {
  await delay(150)
  const index = postulaciones.findIndex((p) => p.id === id)
  if (index === -1) throw new ApiError('Postulante no encontrado', 404)

  postulaciones[index] = {
    ...postulaciones[index],
    puntaje_manual: Math.max(0, Math.min(100, Math.round(puntaje))),
  }

  return { ...postulaciones[index] }
}

/**
 * T1-16: Descarga de archivo de CV en el navegador.
 */
export function descargarCV(postulante: PostulanteDetalle) {
  const contenido = postulante.cv_contenido_texto || `Currículum Vitae\nCandidato: ${postulante.nombre_postulante}\nEmail: ${postulante.email}\nTel: ${postulante.telefono}`
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = postulante.cv_nombre_archivo || `CV_${postulante.nombre_postulante.replace(/\s+/g, '_')}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}