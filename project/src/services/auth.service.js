import { apiGet, apiPost, backendBaseURL } from './api.js'

const AUTH_BASE = '/auth'
const EMAIL_BASE = '/email'
const CSRF_COOKIE_ENDPOINT = '/sanctum/csrf-cookie'

async function ensureCsrfCookie() {
  await apiGet(CSRF_COOKIE_ENDPOINT, { baseURL: backendBaseURL })
}

async function authPost(endpoint, payload, config) {
  await ensureCsrfCookie()
  const url = `${AUTH_BASE}${endpoint}`
  if (payload === undefined) {
    return config === undefined ? apiPost(url) : apiPost(url, undefined, config)
  }
  return config === undefined ? apiPost(url, payload) : apiPost(url, payload, config)
}

async function emailPost(endpoint, payload) {
  await ensureCsrfCookie()
  const url = `${EMAIL_BASE}${endpoint}`
  if (payload === undefined) return apiPost(url)
  return apiPost(url, payload)
}

async function publicPost(endpoint, payload) {
  await ensureCsrfCookie()
  return apiPost(endpoint, payload)
}

function toPayload(value, key) {
  if (value && typeof value === 'object') return value
  return { [key]: value }
}

export async function login({ email, username, pass, password, role }) {
  const resolvedPassword = password ?? pass

  if (!resolvedPassword) {
    throw {
      status: 0,
      message: 'Falta el campo Contraseña.',
      data: null,
      isNetworkError: false,
    }
  }
  if (!role) {
    throw {
      status: 0,
      message: 'Falta el campo "rol".',
      data: null,
      isNetworkError: false,
    }
  }

  const identifier = email ?? username
  if (!identifier) {
    throw {
      status: 0,
      message: 'Debes ingresar Correo o Nombre de Usuario',
      data: null,
      isNetworkError: false,
    }
  }

  const payload = {
    // Nombres exactos que valida LoginRequest.php en el backend (WebCIS):
    // solo `login` y `password`. `login` puede ser email o username, el
    // backend lo detecta con filter_var().
    login: identifier,
    password: resolvedPassword,
    // `role` no es parte del contrato de /auth/login todavía (el backend no
    // lo valida ni lo usa). Se sigue enviando porque el selector de rol del
    // LoginCard está pensado para usarse cuando el backend lo soporte; por
    // ahora Laravel simplemente lo ignora.
    role,
  }

  return authPost('/login', payload)
}

// GET /me (UserController::me, auth:sanctum) → { user: UserResource }.
// Fuente de identidad/sesión: el guard verifica la sesión con este endpoint.
export async function getMe() {
  return apiGet('/me')
}

// GET /dashboard (DashboardController::index) → { user, medals, courses,
// progress, recent_course_progress, recent_courses }. Ya no se usa para
// verificar sesión: lo pide solo el store de dashboard (stores/dashboard.js).
export async function getDashboard() {
  return apiGet('/dashboard')
}

export async function logout() {
  return apiPost('/logout')
}

export async function sendVerificationEmail(payload) {
  return emailPost('/verification', toPayload(payload, 'email'))
}

export async function confirmVerificationEmail(payload) {
  return emailPost('/verification/confirm', toPayload(payload, 'token'))
}

export async function register(payload) {
  // El backend (UserController::store) tiene un único camino de éxito y
  // siempre responde 201 al crear el usuario (confirmado con backend). Se
  // exige el status exacto para no avanzar al paso de éxito con una
  // respuesta 2xx inesperada.
  return authPost('/register', payload, { validateStatus: (status) => status === 201 })
}

export async function forgotPassword(payload) {
  return publicPost('/forgot-password', toPayload(payload, 'email'))
}

export async function validateResetToken(payload) {
  return publicPost('/validate-reset-token', payload)
}

export async function resetPassword(payload) {
  return publicPost('/reset-password', payload)
}
