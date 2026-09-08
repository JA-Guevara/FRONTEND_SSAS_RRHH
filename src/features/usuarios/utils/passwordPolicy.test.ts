import { describe, expect, it } from 'vitest'
import { evaluarPassword, generarPassword, passwordEsValida } from './passwordPolicy'

/**
 * Esta política es un espejo de `auth/domain/password_policy.py`. Si divergen, el
 * formulario acepta contraseñas que el backend rechaza con un 422 y el alta de
 * usuarios vuelve a fallar sin explicación. Los casos de abajo son los mismos que
 * cubre `backend_ssas_rrhh/tests/unit/test_crear_usuario.py`.
 */
describe('política de contraseña', () => {
  it('acepta una contraseña que cumple todos los requisitos', () => {
    expect(passwordEsValida('Clave.Segura.2026', 'anaperez', 'ana@empresa.bo')).toBe(true)
  })

  it.each([
    ['Corta.1a', 'menos de 12 caracteres'],
    ['clave.segura.2026', 'sin mayúscula'],
    ['CLAVE.SEGURA.2026', 'sin minúscula'],
    ['Clave.Segura.Bien', 'sin número'],
    ['ClaveSegura2026', 'sin carácter especial'],
    ['Clave Segura 2026!', 'con espacios'],
  ])('rechaza %s (%s)', (password) => {
    expect(passwordEsValida(password, 'anaperez', 'ana@empresa.bo')).toBe(false)
  })

  it('rechaza una contraseña que contiene el nombre de usuario', () => {
    expect(passwordEsValida('AnaPerez.2026x', 'anaperez', 'ana@empresa.bo')).toBe(false)
  })

  it('rechaza una contraseña que contiene la parte local del correo', () => {
    expect(passwordEsValida('Ana.Perez.2026!', 'otro', 'ana.perez@empresa.bo')).toBe(false)
  })

  it('ignora los valores personales de menos de tres caracteres', () => {
    // El backend solo compara candidatos de longitud >= 3.
    expect(passwordEsValida('Clave.Segura.2026', 'ab', 'ab@empresa.bo')).toBe(true)
  })

  it('rechaza las contraseñas de la lista de comunes del backend', () => {
    expect(passwordEsValida('contraseña123')).toBe(false)
    expect(passwordEsValida('password1234')).toBe(false)
  })

  it('informa de cada requisito por separado para poder mostrarlos', () => {
    const requisitos = evaluarPassword('abc', 'anaperez', 'ana@empresa.bo')
    const porId = new Map(requisitos.map((r) => [r.id, r.cumple]))

    expect(porId.get('longitud')).toBe(false)
    expect(porId.get('minuscula')).toBe(true)
    expect(porId.get('mayuscula')).toBe(false)
    expect(porId.get('numero')).toBe(false)
    expect(porId.get('especial')).toBe(false)
    expect(porId.get('sin-espacios')).toBe(true)
  })

  it('el generador produce siempre una contraseña válida', () => {
    for (let intento = 0; intento < 200; intento += 1) {
      const generada = generarPassword()
      expect(passwordEsValida(generada), `falló con «${generada}»`).toBe(true)
    }
  })

  it('el generador respeta la longitud mínima aunque se pida menos', () => {
    expect(generarPassword(4).length).toBe(12)
  })
})
