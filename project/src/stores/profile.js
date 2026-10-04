import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getProfile,
  updateBanner as requestUpdateBanner,
  updateMe,
  updateProfilePicture as requestUpdateProfilePicture,
} from '@/services/profile.service'
import { useAuthStore } from '@/stores/auth'

// Datos de GET /profile con los nombres del backend. El `user` de la
// respuesta (y de cada PATCH /me*) se entrega a stores/auth.js, que es la
// única fuente del usuario autenticado; así el menú, el sidebar y el perfil
// se actualizan juntos.
export const useProfileStore = defineStore('profile', () => {
  const medals = ref([])
  const courses = ref([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref(null)

  async function fetchProfile() {
    loading.value = true
    error.value = null
    try {
      const response = await getProfile()
      useAuthStore().setUser(response?.user)
      medals.value = Array.isArray(response?.medals) ? response.medals : []
      courses.value = Array.isArray(response?.courses) ? response.courses : []
      loaded.value = true
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      loading.value = false
    }
  }

  // Las tres acciones de guardado propagan el error normalizado de api.js
  // ({ status, message, data }) para que la vista muestre la validación 422.
  async function updateProfile(payload) {
    const response = await updateMe(payload)
    useAuthStore().setUser(response?.user)
    return response
  }

  async function updateProfilePicture(file) {
    const response = await requestUpdateProfilePicture(file)
    useAuthStore().setUser(response?.user)
    return response
  }

  async function updateBanner(file) {
    const response = await requestUpdateBanner(file)
    useAuthStore().setUser(response?.user)
    return response
  }

  function clear() {
    medals.value = []
    courses.value = []
    loaded.value = false
    error.value = null
  }

  return {
    medals,
    courses,
    loaded,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateProfilePicture,
    updateBanner,
    clear,
  }
})
