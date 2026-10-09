import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../auth/context/AuthContext'
import type { AuthContextValue } from '../../auth/context/AuthContext'
import { CuentaPage } from './CuentaPage'

vi.mock('../../perfil/api/perfilApi', () => ({
  perfilApi: {
    obtenerMiPerfil: vi.fn().mockResolvedValue({
      id: 'user-abc',
      nombre: 'Jose',
      apellido: 'Guevara',
      email: 'jose@empresa.com',
      username: 'jguevara',
      telefono: '70000000',
      foto_url: null,
    }),
    actualizarMiPerfil: vi.fn().mockResolvedValue({}),
    subirFoto: vi.fn().mockResolvedValue({ foto_url: '/api/v1/usuarios/user-abc/foto' }),
    eliminarFoto: vi.fn().mockResolvedValue({}),
    obtenerSesiones: vi.fn().mockResolvedValue([
      {
        id: 'sess-1',
        dispositivo: 'Chrome en Windows',
        ip: '190.181.10.20',
        inicio: new Date().toISOString(),
        expira_en: new Date().toISOString(),
        es_actual: true,
      },
    ]),
    cerrarSesion: vi.fn().mockResolvedValue({}),
    cerrarTodasSesiones: vi.fn().mockResolvedValue({}),
    obtenerActividad: vi.fn().mockResolvedValue([
      {
        id: 'act-1',
        modulo: 'AUTH',
        accion: 'LOGIN_EXITOSO',
        descripcion: 'Inicio de sesión exitoso',
        ip_origen: '190.181.10.20',
        fecha: new Date().toISOString(),
      },
    ]),
  },
}))

const mockUser: AuthContextValue = {
  accessToken: 'test-token',
  status: 'authenticated',
  user: {
    id: 'user-abc',
    name: 'Jose Guevara',
    email: 'jose@empresa.com',
    username: 'jguevara',
    roles: ['Reclutador'],
    permissions: ['postulaciones:ver'],
    modulos: ['RECLUTAMIENTO'],
    realm: 'tenant',
    empresaId: 'emp-1',
    is_active: true,
    email_verified: true,
  },
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
}

describe('CuentaPage', () => {
  it('renders all 6 navigation tabs and allows switching', async () => {
    const user = userEvent.setup()

    render(
      <AuthContext.Provider value={mockUser}>
        <MemoryRouter initialEntries={['/cuenta']}>
          <CuentaPage />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Mi Cuenta' })).toBeInTheDocument()

    // 6 tabs exist
    expect(screen.getByRole('button', { name: /Perfil/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Seguridad/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sesiones/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Preferencias/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Notificaciones/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mi actividad/ })).toBeInTheDocument()

    // Default tab is Perfil
    expect(screen.getByRole('heading', { level: 2, name: 'Información personal' })).toBeInTheDocument()

    // Switch to Seguridad
    await user.click(screen.getByRole('button', { name: /Seguridad/ }))
    expect(screen.getByRole('heading', { level: 2, name: 'Seguridad y contraseña' })).toBeInTheDocument()

    // Switch to Sesiones
    await user.click(screen.getByRole('button', { name: /Sesiones/ }))
    expect(screen.getByRole('heading', { level: 2, name: 'Sesiones activas' })).toBeInTheDocument()

    // Switch to Preferencias
    await user.click(screen.getByRole('button', { name: /Preferencias/ }))
    expect(screen.getByRole('heading', { level: 2, name: 'Preferencias del sistema' })).toBeInTheDocument()

    // Switch to Notificaciones
    await user.click(screen.getByRole('button', { name: /Notificaciones/ }))
    expect(screen.getByRole('heading', { level: 2, name: 'Canales de notificación' })).toBeInTheDocument()

    // Switch to Mi actividad
    await user.click(screen.getByRole('button', { name: /Mi actividad/ }))
    expect(screen.getByRole('heading', { level: 2, name: 'Mi actividad reciente' })).toBeInTheDocument()
  })
})
