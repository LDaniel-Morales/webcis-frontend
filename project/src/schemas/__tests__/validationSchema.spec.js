import { describe, expect, it } from 'vitest'

import { registerFormSchema } from '@/schemas/validationSchema'

const validRegister = {
  names: 'Ana',
  surname: 'López',
  second_surname: 'Pérez',
  username: 'ana_lopez',
  control_number: '12345678',
  password: 'Secret1!',
  password_confirm: 'Secret1!',
}

async function registerErrors(overrides) {
  const { errors } = await registerFormSchema.parse({ ...validRegister, ...overrides })
  return Object.fromEntries(errors.map(({ path, errors: messages }) => [path, messages[0]]))
}

describe('register form schema', () => {
  it('accepts a complete register form', async () => {
    expect(await registerErrors({})).toEqual({})
  })

  it('requires the second surname', async () => {
    expect(await registerErrors({ second_surname: '' })).toEqual({
      second_surname: 'El segundo apellido es obligatorio',
    })
  })

  it('requires a control number of 8 to 10 characters', async () => {
    expect(await registerErrors({ control_number: '' })).toEqual({
      control_number: 'El número de control es obligatorio',
    })
    expect(await registerErrors({ control_number: '1234567' })).toEqual({
      control_number: 'Mínimo 8 caracteres',
    })
    expect(await registerErrors({ control_number: '12345678901' })).toEqual({
      control_number: 'Máximo 10 caracteres',
    })
    expect(await registerErrors({ control_number: '1234567890' })).toEqual({})
  })

  it('applies the shared password rule', async () => {
    expect(await registerErrors({ password: 'SECRET12', password_confirm: 'SECRET12' })).toEqual({
      password: 'Mín. 8 caracteres, mayúscula, minúscula, número y símbolo',
    })
  })
})
