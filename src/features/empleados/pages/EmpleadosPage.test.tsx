import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EmpleadosPage } from './EmpleadosPage'
import {
  listarEmpleados,
  type EmpleadoListItem,
} from '../api/empleadosApi'

const scope = vi.hoisted(() => ({ selectedCompanyId: 'empresa-test' }))
vi.mock('../../../app/context/CompanyScopeContext', () => ({
  useCompanyScope: () => scope,
}))

vi.mock('../api/empleadosApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/empleadosApi')>()
  return {
    ...actual,
    listarEmpleados: vi.fn(),
  }
})

const mockEmpleados: EmpleadoListItem[] = [
  {
    id: 'emp-1',
    codigo: 'EMP-001',
    nombres: 'Carlos',
    apellido_paterno: 'Pérez',
    apellido_materno: 'García',
    cargo_nombre: 'Desarrollador Senior',
    fecha_ingreso: '2024-01-15',
    estado: 'ACTIVO',
  },
  {
    id: 'emp-2',
    codigo: 'EMP-002',
    nombres: 'María',
    apellido_paterno: 'López',
    apellido_materno: 'Roca',
    cargo_nombre: 'Diseñadora UX',
    fecha_ingreso: '2024-03-01',
    estado: 'ACTIVO',
  },
]

beforeEach(() => {
  scope.selectedCompanyId = 'empresa-test'
  vi.mocked(listarEmpleados).mockReset()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('EmpleadosPage', () => {
  it('muestra la grilla con datos después de la carga inicial', async () => {
    vi.mocked(listarEmpleados).mockResolvedValue({
      items: mockEmpleados,
      total: 2,
    })

    render(<EmpleadosPage />)

    // Verifica que se invoque a listarEmpleados con el scope actual
    await waitFor(() => {
      expect(listarEmpleados).toHaveBeenCalledWith(
        'empresa-test',
        expect.objectContaining({ limit: 10, offset: 0 })
      )
    })

    // Comprueba que los empleados se visualizan en la tabla
    expect(await screen.findByText('Carlos Pérez García')).toBeInTheDocument()
    expect(screen.getByText('EMP-001')).toBeInTheDocument()
    expect(screen.getByText('Desarrollador Senior')).toBeInTheDocument()
    expect(screen.getByText('María López Roca')).toBeInTheDocument()
    expect(screen.getByText('EMP-002')).toBeInTheDocument()
  })

  it('permite buscar por texto y re-ejecuta listarEmpleados con el término de búsqueda', async () => {
    vi.mocked(listarEmpleados).mockResolvedValue({
      items: mockEmpleados,
      total: 2,
    })

    render(<EmpleadosPage />)
    await screen.findByText('Carlos Pérez García')

    const inputBuscar = screen.getByPlaceholderText('Nombre, apellido o código...')
    const user = userEvent.setup()
    await user.type(inputBuscar, 'María')

    await waitFor(() => {
      expect(listarEmpleados).toHaveBeenCalledWith(
        'empresa-test',
        expect.objectContaining({ q: 'María', offset: 0, limit: 10 })
      )
    })
  })

  it('muestra un estado vacío con mensaje amigable cuando no hay empleados', async () => {
    vi.mocked(listarEmpleados).mockResolvedValue({
      items: [],
      total: 0,
    })

    render(<EmpleadosPage />)

    expect(await screen.findByText('Sin empleados')).toBeInTheDocument()
    expect(
      screen.getByText('Todavía no hay empleados registrados.')
    ).toBeInTheDocument()
  })

  it('muestra mensaje de error y permite reintentar con el botón', async () => {
    vi.mocked(listarEmpleados).mockRejectedValueOnce(
      new Error('Fallo de conexión al servidor')
    )

    render(<EmpleadosPage />)

    expect(
      await screen.findByText('Fallo de conexión al servidor')
    ).toBeInTheDocument()

    // Preparar resolución exitosa en reintento
    vi.mocked(listarEmpleados).mockResolvedValueOnce({
      items: mockEmpleados,
      total: 2,
    })

    const btnReintentar = screen.getByRole('button', { name: 'Reintentar' })
    const user = userEvent.setup()
    await user.click(btnReintentar)

    expect(await screen.findByText('Carlos Pérez García')).toBeInTheDocument()
  })
})
