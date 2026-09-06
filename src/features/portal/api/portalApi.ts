export type EmpresaPublica = {
  slug: string
  nombre_comercial: string
  ciudad: string
}

export type VacantePublica = {
  id: number
  titulo: string
  descripcion: string
  requisitos: string
  beneficios: string
  modalidad: string
  ubicacion: string
  fecha_cierre: string
  mostrar_salario: boolean
  salario_min: number | null
  salario_max: number | null
}

export type NivelEducativo =
  | 'SECUNDARIA'
  | 'TECNICO'
  | 'LICENCIATURA'
  | 'MAESTRIA'
  | 'DOCTORADO'

export const NIVELES_EDUCATIVOS: NivelEducativo[] = [
  'SECUNDARIA',
  'TECNICO',
  'LICENCIATURA',
  'MAESTRIA',
  'DOCTORADO',
]

export type PostulacionFormData = {
  nombres: string
  apellidos: string
  ci: string
  email: string
  telefono: string
  ciudad: string
  nivel_educativo: NivelEducativo | ''
  anios_experiencia: string
  linkedin: string
  cv: File | null
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

const EMPRESAS: Record<string, EmpresaPublica> = {
  'textiles-del-oriente': {
    slug: 'textiles-del-oriente',
    nombre_comercial: 'Textiles del Oriente',
    ciudad: 'Santa Cruz de la Sierra',
  },
}

const VACANTES: VacantePublica[] = [
  {
    id: 3,
    titulo: 'Desarrollador Backend Semi Senior',
    descripcion: 'Desarrollo de APIs y servicios internos.',
    requisitos: 'Licenciatura en Sistemas o afín.',
    beneficios: 'Seguro de salud, horario flexible',
    modalidad: 'HIBRIDO',
    ubicacion: 'Santa Cruz',
    fecha_cierre: '2026-09-10',
    mostrar_salario: true,
    salario_min: 5500,
    salario_max: 8500,
  },
  {
    id: 4,
    titulo: 'Auxiliar Contable',
    descripcion: 'Apoyo en registros contables y conciliaciones.',
    requisitos: 'Estudiante o egresado de Contaduría.',
    beneficios: 'Capacitación interna',
    modalidad: 'PRESENCIAL',
    ubicacion: 'Santa Cruz',
    fecha_cierre: '2026-09-15',
    mostrar_salario: false,
    salario_min: null,
    salario_max: null,
  },
]

export async function getEmpresaPublica(slug: string) {
  await delay()
  const empresa = EMPRESAS[slug]
  if (!empresa) throw new Error('Empresa no encontrada')
  return empresa
}

export async function getVacantesPublicas(_slug: string) {
  await delay()
  return [...VACANTES]
}

export async function getVacantePublica(id: number) {
  await delay()
  const vacante = VACANTES.find((v) => v.id === id)
  if (!vacante) throw new Error('Vacante no encontrada')
  return vacante
}

export async function enviarPostulacion(_vacanteId: number, data: PostulacionFormData) {
  await delay(700)
  if (data.cv && data.cv.size > 5 * 1024 * 1024) {
    const error = new Error('El CV no puede superar 5 MB') as Error & { fields?: Record<string, string> }
    error.fields = { cv: 'Máximo 5 MB' }
    throw error
  }
  const codigo = `TX-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  return { codigo_seguimiento: codigo }
}