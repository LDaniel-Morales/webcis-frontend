import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { createMaterial, deleteMaterial, getMaterials, updateMaterial } from '@/services/material.service'
import { useMaterialsStore } from '@/stores/materials'

vi.mock('@/services/material.service', () => ({
  getMaterials: vi.fn(),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  deleteMaterial: vi.fn(),
}))

const MATERIAL = {
  mat_serial: 1,
  mat_title: 'Manual de POO',
  mat_publication_date: '2026-10-04 00:00:00',
  mat_code: 'MAN-POO',
  mat_description: 'Manual',
  fk_materials_users: '9f1c2d3e-0000-4000-8000-000000000001',
}

describe('materials store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('keeps the GET /materials list with backend field names', async () => {
    vi.mocked(getMaterials).mockResolvedValue([MATERIAL])
    const store = useMaterialsStore()

    await expect(store.fetchMaterials()).resolves.toBe(true)

    expect(store.materials).toEqual([MATERIAL])
    expect(store.loaded).toBe(true)
    expect(store.loading).toBe(false)
  })

  it('keeps a list error without throwing', async () => {
    vi.mocked(getMaterials).mockRejectedValue({ status: 500, message: 'Server Error' })
    const store = useMaterialsStore()

    await expect(store.fetchMaterials()).resolves.toBe(false)

    expect(store.error).toEqual({ status: 500, message: 'Server Error' })
    expect(store.materials).toEqual([])
  })

  it('returns the created and updated material from the backend response', async () => {
    vi.mocked(createMaterial).mockResolvedValue({ message: 'Created', data: MATERIAL })
    vi.mocked(updateMaterial).mockResolvedValue({ message: 'Updated', data: { ...MATERIAL, mat_title: 'Nuevo' } })
    const store = useMaterialsStore()

    await expect(store.createMaterial({ mat_title: 'Manual de POO' })).resolves.toEqual(MATERIAL)
    await expect(store.updateMaterial(1, { mat_title: 'Nuevo' })).resolves.toMatchObject({ mat_title: 'Nuevo' })
    expect(updateMaterial).toHaveBeenCalledWith(1, { mat_title: 'Nuevo' })
  })

  it('lets the backend error reach the view on create (BUG-08: 500)', async () => {
    const error = { status: 500, message: "SQLSTATE[42S22]: Column not found: 1054 Unknown column 'updated_at'" }
    vi.mocked(createMaterial).mockRejectedValue(error)
    const store = useMaterialsStore()

    await expect(store.createMaterial({ mat_title: 'x' })).rejects.toEqual(error)
  })

  it('removes the deleted material from the list', async () => {
    vi.mocked(getMaterials).mockResolvedValue([MATERIAL, { ...MATERIAL, mat_serial: 2 }])
    vi.mocked(deleteMaterial).mockResolvedValue({ message: 'Deleted' })
    const store = useMaterialsStore()
    await store.fetchMaterials()

    await store.deleteMaterial('1')

    expect(deleteMaterial).toHaveBeenCalledWith('1')
    expect(store.materials.map((material) => material.mat_serial)).toEqual([2])
  })

  it('clears back to the empty state', async () => {
    vi.mocked(getMaterials).mockResolvedValue([MATERIAL])
    const store = useMaterialsStore()
    await store.fetchMaterials()

    store.clear()

    expect(store.materials).toEqual([])
    expect(store.loaded).toBe(false)
    expect(store.error).toBeNull()
  })
})
