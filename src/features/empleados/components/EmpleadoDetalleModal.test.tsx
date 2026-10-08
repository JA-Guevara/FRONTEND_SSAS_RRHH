import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EmpleadoDetalleModal } from './EmpleadoDetalleModal'
import {
  obtenerEmpleado,
  type EmpleadoDetalle,
} from '../api/empleadosApi'

vi.mock('../api/empleadosApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/empleadosApi')>()
  return {
    ...actual,
    obtenerEmpleado: vi.fn(),
  }
})

const empleadoCompleto: EmpleadoDetalle = {
  id: 'emp-10',
  empresa_id: 'empresa-1',
  postulacion_id: 'post-uuid-999',
  codigo: 'EMP-010',
  nombres: 'Laura',
  apellido_paterno: 'Vargas',
  apellido_materno: null,
  ci: '1234567',
  ci_expedido: 'SC',
  fecha_nacimiento: '1995-04-12',
  genero: 'F',
  estado_civil: 'Soltera',
  direccion: 'Av. Las Palmas #123',
  telefono: '70012345',
  email_personal: 'laura@example.com',
  contacto_emergencia: 'Mamá',
  telefono_emergencia: '70098765',
  cargo_nombre: 'Analista QA',
  fecha_ingreso: '2024-02-01',
  fecha_salida: null,
  motivo_salida: null,
  estado: 'ACTIVO',
  nua_cua: '11223344',
  afp: 'Previsión',
  banco: 'Banco Unión',
  tipo_cuenta: 'Caja de ahorro',
  numero_cuenta: '10000045678912',
  foto_url: null,
  fecha_registro: '2024-02-01T10:00:00Z',
}

const empleadoConNulos: EmpleadoDetalle = {
  id: 'emp-20',
  empresa_id: 'empresa-1',
  postulacion_id: null,
  codigo: '',
  nombres: 'Pedro',
  apellido_paterno: 'Suárez',
  apellido_materno: null,
  ci: '',
  ci_expedido: '',
  fecha_nacimiento: null,
  genero: null,
  estado_civil: null,
  direccion: null,
  telefono: null,
  email_personal: null,
  contacto_emergencia: null,
  telefono_emergencia: null,
  cargo_nombre: null,
  fecha_ingreso: '2024-05-01',
  fecha_salida: null,
  motivo_salida: null,
  estado: 'ACTIVO',
  nua_cua: null,
  afp: null,
  banco: null,
  tipo_cuenta: null,
  numero_cuenta: null,
  foto_url: null,
  fecha_registro: '2024-05-01T00:00:00Z',
}

beforeEach(() => {
  vi.mocked(obtenerEmpleado).mockReset()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('EmpleadoDetalleModal', () => {
  it('muestra número de cuenta bancaria enmascarado y link al proceso de selección cuando existe', async () => {
    vi.mocked(obtenerEmpleado).mockResolvedValue(empleadoCompleto)

    render(
      <MemoryRouter>
        <EmpleadoDetalleModal
          empleadoId="emp-10"
          empresaId="empresa-1"
          onClose={vi.fn()}
        />
      </MemoryRouter>
    )

    expect(await screen.findByText('Ficha del empleado')).toBeInTheDocument()
    expect(screen.getByText('EMP-010')).toBeInTheDocument()
    expect(screen.getByText('Analista QA')).toBeInTheDocument()

    // Comprobar número de cuenta enmascarado (los últimos 4 dígitos visibles de 10000045678912)
    expect(screen.getByText('••••8912')).toBeInTheDocument()

    // Comprobar enlace a proceso de selección
    const linkSeleccion = screen.getByRole('link', {
      name: 'Ver proceso de selección',
    })
    expect(linkSeleccion).toBeInTheDocument()
    expect(linkSeleccion).toHaveAttribute(
      'href',
      '/seleccion?postulacion=post-uuid-999'
    )
  })

  it('muestra "Sin información" en campos nulos o no provistos y oculta el enlace de selección', async () => {
    vi.mocked(obtenerEmpleado).mockResolvedValue(empleadoConNulos)

    render(
      <MemoryRouter>
        <EmpleadoDetalleModal
          empleadoId="emp-20"
          empresaId="empresa-1"
          onClose={vi.fn()}
        />
      </MemoryRouter>
    )

    expect(await screen.findByText('Ficha del empleado')).toBeInTheDocument()

    // Varios campos deben tener "Sin información"
    const sinInfoList = screen.getAllByText('Sin información')
    expect(sinInfoList.length).toBeGreaterThan(3)

    // No debe existir el link al proceso de selección porque postulacion_id es null
    expect(
      screen.queryByRole('link', { name: 'Ver proceso de selección' })
    ).not.toBeInTheDocument()
  })
})
