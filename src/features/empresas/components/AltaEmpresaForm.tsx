import { useState, type FormEvent } from 'react'
import { empresasApi } from '../api/empresasApi'

export function AltaEmpresaForm({ onCreated }: { onCreated: () => void }) {
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await empresasApi.provision({
        empresa: {
          razon_social: String(form.get('razon_social')),
          nombre_comercial: String(form.get('nombre_comercial')),
          slug: String(form.get('slug')),
          nit: String(form.get('nit') || '') || null,
          email: String(form.get('empresa_email') || '') || null,
          telefono: String(form.get('telefono') || '') || null,
          ciudad: String(form.get('ciudad') || '') || null,
          direccion: String(form.get('direccion') || '') || null,
        },
        administrador: {
          nombre: String(form.get('admin_nombre')),
          apellido: String(form.get('admin_apellido')),
          email: String(form.get('admin_email')),
          username: String(form.get('admin_username')),
          password: String(form.get('admin_password')),
        },
      })
      event.currentTarget.reset()
      setMessage('Empresa y administrador creados correctamente.')
      onCreated()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo crear la empresa') }
  }

  return <form className="company-form" onSubmit={submit}>{message && <p className="notice">{message}</p>}<fieldset className="form-section"><legend>Empresa</legend><div className="form-grid"><label>Razón social<input name="razon_social" required /></label><label>Nombre comercial<input name="nombre_comercial" required /></label><label>Código de empresa<input name="slug" pattern="[a-zA-Z0-9-]+" required /></label><label>NIT<input name="nit" /></label><label>Correo<input name="empresa_email" type="email" /></label><label>Teléfono<input name="telefono" /></label><label>Ciudad<input name="ciudad" /></label><label>Dirección<input name="direccion" /></label></div></fieldset><fieldset className="form-section"><legend>Administrador inicial</legend><div className="form-grid"><label>Nombre<input name="admin_nombre" required /></label><label>Apellido<input name="admin_apellido" required /></label><label>Correo<input name="admin_email" type="email" required /></label><label>Usuario<input name="admin_username" minLength={3} required /></label><label>Contraseña temporal<input name="admin_password" type="password" minLength={12} maxLength={72} required /></label></div></fieldset><button className="button button-primary" type="submit">Crear empresa</button></form>
}
