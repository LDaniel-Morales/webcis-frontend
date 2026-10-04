import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { getMe, login, logout } from '@/services/auth.service'
import { normalizeServerUser, useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useProfileStore } from '@/stores/profile'

vi.mock('@/services/auth.service', () => ({
  getMe: vi.fn(),
  getDashboard: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

// UserResource real (backend WebCIS, rama dev).
const USER_RESOURCE = {
  username: 'dmorales',
  email: 'dmorales@webcis.test',
  control_number: '20E30245',
  name: 'Daniel',
  surname: 'Morales',
  second_surname: 'Lopez',
  description: null,
  type: 'Admin',
  profile_picture: 'http://localhost:81/storage/users/pfp.webp',
  banner: null,
  created_at: '2026-07-28T01:52:09+00:00',
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('keeps the UserResource field names as-is', () => {
    expect(normalizeServerUser(USER_RESOURCE)).toEqual(USER_RESOURCE)
  })

  it('fills missing UserResource fields with null and drops unknown ones', () => {
    expect(normalizeServerUser({ username: 'ana', type: 'Student', extra: 1 })).toEqual({
      username: 'ana',
      email: null,
      control_number: null,
      name: null,
      surname: null,
      second_surname: null,
      description: null,
      type: 'Student',
      profile_picture: null,
      banner: null,
      created_at: null,
    })
  })

  it('requires a username to consider the payload a valid user', () => {
    expect(normalizeServerUser({ type: 'Student' })).toBeNull()
    expect(normalizeServerUser(null)).toBeNull()
  })

  it('restores a cookie session using GET /me', async () => {
    vi.mocked(getMe).mockResolvedValue({ user: USER_RESOURCE })
    const auth = useAuthStore()

    await expect(auth.refreshSession()).resolves.toBe(true)
    expect(auth.user).toEqual(USER_RESOURCE)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.type).toBe('Admin')
    expect(auth.sessionChecked).toBe(true)
  })

  it('keeps the user anonymous when session verification returns 401', async () => {
    vi.mocked(getMe).mockRejectedValue({ status: 401 })
    const auth = useAuthStore()
    auth.setUser(USER_RESOURCE)

    await expect(auth.refreshSession()).resolves.toBe(false)
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.sessionChecked).toBe(true)
  })

  it('fetches the user with GET /me after a successful login and never writes an auth token', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    vi.mocked(login).mockResolvedValue({ message: 'Successful login' })
    vi.mocked(getMe).mockResolvedValue({ user: { username: 'luis', type: 'Professor' } })
    const auth = useAuthStore()

    await auth.login({ username: 'luis', pass: 'secret', role: 'profesor' })

    expect(getMe).toHaveBeenCalledOnce()
    expect(auth.user).toMatchObject({ username: 'luis', type: 'Professor' })
    expect(setItem).not.toHaveBeenCalled()
  })

  it('fails the login when the session cannot be verified with GET /me', async () => {
    vi.mocked(login).mockResolvedValue({ message: 'Successful login' })
    vi.mocked(getMe).mockRejectedValue({ status: 500 })
    const auth = useAuthStore()

    await expect(auth.login({ email: 'ana@example.com', pass: 'secret', role: 'alumno' })).rejects.toMatchObject({
      message: 'No se pudo verificar la sesión. Intenta de nuevo.',
    })
    expect(auth.isAuthenticated).toBe(false)
  })

  it('calls the backend logout and always clears local state, including dashboard and profile', async () => {
    vi.mocked(logout).mockRejectedValue({ status: 500 })
    const auth = useAuthStore()
    const dashboard = useDashboardStore()
    const profile = useProfileStore()
    auth.setUser(USER_RESOURCE)
    dashboard.setDashboardData({ medals: 2, progress: 20, recent_courses: [] })
    profile.medals = [{ name: 'POO' }]
    profile.loaded = true

    await expect(auth.logout()).resolves.toBe(false)
    expect(logout).toHaveBeenCalledOnce()
    expect(auth.user).toBeNull()
    expect(dashboard.loaded).toBe(false)
    expect(profile.loaded).toBe(false)
    expect(profile.medals).toEqual([])
  })
})
