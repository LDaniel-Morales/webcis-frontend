import { apiDelete, apiGet, apiPost, apiPut } from './api.js'

export async function getMaterials() {
  return apiGet('/materials')
}

export async function getMaterial(id) {
  return apiGet(`/materials/${encodeURIComponent(id)}`)
}

export async function createMaterial(payload) {
  return apiPost('/materials', payload)
}

export async function updateMaterial(id, payload) {
  return apiPut(`/materials/${encodeURIComponent(id)}`, payload)
}

export async function deleteMaterial(id) {
  return apiDelete(`/materials/${encodeURIComponent(id)}`)
}
