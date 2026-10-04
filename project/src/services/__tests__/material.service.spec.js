import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api.js'
import {
  createMaterial,
  deleteMaterial,
  getMaterial,
  getMaterials,
  updateMaterial,
} from '@/services/material.service.js'

vi.mock('@/services/api.js', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}))

const PAYLOAD = {
  mat_title: 'Manual de POO',
  mat_publication_date: '2026-10-04',
  mat_code: 'MAN-POO',
  mat_description: null,
}

describe('material service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists and reads materials', async () => {
    await getMaterials()
    await getMaterial(7)

    expect(apiGet).toHaveBeenCalledWith('/materials')
    expect(apiGet).toHaveBeenCalledWith('/materials/7')
  })

  it('creates, updates and deletes with the backend field names', async () => {
    await createMaterial(PAYLOAD)
    await updateMaterial(7, PAYLOAD)
    await deleteMaterial(7)

    expect(apiPost).toHaveBeenCalledWith('/materials', PAYLOAD)
    expect(apiPut).toHaveBeenCalledWith('/materials/7', PAYLOAD)
    expect(apiDelete).toHaveBeenCalledWith('/materials/7')
  })
})
