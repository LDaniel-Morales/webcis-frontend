export const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: 'Mínimo 8 caracteres', test: (value) => value.length >= 8 },
  { key: 'upper', label: 'Una mayúscula', test: (value) => /[A-Z]/.test(value) },
  { key: 'lower', label: 'Una minúscula', test: (value) => /[a-z]/.test(value) },
  { key: 'number', label: 'Un número', test: (value) => /\d/.test(value) },
  { key: 'symbol', label: 'Un símbolo', test: (value) => /[^A-Za-z\d]/.test(value) },
]

export const PASSWORD_RULE_MESSAGE = 'Mín. 8 caracteres, mayúscula, minúscula, número y símbolo'

export function passwordChecks(value = '') {
  return PASSWORD_REQUIREMENTS.map(({ key, label, test }) => ({ key, label, met: test(value) }))
}

export function isStrongPassword(value = '') {
  return PASSWORD_REQUIREMENTS.every(({ test }) => test(value))
}
