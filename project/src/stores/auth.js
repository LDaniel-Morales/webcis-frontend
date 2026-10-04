import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getMe,
  login as requestLogin,
  logout as requestLogout,
} from '@/services/auth.service'
import { useDashboardStore } from '@/stores/dashboard'
import { useProfileStore } from '@/stores/profile'

// Campos de UserResource (backend WebCIS). El usuario se guarda con estos
// mismos nombres: el front se adapta al contrato del back, sin renombrar.
// `type` es el nombre del case de UserType: Student | Professor | Extern | Admin.
// `profile_picture` y `banner` ya llegan como URL completa (Storage::url).
const USER_RESOURCE_FIELDS = [
  'username',
  'email',
  'control_number',
  'name',
  'surname',
  'second_surname',
  'description',
  'type',
  'profile_picture',
  'banner',
  'created_at',
]

// GET /me, PATCH /me y PATCH /me/{profile-picture,banner} devuelven
// { user: UserResource }.
function userFromResponse(response) {
  return response?.user ?? null
}

export function normalizeServerUser(serverUser) {
  if (!serverUser || typeof serverUser !== 'object' || !serverUser.username) return null

  return Object.fromEntries(USER_RESOURCE_FIELDS.map((field) => [field, serverUser[field] ?? null]))
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  // PENDIENTE DE REVISAR: respaldo de cuando no existía un endpoint de
  // usuario (/dashboard sin desplegar). Permitía marcar la sesión como
  // autenticada tras un login exitoso aunque no se pudiera obtener el
  // usuario. Con GET /me ya no se usa: si /me falla tras el login, el login
  // falla (ver login()). Se deja comentado hasta confirmar que no hace falta.
  // const sessionConfirmed = ref(false)
  // Marca si ya se intentó verificar la sesión contra /me en esta carga de
  // la app (éxito o fallo). El guard del router la usa para no repetir la
  // llamada al backend en cada navegación entre rutas protegidas.
  const sessionChecked = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value))
  // const isAuthenticated = computed(() => Boolean(user.value) || sessionConfirmed.value)
  const type = computed(() => user.value?.type ?? null)

  function clearSession() {
    user.value = null
    // sessionConfirmed.value = false
  }

  function setUser(serverUser) {
    const normalizedUser = normalizeServerUser(serverUser)
    if (!normalizedUser) {
      clearSession()
      return false
    }

    user.value = normalizedUser
    return true
  }

  async function refreshSession() {
    try {
      return setUser(userFromResponse(await getMe()))
    } catch {
      clearSession()
      return false
    } finally {
      sessionChecked.value = true
    }
  }

  // POST /auth/login solo responde { message }: el usuario se obtiene
  // después con GET /me.
  async function login(credentials) {
    const response = await requestLogin(credentials)
    if (!(await refreshSession())) {
      // Respaldo anterior (ver sessionConfirmed arriba):
      // sessionConfirmed.value = true
      // return response
      throw {
        status: 0,
        message: 'No se pudo verificar la sesión. Intenta de nuevo.',
        data: null,
        isNetworkError: false,
      }
    }
    return response
  }

  async function logout() {
    try {
      await requestLogout()
      return true
    } catch {
      return false
    } finally {
      clearSession()
      useDashboardStore().clear()
      useProfileStore().clear()
    }
  }

  return {
    user,
    isAuthenticated,
    type,
    sessionChecked,
    clearSession,
    setUser,
    refreshSession,
    login,
    logout,
  }
})
