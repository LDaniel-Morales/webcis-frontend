import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiGet, apiPatch, apiPost } from '@/services/api.js'
import { getProfile, updateBanner, updateMe, updateProfilePicture } from '@/services/profile.service.js'

vi.mock('@/services/api.js', () => ({
  apiGet: vi.fn(),
  apiPatch: vi.fn(),
  apiPost: vi.fn(),
}))

describe('profile service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets the profile from GET /profile', async () => {
    await getProfile()

    expect(apiGet).toHaveBeenCalledWith('/profile')
  })

  it('sends the ProfileUpdateRequest fields to PATCH /me', async () => {
    const payload = {
      username: 'dmorales',
      description: 'Hola',
      name: 'Daniel',
      surname: 'Morales',
      second_surname: null,
    }

    await updateMe(payload)

    expect(apiPatch).toHaveBeenCalledWith('/me', payload)
  })

  it.each([
    ['profile picture', updateProfilePicture, '/me/profile-picture'],
    ['banner', updateBanner, '/me/banner'],
  ])('uploads the %s as multipart POST with _method=PATCH', async (_, upload, url) => {
    const file = new File(['img'], 'img.png', { type: 'image/png' })

    await upload(file)

    const [calledUrl, body, config] = vi.mocked(apiPost).mock.calls[0]
    expect(calledUrl).toBe(url)
    expect(body).toBeInstanceOf(FormData)
    expect(body.get('_method')).toBe('PATCH')
    expect(body.get('image')).toBe(file)
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
  })
})
