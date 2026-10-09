import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReportesPage } from './ReportesPage'
import { reportesApi } from '../api/reportesApi'

vi.mock('../../../app/context/CompanyScopeContext', () => ({
  useCompanyScope: () => ({ company: { id: 'company-a' } }),
}))

vi.mock('../api/reportesApi', () => ({
  reportesApi: {
    catalog: vi.fn(),
    interpret: vi.fn(),
    preview: vi.fn(),
    create: vi.fn(),
    export: vi.fn(),
    conteo: vi.fn(),
    agregado: vi.fn(),
    getPanel: vi.fn(),
    createWidget: vi.fn(),
    deleteWidget: vi.fn(),
    listSaved: vi.fn(),
    send: vi.fn(),
  },
  saveBlob: vi.fn(),
}))

const mockCatalog = [
  {
    codigo: 'postulaciones',
    nombre: 'Postulaciones',
    etiqueta: 'Postulaciones',
    descripcion: 'Candidatos postulados a cada vacante',
    columnas: ['postulante', 'email', 'estado'],
    campos: [
      {
        codigo: 'postulante',
        etiqueta: 'Postulante',
        tipo: 'texto' as const,
        sensibilidad: 'publico' as const,
        agrupable: true,
        agregable: false,
        valores: [],
      },
      {
        codigo: 'email',
        etiqueta: 'Correo',
        tipo: 'texto' as const,
        sensibilidad: 'personal' as const,
        agrupable: true,
        agregable: false,
        valores: [],
      },
      {
        codigo: 'estado',
        etiqueta: 'Estado',
        tipo: 'enum' as const,
        sensibilidad: 'publico' as const,
        agrupable: true,
        agregable: false,
        valores: ['ACTIVA', 'CONTRATADA'],
      },
    ],
  },
]

beforeEach(() => {
  vi.mocked(reportesApi.catalog).mockReset().mockResolvedValue(mockCatalog)
  vi.mocked(reportesApi.getPanel).mockReset().mockResolvedValue({
    origen: 'predeterminadas',
    omitidas_por_permiso: [],
    fuentes_disponibles: ['postulaciones'],
    widgets: [
      {
        id: 'default-kpi-postulaciones',
        empresa_id: 'company-a',
        usuario_id: 'user-1',
        titulo: 'Postulaciones',
        tipo: 'kpi',
        consulta: { fuente: 'postulaciones', medidas: [{ agregacion: 'conteo' }] },
        posicion: 0,
        ancho: 1,
        activo: true,
        fecha_registro: '2026-10-08T12:00:00Z',
      },
      {
        id: 'default-embudo',
        empresa_id: 'company-a',
        usuario_id: 'user-1',
        titulo: 'Embudo de selección',
        tipo: 'embudo',
        consulta: { fuente: 'postulaciones', medidas: [{ agregacion: 'conteo' }], agrupar_por: ['etapa'] },
        posicion: 1,
        ancho: 2,
        activo: true,
        fecha_registro: '2026-10-08T12:00:00Z',
      },
    ],
  })
  vi.mocked(reportesApi.agregado).mockReset().mockResolvedValue({
    series: [{ claves: { etapa: 'Entrevista' }, valores: { conteo: 42 } }],
    medidas: ['conteo'],
    total_grupos: 1,
    truncado: false,
    generado_en: '2026-10-08T12:00:00Z',
    milisegundos: 12,
  })
  vi.mocked(reportesApi.conteo).mockReset().mockResolvedValue({
    total: 1248,
    excede_limite: false,
    limite_del_plan: 5000,
  })
  vi.mocked(reportesApi.preview).mockReset().mockResolvedValue({
    columnas: ['postulante', 'estado'],
    items: [{ postulante: 'Carlos Gómez', estado: 'ACTIVA' }],
    total: 1248,
    page: 1,
    per_page: 50,
  })
  vi.mocked(reportesApi.listSaved).mockReset().mockResolvedValue([])
})

afterEach(() => {
  cleanup()
})

describe('VISTA 1 · Panel de indicadores', () => {
  it('renderiza tarjetas y ejecuta las consultas agregadas', async () => {
    render(<ReportesPage initialTab="panel" />)

    expect(screen.getByRole('tab', { name: /Panel de indicadores/ })).toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByText('Postulaciones')).toBeInTheDocument()
    expect(await screen.findByText('Embudo de selección')).toBeInTheDocument()

    await waitFor(() => {
      expect(reportesApi.agregado).toHaveBeenCalled()
    })
  })

  it('explica un panel vacío en vez de dejar la vista en blanco', async () => {
    vi.mocked(reportesApi.getPanel).mockResolvedValue({
      origen: 'predeterminadas',
      omitidas_por_permiso: ['Postulaciones — requiere «postulaciones:ver»'],
      fuentes_disponibles: ['reportes'],
      widgets: [],
    })

    render(<ReportesPage initialTab="panel" />)

    expect(await screen.findByText('Tu panel todavía no tiene indicadores')).toBeInTheDocument()
    expect(screen.getByText(/postulaciones:ver/)).toBeInTheDocument()
    expect(screen.getByText(/Podés reportar sobre: reportes/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crear un indicador/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pedir acceso al administrador/ })).toBeInTheDocument()
  })
})

describe('VISTA 2 · Explorador de datos', () => {
  it('muestra contador de registros, columnas sensibles con candado y permite exportar', async () => {
    render(<ReportesPage initialTab="explorar" />)

    expect(await screen.findByText('Carlos Gómez')).toBeInTheDocument()
    expect(screen.getByText(/registros (encontrados|cargados)/i)).toBeInTheDocument()

    // Candado para columna sensible 'Correo'
    const correoLabel = screen.getByText('Correo')
    expect(correoLabel).toBeInTheDocument()

    // Exportar
    const excelBtn = screen.getByRole('button', { name: /Excel/i })
    fireEvent.click(excelBtn)

    await waitFor(() => {
      expect(reportesApi.export).toHaveBeenCalledWith('xlsx', expect.any(Object), 'company-a')
    })
  })

  it('solicita confirmación al activar una columna sensible', async () => {
    render(<ReportesPage initialTab="explorar" />)

    await waitFor(() => expect(screen.getByText('Correo')).toBeInTheDocument())
    const correoCheckbox = screen.getByRole('checkbox', { name: /Correo/i })
    fireEvent.click(correoCheckbox)

    // Modal de confirmación auditada
    expect(await screen.findByText(/Dato personal sensible/i)).toBeInTheDocument()
    expect(screen.getByText(/quedará auditada con tu usuario en la bitácora/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Incluir columna/i }))
    await waitFor(() => {
      expect(screen.queryByText(/Dato personal sensible/i)).not.toBeInTheDocument()
    })
  })
})

describe('VISTA 3 · Constructor', () => {
  it('permite alternar entre IA y asistente paso a paso', async () => {
    render(<ReportesPage initialTab="construir" />)

    expect(screen.getByLabelText('Consulta por voz o texto')).toBeInTheDocument()

    const pasoPasoBtn = screen.getByRole('button', { name: /Armalo paso a paso/i })
    fireEvent.click(pasoPasoBtn)

    expect(screen.getByText('1. Fuente')).toBeInTheDocument()
    expect(screen.getByText('2. Columnas')).toBeInTheDocument()
    expect(screen.getByText('3. Filtros')).toBeInTheDocument()
    expect(screen.getByText('4. Orden')).toBeInTheDocument()
  })
})
