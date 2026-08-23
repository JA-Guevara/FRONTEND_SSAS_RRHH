import { AltaEmpresaForm } from '../components/AltaEmpresaForm'

export function AltaEmpresaPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Alta de empresa</h1>
      <p style={{ color: '#6b7280' }}>
        Completa los datos de la empresa. Los campos son obligatorios.
      </p>
      <AltaEmpresaForm />
    </div>
  )
}