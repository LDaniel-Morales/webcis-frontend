const BACKEND_MESSAGES = {
  'Invalid credentials': 'Usuario o contraseña incorrectos.',
  'Expired or invalid token': 'El código es incorrecto o ya expiró.',
  'Invalid Token': 'El código es incorrecto o ya expiró.',
  'The security code is invalid or expired': 'El código es incorrecto o ya expiró.',
  'Failed to create new user': 'No se pudo crear la cuenta. Es posible que el correo o el usuario ya estén registrados.',
  'Failed to store token': 'No se pudo generar el código.',
  'Failed to generate secure token': 'No se pudo generar el código.',
  'Unable to send email': 'No se pudo enviar el correo.',
  'An error occurred while sending reset link': 'No se pudo enviar el correo de recuperación.',
  'Unexpected error occurred': 'Ocurrió un error inesperado.',
  'CSRF token mismatch.': 'La página quedó desactualizada. Recárgala e intenta de nuevo.',
  'Too Many Attempts.': 'Demasiados intentos. Espera un momento e intenta de nuevo.',
  'Unauthenticated.': 'Tu sesión expiró. Inicia sesión de nuevo.',
}

const FIELD_LABELS = {
  login: 'usuario o correo',
  email: 'correo',
  password: 'contraseña',
  token: 'código de verificación',
  code: 'código',
  control_number: 'número de control',
  username: 'nombre de usuario',
  names: 'nombre',
  surname: 'primer apellido',
  second_surname: 'segundo apellido',
  type: 'tipo de cuenta',
}

const VALIDATION_RULES = [
  [/field is required\.$/, (label) => `El campo ${label} es obligatorio.`],
  [/must be a valid email address\.$/, (label) => `El campo ${label} debe ser un correo válido.`],
  [/must be a string\.$/, (label) => `El campo ${label} debe ser texto.`],
  [/must be at least (\d+) characters\.$/, (label, min) => `El campo ${label} debe tener al menos ${min} caracteres.`],
  [/must not be greater than (\d+) characters\.$/, (label, max) => `El campo ${label} no debe tener más de ${max} caracteres.`],
  [/has already been taken\.$/, (label) => `El ${label} ya está registrado.`],
  [/^The selected .+ is invalid\.$/, (label) => `El campo ${label} no es válido.`],
]

function translateValidation(field, message) {
  const label = FIELD_LABELS[field] ?? field.replaceAll('_', ' ')
  for (const [pattern, translate] of VALIDATION_RULES) {
    const match = message.match(pattern)
    if (match) return translate(label, ...match.slice(1))
  }
  return message
}

function validationMessage(errors) {
  return Object.entries(errors)
    .map(([field, messages]) => translateValidation(field, [messages].flat()[0] ?? ''))
    .join(' ')
}

function withStatus(status, message) {
  return status >= 500 ? `Error ${status} · ${message}` : message
}

export function authErrorMessage(err, fallback, overrides = {}) {
  const status = err?.status ?? 0

  if (overrides[status]) return withStatus(status, overrides[status])
  if (status === 422 && err?.data?.errors) return validationMessage(err.data.errors)

  const known = BACKEND_MESSAGES[err?.message]
  if (known) return withStatus(status, known)

  if (err?.isNetworkError) return 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.'
  if (!status && err?.message) return err.message

  return withStatus(status, fallback)
}
