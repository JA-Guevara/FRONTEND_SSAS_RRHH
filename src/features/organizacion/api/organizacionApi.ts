export type Departamento = {
  id: number
  nombre: string
  descripcion: string
  departamento_padre_id: number | null
  activo: boolean
}

export type Cargo = {
  id: number
  nombre: string
  departamento_id: number
  nivel: NivelCargo
  salario_min: number | null
  salario_max: number | null
  descripcion: string
  activo: boolean
}

export type NivelCargo =
  | 'OPERATIVO'
  | 'TECNICO'
  | 'PROFESIONAL'
  | 'SUPERVISOR'
  | 'GERENCIAL'

export const NIVELES_CARGO: NivelCargo[] = [
  'OPERATIVO',
  'TECNICO',
  'PROFESIONAL',
  'SUPERVISOR',
  'GERENCIAL',
]

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

let departamentos: Departamento[] = [
  { id: 1, nombre: 'Gerencia General', descripcion: 'Dirección de la empresa', departamento_padre_id: null, activo: true },
  { id: 2, nombre: 'Recursos Humanos', descripcion: 'Gestión de personal', departamento_padre_id: 1, activo: true },
  { id: 3, nombre: 'Tecnología', descripcion: 'Sistemas y desarrollo', departamento_padre_id: 1, activo: true },
  { id: 4, nombre: 'Desarrollo', descripcion: 'Software', departamento_padre_id: 3, activo: true },
  { id: 5, nombre: 'Contabilidad', descripcion: 'Finanzas', departamento_padre_id: 1, activo: true },
]

let cargos: Cargo[] = [
  { id: 1, nombre: 'Gerente General', departamento_id: 1, nivel: 'GERENCIAL', salario_min: 12000, salario_max: 18000, descripcion: 'Dirección estratégica', activo: true },
  { id: 2, nombre: 'Analista de RRHH', departamento_id: 2, nivel: 'PROFESIONAL', salario_min: 4500, salario_max: 6500, descripcion: 'Procesos de personal', activo: true },
  { id: 3, nombre: 'Desarrollador Backend', departamento_id: 4, nivel: 'PROFESIONAL', salario_min: 5500, salario_max: 8500, descripcion: 'APIs y base de datos', activo: true },
  { id: 4, nombre: 'Soporte Técnico', departamento_id: 3, nivel: 'TECNICO', salario_min: 3200, salario_max: 4500, descripcion: 'Mesa de ayuda', activo: true },
]

export async function getDepartamentos() {
  await delay()
  return [...departamentos]
}

export async function crearDepartamento(data: Omit<Departamento, 'id' | 'activo'>) {
  await delay()
  const nuevo: Departamento = { ...data, id: Date.now(), activo: true }
  departamentos = [...departamentos, nuevo]
  return nuevo
}

export async function actualizarDepartamento(id: number, data: Partial<Departamento>) {
  await delay()
  departamentos = departamentos.map((d) => (d.id === id ? { ...d, ...data } : d))
  return departamentos.find((d) => d.id === id)!
}

export async function getCargos() {
  await delay()
  return [...cargos]
}

export async function crearCargo(data: Omit<Cargo, 'id' | 'activo'>) {
  await delay()
  if (data.salario_min != null && data.salario_max != null && data.salario_min > data.salario_max) {
    throw new Error('El salario mínimo no puede ser mayor al máximo')
  }
  const nuevo: Cargo = { ...data, id: Date.now(), activo: true }
  cargos = [...cargos, nuevo]
  return nuevo
}

export async function actualizarCargo(id: number, data: Partial<Cargo>) {
  await delay()
  if (
    data.salario_min != null &&
    data.salario_max != null &&
    data.salario_min > data.salario_max
  ) {
    throw new Error('El salario mínimo no puede ser mayor al máximo')
  }
  cargos = cargos.map((c) => (c.id === id ? { ...c, ...data } : c))
  return cargos.find((c) => c.id === id)!
}