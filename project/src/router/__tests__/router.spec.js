import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { authNavigationGuard } from '@/router'
import { getMe } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/services/auth.service', () => ({
  getMe: vi.fn(),
}))

function routeWithMeta(meta = {}) {
  return { meta }
}

describe('auth navigation guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('redirects anonymous users away from protected routes', async () => {
    vi.mocked(getMe).mockRejectedValue({ status: 401 })

    await expect(authNavigationGuard(routeWithMeta({ requiresAuth: true }))).resolves.toEqual({
      path: '/login',
    })
  })

  it('verifies the session against the backend on first entry to a protected route', async () => {
    vi.mocked(getMe).mockResolvedValue({ user: { username: 'ana', type: 'Student' } })
    const auth = useAuthStore()

    await expect(authNavigationGuard(routeWithMeta({ requiresAuth: true }))).resolves.toBe(true)
    expect(getMe).toHaveBeenCalledOnce()
    expect(auth.isAuthenticated).toBe(true)
  })

  it('does not re-check the backend on later navigations once the session was verified', async () => {
    vi.mocked(getMe).mockResolvedValue({ user: { username: 'ana', type: 'Student' } })

    await authNavigationGuard(routeWithMeta({ requiresAuth: true }))
    await authNavigationGuard(routeWithMeta({ requiresAuth: true }))

    expect(getMe).toHaveBeenCalledOnce()
  })

  it('redirects authenticated users away from guest routes', async () => {
    const auth = useAuthStore()
    auth.setUser({ username: 'ana', type: 'Student' })

    await expect(authNavigationGuard(routeWithMeta({ guest: true }))).resolves.toEqual({
      path: '/app',
    })
  })

  it('keeps non-admin users out of admin routes', async () => {
    vi.mocked(getMe).mockResolvedValue({ user: { username: 'ana', type: 'Student' } })

    await expect(
      authNavigationGuard(routeWithMeta({ requiresAuth: true, requiresAdmin: true })),
    ).resolves.toEqual({ path: '/app' })
  })

  it('allows admin users into admin routes', async () => {
    vi.mocked(getMe).mockResolvedValue({ user: { username: 'daniel', type: 'Admin' } })

    await expect(
      authNavigationGuard(routeWithMeta({ requiresAuth: true, requiresAdmin: true })),
    ).resolves.toBe(true)
  })
})
