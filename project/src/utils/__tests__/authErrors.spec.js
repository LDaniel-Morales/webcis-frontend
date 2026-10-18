import { describe, expect, it } from 'vitest'

import { authErrorMessage } from '@/utils/authErrors'

describe('authErrorMessage', () => {
  it('translates known backend messages', () => {
    expect(authErrorMessage({ status: 401, message: 'Invalid credentials' }, 'x')).toBe(
      'Usuario o contraseña incorrectos.',
    )
    expect(authErrorMessage({ status: 401, message: 'Expired or invalid token' }, 'x')).toBe(
      'El código es incorrecto o ya expiró.',
    )
    expect(authErrorMessage({ status: 419, message: 'CSRF token mismatch.' }, 'x')).toBe(
      'La página quedó desactualizada. Recárgala e intenta de nuevo.',
    )
    expect(authErrorMessage({ status: 429, message: 'Too Many Attempts.' }, 'x')).toBe(
      'Demasiados intentos. Espera un momento e intenta de nuevo.',
    )
  })

  it('keeps the status code on server errors', () => {
    expect(authErrorMessage({ status: 500, message: 'Failed to create new user' }, 'x')).toBe(
      'Error 500 · No se pudo crear la cuenta. Es posible que el correo o el usuario ya estén registrados.',
    )
    expect(authErrorMessage({ status: 503, message: 'An error occurred while sending reset link' }, 'x')).toBe(
      'Error 503 · No se pudo enviar el correo de recuperación.',
    )
  })

  it('translates Laravel validation errors field by field', () => {
    const err = {
      status: 422,
      message: 'The control number field is required. (and 2 more errors)',
      data: {
        errors: {
          control_number: ['The control number field is required.'],
          second_surname: ['The second surname field must be a string.'],
          password: ['The password field must be at least 8 characters.'],
        },
      },
    }

    expect(authErrorMessage(err, 'x')).toBe(
      'El campo número de control es obligatorio. El campo segundo apellido debe ser texto. El campo contraseña debe tener al menos 8 caracteres.',
    )
  })

  it('translates the email, max length and unique validation rules', () => {
    const err = {
      status: 422,
      data: {
        errors: {
          email: ['The email field must be a valid email address.', 'ignored'],
          username: ['The username field must not be greater than 40 characters.'],
          control_number: ['The control number has already been taken.'],
        },
      },
    }

    expect(authErrorMessage(err, 'x')).toBe(
      'El campo correo debe ser un correo válido. El campo nombre de usuario no debe tener más de 40 caracteres. El número de control ya está registrado.',
    )
  })

  it('uses the status override before anything else', () => {
    expect(
      authErrorMessage({ status: 403, message: 'The security code is invalid or expired' }, 'x', { 403: 'Código vencido.' }),
    ).toBe('Código vencido.')
  })

  it('explains network errors', () => {
    expect(authErrorMessage({ status: 0, isNetworkError: true, message: 'Network Error' }, 'x')).toBe(
      'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
    )
  })

  it('keeps errors raised by the front itself', () => {
    expect(authErrorMessage({ status: 0, message: 'No se pudo verificar la sesión. Intenta de nuevo.' }, 'x')).toBe(
      'No se pudo verificar la sesión. Intenta de nuevo.',
    )
  })

  it('falls back to the given message for unknown backend messages', () => {
    expect(authErrorMessage({ status: 400, message: 'Something odd' }, 'No se pudo iniciar sesión.')).toBe(
      'No se pudo iniciar sesión.',
    )
    expect(authErrorMessage({ status: 500, message: 'Server Error' }, 'No se pudo iniciar sesión.')).toBe(
      'Error 500 · No se pudo iniciar sesión.',
    )
  })
})
