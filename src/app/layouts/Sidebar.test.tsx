import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar, type SidebarProps } from './Sidebar'
import type { User } from '../../features/auth/context/AuthContext'
import type { components } from '../../shared/api/schema'

const { obtenerSesionesMock } = vi.hoisted(() => ({ obtenerSesionesMock: vi.fn() }))

vi.mock('../../features/perfil/api/perfilApi', () => ({
  perfilApi: { obtenerSesiones: obtenerSesionesMock },
}))

type Empresa = components['schemas']['EmpresaResponse']

const user: User = {
  id: 'u-1',
  name: 'Ana Pérez',
  email: 'ana@empresa.test',
  roles: ['Administrador', 'Reclutador'],
  permissions: [],
  modulos: [],
  realm: 'tenant',
  empresaId: 'e-1',
  is_active: true,
  email_verified: true,
}

const company = { id: 'e-1', nombre_comercial: 'BoliviaTech' } as Empresa

function renderSidebar(props: Partial<SidebarProps> = {}) {
  return render(
    <MemoryRouter>
      <Sidebar
        menuOpen={false}
        onToggleMenu={vi.fn()}
        onCloseMenu={vi.fn()}
        grupos={new Map()}
        expandedGroup={null}
        onToggleGroup={vi.fn()}
        user={user}
        onLogout={vi.fn()}
        company={company}
        companies={[company]}
        onSelectCompany={vi.fn()}
        onClearCompany={vi.fn()}
        accessToken="token-de-prueba"
        {...props}
      />
    </MemoryRouter>,
  )
}

async function abrirMenu() {
  const trigger = screen.getByRole('button', { name: /Ana Pérez/ })
  await userEvent.click(trigger)
  return screen.getByRole('menu', { name: 'Menú de cuenta' })
}

describe('Sidebar · menú de cuenta con datos reales', () => {
  beforeEach(() => {
    obtenerSesionesMock.mockReset()
    obtenerSesionesMock.mockResolvedValue([])
  })

  afterEach(cleanup)

  it('muestra foto, nombre, correo, rol activo y empresa activa', async () => {
    renderSidebar()
    const menu = await abrirMenu()

    expect(menu).toBeVisible()
    expect(screen.getByText('ana@empresa.test')).toBeVisible()
    expect(screen.getByText('Rol: Administrador')).toBeVisible()
    expect(screen.getByText('Empresa: BoliviaTech')).toBeVisible()
  })

  it('indica desde cuándo dura la sesión actual', async () => {
    const inicio = new Date(Date.now() - (2 * 60 + 5) * 60_000).toISOString()
    obtenerSesionesMock.mockResolvedValue([
      { es_actual: true, inicio },
      { es_actual: false, inicio: new Date().toISOString() },
    ])

    renderSidebar()
    await abrirMenu()

    expect(await screen.findByText('Conectado desde hace 2 h')).toBeVisible()
    expect(obtenerSesionesMock).toHaveBeenCalledWith('token-de-prueba')
  })

  it('muestra una sesión genérica si el servicio no responde', async () => {
    obtenerSesionesMock.mockRejectedValue(new Error('sin red'))

    renderSidebar()
    await abrirMenu()

    expect(await screen.findByText('Sesión activa')).toBeVisible()
  })

  it('omite la empresa cuando no hay alcance activo', async () => {
    renderSidebar({ company: null })
    await abrirMenu()

    expect(screen.queryByText(/^Empresa:/)).not.toBeInTheDocument()
    expect(screen.getByText('Rol: Administrador')).toBeVisible()
  })

  it('no consulta la sesión sin token de acceso', async () => {
    renderSidebar({ accessToken: null })
    await abrirMenu()

    expect(obtenerSesionesMock).not.toHaveBeenCalled()
    expect(screen.getByText('Sesión activa')).toBeVisible()
  })
})
