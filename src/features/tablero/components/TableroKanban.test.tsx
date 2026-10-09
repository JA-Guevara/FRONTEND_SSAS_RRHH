import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableroKanban } from './TableroKanban'
import * as tableroApi from '../api/tableroApi'

vi.mock('../../../app/access/AccessProvider', () => ({
  useAccess: () => ({ can: () => true }),
  Can: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('../api/tableroApi', () => ({
  moverPostulacion: vi.fn(),
}))

afterEach(cleanup)

const etapas = [
  {
    id: 'e1',
    nombre: 'Recibidos',
    orden: 1,
    color: null,
    es_inicial: true,
    es_contratado: false,
    es_rechazado: false,
  },
  {
    id: 'e2',
    nombre: 'Evaluación Técnica',
    orden: 2,
    color: null,
    es_inicial: false,
    es_contratado: false,
    es_rechazado: false,
  },
]

const postulaciones = [
  {
    id: 'p1',
    postulante_id: 'pos-1',
    vacante_id: 'vac-1',
    vacante_titulo: 'Desarrollador',
    etapa_id: 'e1',
    etapa: 'Recibidos',
    nombre_postulante: 'María López',
    email: 'maria@example.com',
    telefono: '77788990',
    ciudad: 'La Paz',
    documento_identidad: '1234567',
    estado: 'EN_PROCESO',
    fecha_postulacion: '2026-10-02T14:30:00Z',
    experiencia_anios: 3,
    educacion: 'Licenciatura',
    cv_url: null,
    linkedin: null,
    motivo_rechazo: null,
    codigo_seguimiento: 'COD-123',
    puntaje_ia: 92,
    puntaje_manual: 88,
    habilidades_detectadas: ['React', 'TypeScript'],
    habilidades_faltantes: [],
  },
]

it('renders columns with candidate cards and IA match badges', () => {
  render(
    <TableroKanban
      etapas={etapas}
      postulaciones={postulaciones}
      empresaId="empresa-test"
      onChanged={vi.fn()}
    />,
  )

  expect(screen.getByText('Recibidos')).toBeInTheDocument()
  expect(screen.getByText('Evaluación Técnica')).toBeInTheDocument()
  expect(screen.getByText('María López')).toBeInTheDocument()
  expect(screen.getByText('92%')).toBeInTheDocument()
  expect(screen.getByText('Puntaje 88/100')).toBeInTheDocument()
})

it('triggers moverPostulacion when clicking move button to another stage', async () => {
  const user = userEvent.setup()
  const onChanged = vi.fn().mockResolvedValue(undefined)
  vi.mocked(tableroApi.moverPostulacion).mockResolvedValue({} as never)

  render(
    <TableroKanban
      etapas={etapas}
      postulaciones={postulaciones}
      empresaId="empresa-test"
      onChanged={onChanged}
    />,
  )

  const moverBtn = screen.getByRole('button', { name: 'Mover a Evaluación Técnica' })
  await user.click(moverBtn)

  expect(tableroApi.moverPostulacion).toHaveBeenCalledWith('p1', 'e2', 'empresa-test')
  expect(onChanged).toHaveBeenCalled()
})
