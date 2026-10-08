import { useState } from 'react'
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  DescriptionList,
  Drawer,
  FormRow,
  PageHeader,
  Select,
  Skeleton,
  Stat,
  Tabs,
  Toolbar,
  useToast,
} from '../../../shared/components'

export function SistemaVisualPage() {
  const [activeTab, setActiveTab] = useState('primitivos')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectValue, setSelectValue] = useState('opcion-1')
  const { showToast } = useToast()

  const tabs = [
    { id: 'primitivos', label: '11 Primitivos Compartidos' },
    { id: 'botones-badges', label: 'Botones y Badges' },
    { id: 'tokens', label: 'Tokens y Superficies' },
    { id: 'alertas-paneles', label: 'Alertas y Paneles' },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Entorno de Desarrollo"
        title="Catálogo del Sistema Visual"
        subtitle="Galería interactiva para inspección de los 11 primitivos, variantes de controles y tokens de diseño."
      />

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'primitivos' && (
        <div className="stack-lg">
          <section className="stack">
            <h2 className="text-lg text-strong">1. Card y Stat</h2>
            <div className="grid-auto">
              <Stat label="Total Usuarios" value="1,248" delta={{ value: '+12%', isPositive: true }} />
              <Stat label="Procesos Activos" value="24" delta={{ value: '+3 nuevos', isPositive: true }} />
              <Stat label="Tasa de Deserción" value="1.8%" delta={{ value: '-0.4%', isPositive: true }} />
              <Stat label="Alertas de Seguridad" value="0" delta={{ value: 'Al día', isPositive: true }} />
            </div>

            <div className="grid-2">
              <Card title="Tarjeta básica" subtitle="Contenedor de superficie con borde y sombra suave">
                <p className="text-sm text-muted">
                  Este es el contenido interno dentro de un Card primitivo usando tipografía y tokens estándar.
                </p>
              </Card>
              <Card
                title="Tarjeta con acciones"
                actions={
                  <Button variant="secondary" size="sm">
                    Acción
                  </Button>
                }
                footer={
                  <Button variant="primary" size="sm">
                    Guardar
                  </Button>
                }
              >
                <p className="text-sm text-muted">Card con slot de acciones en cabecera y pie de página.</p>
              </Card>
            </div>
          </section>

          <section className="stack">
            <h2 className="text-lg text-strong">2. Toolbar y Búsqueda</h2>
            <Toolbar>
              <div className="row-between" style={{ width: '100%' }}>
                <input className="input max-w-sm" placeholder="Buscar elementos en el catálogo..." />
                <div className="row">
                  <Button variant="secondary" size="sm">
                    Filtrar
                  </Button>
                  <Button variant="primary" size="sm">
                    Nuevo elemento
                  </Button>
                </div>
              </div>
            </Toolbar>
          </section>

          <section className="stack">
            <h2 className="text-lg text-strong">3. Select y FormRow</h2>
            <div className="grid-2">
              <FormRow label="Nombre completo" required hint="Ingrese nombres y apellidos tal como figuran en el documento">
                <input className="input" placeholder="Ej. Ana García" />
              </FormRow>

              <Select
                label="Tipo de documento"
                value={selectValue}
                onChange={setSelectValue}
                options={[
                  { value: 'opcion-1', label: 'Cédula de Identidad' },
                  { value: 'opcion-2', label: 'Pasaporte Extranjero' },
                  { value: 'opcion-3', label: 'Número de Identificación Tributaria' },
                ]}
              />
            </div>
          </section>

          <section className="stack">
            <h2 className="text-lg text-strong">4. Breadcrumb y DescriptionList</h2>
            <Breadcrumb
              items={[
                { label: 'Inicio', to: '/' },
                { label: 'Administración', to: '/usuarios' },
                { label: 'Catálogo Visual' },
              ]}
            />

            <DescriptionList
              items={[
                { label: 'Organización', value: 'SSAS Corporativo' },
                { label: 'Entorno', value: 'Desarrollo Local' },
                { label: 'Versión del Sistema Visual', value: 'Tokens v2.0' },
                { label: 'Cobertura de Pruebas', value: '89 de 89 pruebas verdes' },
              ]}
            />
          </section>

          <section className="stack">
            <h2 className="text-lg text-strong">5. Skeletons</h2>
            <div className="stack-sm">
              <Skeleton variant="text" rows={2} />
              <Skeleton variant="rect" />
              <div className="row">
                <Skeleton variant="circle" />
                <div className="stack-sm" style={{ flex: 1 }}>
                  <Skeleton variant="text" rows={2} />
                </div>
              </div>
            </div>
          </section>

          <section className="stack">
            <h2 className="text-lg text-strong">6. Toast y Drawer</h2>
            <div className="row-wrap">
              <Button
                variant="primary"
                onClick={() =>
                  showToast('El cambio fue registrado exitosamente con el sistema visual.', 'success')
                }
              >
                Disparar Toast Éxito
              </Button>

              <Button
                variant="danger"
                onClick={() =>
                  showToast('Ha ocurrido un error simulado para comprobar el toast.', 'error')
                }
              >
                Disparar Toast Error
              </Button>

              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Abrir Drawer Lateral
              </Button>
            </div>

            <Drawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              title="Panel lateral (Drawer)"
            >
              <div className="stack">
                <p className="text-sm text-muted">
                  Este panel lateral se desliza desde el lateral para filtros avanzados, detalles contextuales o
                  formularios rápidos sin abandonar la vista actual.
                </p>
                <FormRow label="Filtro rápido">
                  <input className="input" placeholder="Escriba aquí..." />
                </FormRow>
                <div className="form-actions mt-4">
                  <Button variant="primary" onClick={() => setDrawerOpen(false)}>
                    Entendido
                  </Button>
                </div>
              </div>
            </Drawer>
          </section>
        </div>
      )}

      {activeTab === 'botones-badges' && (
        <div className="stack-lg">
          <section className="stack">
            <h2 className="text-lg text-strong">Variantes de Botones</h2>
            <div className="row-wrap">
              <Button variant="primary">Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="danger">Peligro</Button>
              <Button variant="ghost">Fantasma</Button>
              <Button variant="primary" disabled>
                Deshabilitado
              </Button>
              <Button variant="primary" loading>
                Cargando
              </Button>
            </div>

            <h3 className="text-sm text-muted">Tamaños</h3>
            <div className="row-wrap items-center">
              <Button variant="primary" size="sm">
                Pequeño (sm)
              </Button>
              <Button variant="primary" size="md">
                Mediano (md)
              </Button>
              <Button variant="primary" size="lg">
                Grande (lg)
              </Button>
            </div>
          </section>

          <section className="stack">
            <h2 className="text-lg text-strong">Badges de Estado</h2>
            <div className="row-wrap">
              <Badge tone="brand">Marca</Badge>
              <Badge tone="success">Completado</Badge>
              <Badge tone="warning">Pendiente</Badge>
              <Badge tone="danger">Rechazado</Badge>
              <Badge tone="neutral">Borrador</Badge>
              <Badge tone="info">Información</Badge>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="stack-lg">
          <section className="stack">
            <h2 className="text-lg text-strong">Paleta de Marca y Superficies</h2>
            <div className="grid-auto">
              <div className="card text-center" style={{ background: 'var(--brand)', color: 'var(--paper)' }}>
                <strong>--brand</strong>
                <p className="text-sm">Color primario institucional</p>
              </div>
              <div className="card text-center" style={{ background: 'var(--surface-2)' }}>
                <strong className="text-strong">--surface-2</strong>
                <p className="text-sm text-muted">Superficie secundaria</p>
              </div>
              <div className="card text-center" style={{ background: 'var(--paper)' }}>
                <strong className="text-strong">--paper</strong>
                <p className="text-sm text-muted">Fondo de tarjetas elevadas</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'alertas-paneles' && (
        <div className="stack-lg">
          <section className="stack">
            <h2 className="text-lg text-strong">Alertas del Sistema</h2>
            <Alert tone="info" title="Mensaje informativo">
              Indica información contextual importante para la operación actual.
            </Alert>
            <Alert tone="success" title="Acción exitosa">
              La entidad ha sido creada o modificada satisfactoriamente.
            </Alert>
            <Alert tone="error" title="Error en el servidor">
              No se pudo completar la operación solicitada. Intente nuevamente.
            </Alert>
          </section>
        </div>
      )}
    </div>
  )
}
