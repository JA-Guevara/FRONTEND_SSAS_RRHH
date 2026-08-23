export type EmpresaFormData = {
  razon_social: string
  nombre_comercial: string
  nit: string
  direccion: string
  ciudad: string
  telefono: string
  email: string
}

// Mock: simula guardar en el backend
export async function crearEmpresa(data: EmpresaFormData): Promise<{ id: number; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Validación simulada de NIT duplicado
  if (data.nit.trim() === '1234567890') {
    throw new Error('Ya existe una empresa con este NIT')
  }

  return {
    id: Math.floor(Math.random() * 1000) + 1,
    message: 'Empresa registrada correctamente',
  }
}