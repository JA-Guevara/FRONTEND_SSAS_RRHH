import { ParametrosLeyForm } from '../components/ParametrosLeyForm'

export function ParametrosLeyPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Parámetros de ley</h1>
      <p style={{ color: '#6b7280' }}>
        Configura los valores legales usados en nómina. Validación en cliente y confirmación al guardar.
      </p>
      <ParametrosLeyForm />
    </div>
  )
}
