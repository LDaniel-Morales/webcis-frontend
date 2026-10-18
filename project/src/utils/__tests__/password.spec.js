import { describe, expect, it } from 'vitest'

import { isStrongPassword, passwordChecks } from '@/utils/password'

describe('password rule', () => {
  it('accepts a password with 8 characters, upper, lower, number and symbol', () => {
    expect(isStrongPassword('Secret1!')).toBe(true)
  })

  it.each([
    ['too short', 'Sec1!'],
    ['no uppercase', 'secret1!'],
    ['no lowercase', 'SECRET1!'],
    ['no number', 'Secreto!'],
    ['no symbol', 'Secret12'],
    ['empty', ''],
  ])('rejects a password with %s', (_, value) => {
    expect(isStrongPassword(value)).toBe(false)
  })

  it('lists which of the five requirements are met', () => {
    expect(passwordChecks('secret1').map(({ key, met }) => [key, met])).toEqual([
      ['length', false],
      ['upper', false],
      ['lower', true],
      ['number', true],
      ['symbol', false],
    ])
  })
})
