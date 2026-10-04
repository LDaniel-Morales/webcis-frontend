import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { getProfile, updateBanner, updateMe, updateProfilePicture } from '@/services/profile.service'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

vi.mock('@/services/profile.service', () => ({
  getProfile: vi.fn(),
  updateMe: vi.fn(),
  updateProfilePicture: vi.fn(),
  updateBanner: vi.fn(),
}))

vi.mock('@/services/auth.service', () => ({
  getMe: vi.fn(),
  getDashboard: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

const USER = { username: 'dmorales', type: 'Student', description: null, profile_picture: null }

// Respuesta real de GET /profile (ProfileController::index).
const PROFILE_RESPONSE = {
  user: USER,
  medals: [
    { name: 'Principios POO', description: 'Curso completado', obtained_at: '2026-07-20 10:00:00', image: null },
  ],
  courses: [
    {
      code: 'LARAVEL-01',
      title: 'Laravel desde Cero',
      short_title: 'Laravel',
      description: null,
      status: 1,
      joined_at: '2026-07-01 10:00:00',
      completed_at: null,
      last_accessed_at: '2026-07-27 23:52:09',
      icon: null,
    },
  ],
}

describe('profile store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads medals and courses from GET /profile and hands the user to the auth store', async () => {
    vi.mocked(getProfile).mockResolvedValue(PROFILE_RESPONSE)
    const auth = useAuthStore()
    const profile = useProfileStore()

    await expect(profile.fetchProfile()).resolves.toBe(true)
    expect(profile.medals).toEqual(PROFILE_RESPONSE.medals)
    expect(profile.courses).toEqual(PROFILE_RESPONSE.courses)
    expect(profile.loaded).toBe(true)
    expect(profile.loading).toBe(false)
    expect(auth.user).toMatchObject({ username: 'dmorales', type: 'Student' })
  })

  it('keeps the error without throwing when GET /profile fails', async () => {
    vi.mocked(getProfile).mockRejectedValue({ status: 500, message: 'Error' })
    const profile = useProfileStore()

    await expect(profile.fetchProfile()).resolves.toBe(false)
    expect(profile.error).toEqual({ status: 500, message: 'Error' })
    expect(profile.loaded).toBe(false)
    expect(profile.loading).toBe(false)
  })

  it('updates auth.user with the user returned by PATCH /me', async () => {
    vi.mocked(updateMe).mockResolvedValue({ message: 'Profile updated successfully.', user: { ...USER, description: 'Hola' } })
    const auth = useAuthStore()
    const profile = useProfileStore()

    await profile.updateProfile({ description: 'Hola' })

    expect(updateMe).toHaveBeenCalledWith({ description: 'Hola' })
    expect(auth.user.description).toBe('Hola')
  })

  it('propagates the 422 validation error of PATCH /me', async () => {
    const error = { status: 422, message: 'The username has already been taken.', data: { errors: { username: ['taken'] } } }
    vi.mocked(updateMe).mockRejectedValue(error)
    const profile = useProfileStore()

    await expect(profile.updateProfile({ username: 'taken' })).rejects.toEqual(error)
  })

  it.each([
    ['updateProfilePicture', updateProfilePicture, 'profile_picture'],
    ['updateBanner', updateBanner, 'banner'],
  ])('%s updates auth.user with the new image URL', async (action, request, field) => {
    const url = 'http://localhost:81/storage/users/img.webp'
    vi.mocked(request).mockResolvedValue({ user: { ...USER, [field]: url } })
    const file = new File(['img'], 'img.png', { type: 'image/png' })
    const auth = useAuthStore()
    const profile = useProfileStore()

    await profile[action](file)

    expect(request).toHaveBeenCalledWith(file)
    expect(auth.user[field]).toBe(url)
  })

  it('clears back to the empty state', async () => {
    vi.mocked(getProfile).mockResolvedValue(PROFILE_RESPONSE)
    const profile = useProfileStore()
    await profile.fetchProfile()

    profile.clear()

    expect(profile.medals).toEqual([])
    expect(profile.courses).toEqual([])
    expect(profile.loaded).toBe(false)
    expect(profile.error).toBeNull()
  })
})
