/** Espejo exacto de `auth/domain/password_policy.py` del backend.
 *
 *  Se replica en el cliente para que el usuario vea qué le falta ANTES de enviar,
 *  en lugar de descubrirlo con un 422. El backend sigue siendo la autoridad: esto
 *  no sustituye su validación, solo la anticipa.
 */

const CONTRASENAS_COMUNES = new Set([
  '123456789012',
  'administrador',
  'contraseña123',
  'password1234',
  'qwerty123456',
])

export type RequisitoPassword = {
  id: string
  texto: string
  cumple: boolean
}

/**
 * @param password contraseña a evaluar
 * @param valoresPersonales username y correo: la contraseña no puede contenerlos
 */
export function evaluarPassword(password: string, ...valoresPersonales: (string | null | undefined)[]): RequisitoPassword[] {
  const normalizada = password.toLowerCase()
  const contienePersonal = valoresPersonales.some((valor) => {
    if (!valor) return false
    const candidato = valor.split('@', 1)[0].trim().toLowerCase()
    return candidato.length >= 3 && normalizada.includes(candidato)
  })

  return [
    { id: 'longitud', texto: 'Al menos 12 caracteres', cumple: password.length >= 12 },
    { id: 'maximo', texto: 'Máximo 72 caracteres', cumple: password.length <= 72 },
    { id: 'minuscula', texto: 'Una letra minúscula', cumple: /[a-z]/.test(password) },
    { id: 'mayuscula', texto: 'Una letra mayúscula', cumple: /[A-Z]/.test(password) },
    { id: 'numero', texto: 'Un número', cumple: /\d/.test(password) },
    { id: 'especial', texto: 'Un carácter especial', cumple: /[^A-Za-z0-9\s]/.test(password) },
    { id: 'sin-espacios', texto: 'Sin espacios', cumple: password.length > 0 && !/\s/.test(password) },
    { id: 'no-comun', texto: 'No ser una contraseña común', cumple: !CONTRASENAS_COMUNES.has(normalizada) },
    {
      id: 'sin-datos-personales',
      texto: 'No contener el usuario ni el correo',
      cumple: !contienePersonal,
    },
  ]
}

export function passwordEsValida(password: string, ...valoresPersonales: (string | null | undefined)[]): boolean {
  return evaluarPassword(password, ...valoresPersonales).every((requisito) => requisito.cumple)
}

const MINUSCULAS = 'abcdefghijkmnopqrstuvwxyz'
const MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const NUMEROS = '23456789'
const ESPECIALES = '!@#$%&*+-=?'

/** Genera una contraseña que cumple la política, usando el generador del navegador. */
export function generarPassword(longitud = 16): string {
  const alfabeto = MINUSCULAS + MAYUSCULAS + NUMEROS + ESPECIALES
  // Se garantiza un carácter de cada clase y el resto se completa al azar.
  const obligatorios = [MINUSCULAS, MAYUSCULAS, NUMEROS, ESPECIALES]
  const total = Math.max(longitud, 12)
  const bytes = new Uint32Array(total)
  crypto.getRandomValues(bytes)

  const caracteres = obligatorios.map((clase, indice) => clase[bytes[indice] % clase.length])
  for (let posicion = obligatorios.length; posicion < total; posicion += 1) {
    caracteres.push(alfabeto[bytes[posicion] % alfabeto.length])
  }

  // Mezcla de Fisher-Yates con entropía del navegador.
  const mezcla = new Uint32Array(caracteres.length)
  crypto.getRandomValues(mezcla)
  for (let i = caracteres.length - 1; i > 0; i -= 1) {
    const j = mezcla[i] % (i + 1)
    const temporal = caracteres[i]
    caracteres[i] = caracteres[j]
    caracteres[j] = temporal
  }
  return caracteres.join('')
}
