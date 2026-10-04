import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  createMaterial as requestCreate,
  deleteMaterial as requestDelete,
  getMaterials,
  updateMaterial as requestUpdate,
} from '@/services/material.service'

export const useMaterialsStore = defineStore('materials', () => {
  const materials = ref([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref(null)

  async function fetchMaterials() {
    loading.value = true
    error.value = null
    try {
      const response = await getMaterials()
      materials.value = Array.isArray(response) ? response : []
      loaded.value = true
      return true
    } catch (err) {
      error.value = err
      materials.value = []
      return false
    } finally {
      loading.value = false
    }
  }

  async function createMaterial(payload) {
    const response = await requestCreate(payload)
    return response?.data ?? null
  }

  async function updateMaterial(id, payload) {
    const response = await requestUpdate(id, payload)
    return response?.data ?? null
  }

  async function deleteMaterial(id) {
    await requestDelete(id)
    materials.value = materials.value.filter((material) => material.mat_serial !== Number(id))
  }

  function clear() {
    materials.value = []
    loaded.value = false
    loading.value = false
    error.value = null
  }

  return {
    materials,
    loaded,
    loading,
    error,
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    clear,
  }
})
