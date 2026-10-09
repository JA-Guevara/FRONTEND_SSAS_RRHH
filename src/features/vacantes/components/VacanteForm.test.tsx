import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { VacanteForm } from './VacanteForm'
import * as vacantesApi from '../api/vacantesApi'
import * as habilidadesApi from '../../habilidades/api/habilidadesApi'

vi.mock('../api/vacantesApi', () => ({
  MODALIDADES: ['PRESENCIAL', 'HIBRIDO', 'REMOTO'],
  crearVacante: vi.fn(),
  actualizarVacante: vi.fn(),
}))

vi.mock('../../habilidades/api/habilidadesApi', () => ({
  listarHabilidades: vi.fn(),
}))

const cargosMock = [
  { id: 'c-1', nombre: 'Desarrollador Backend', departamento_nombre: 'TI', departamento_id: 'dep-1' },
  { id: 'c-2', nombre: 'Diseñador UX', departamento_nombre: 'Producto', departamento_id: 'dep-2' },
]

beforeEach(() => {
  vi.mocked(habilidadesApi.listarHabilidades).mockReset().mockResolvedValue([
    { id: 'h-1', nombre: 'TypeScript', categoria: 'Técnica' },
  ] as never)
  vi.mocked(vacantesApi.crearVacante).mockReset().mockResolvedValue({ id: 'vac-nueva' } as never)
})

afterEach(cleanup)

it('renders vacancy form sections and inputs properly', () => {
  render(
    <MemoryRouter>
      <VacanteForm cargos={cargosMock} empresaId="empresa-test" />
    </MemoryRouter>,
  )

  expect(screen.getByText('Datos de la vacante')).toBeInTheDocument()
  expect(screen.getByText('Detalle de la oferta')).toBeInTheDocument()
  expect(screen.getByLabelText(/Título del puesto/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Cargo de la estructura/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Guardar borrador/i })).toBeInTheDocument()
})

it('validates required fields before submitting', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <VacanteForm cargos={cargosMock} empresaId="empresa-test" />
    </MemoryRouter>,
  )

  const submitBtn = screen.getByRole('button', { name: /Guardar borrador/i })
  await user.click(submitBtn)

  expect(screen.getByText(/El título es obligatorio/i)).toBeInTheDocument()
  expect(vacantesApi.crearVacante).not.toHaveBeenCalled()
})
