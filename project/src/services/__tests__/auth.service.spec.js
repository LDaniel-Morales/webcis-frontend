import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiGet, apiPost, backendBaseURL } from '@/services/api.js'
import {
  confirmVerificationEmail,
  forgotPassword,
  getDashboard,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  sendVerificationEmail,
  validateResetToken,
} from '@/services/auth.service.js'

vi.mock('@/services/api.js', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  backendBaseURL: 'http://localhost:8000',
}))

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets the CSRF cookie before posting the login', async () => {
    vi.mocked(apiGet).mockResolvedValue(undefined)
    vi.mocked(apiPost).mockResolvedValue({ user: { id: 1 } })

    await login({ email: 'ana@example.com', pass: 'secret', role: 'alumno' })

    expect(apiGet).toHaveBeenCalledWith('/sanctum/csrf-cookie', {
      baseURL: backendBaseURL,
    })
    expect(apiPost).toHaveBeenCalledWith('/auth/login', {
      login: 'ana@example.com',
      password: 'secret',
      role: 'alumno',
    })
    expect(apiGet.mock.invocationCallOrder[0]).toBeLessThan(apiPost.mock.invocationCallOrder[0])
  })

  it('uses the protected me, dashboard and logout endpoints', async () => {
    await getMe()
    await getDashboard()
    await logout()

    expect(apiGet).toHaveBeenCalledWith('/me')
    expect(apiGet).toHaveBeenCalledWith('/dashboard')
    expect(apiPost).toHaveBeenCalledWith('/auth/logout')
  })

  it('logs out with the current CSRF token, without requesting a new CSRF cookie', async () => {
    await logout()

    expect(apiGet).not.toHaveBeenCalledWith('/sanctum/csrf-cookie', { baseURL: backendBaseURL })
    expect(apiPost).toHaveBeenCalledWith('/auth/logout')
  })

  it('centralizes the register and verification endpoints', async () => {
    await sendVerificationEmail('ana@example.com')
    await confirmVerificationEmail({ token: 'verify-token' })
    await register({ email: 'ana@example.com', pass: 'Secret1!' })

    expect(apiPost).toHaveBeenCalledWith('/email/verification', {
      email: 'ana@example.com',
    })
    expect(apiPost).toHaveBeenCalledWith('/email/verification/confirm', {
      token: 'verify-token',
    })
    expect(apiPost).toHaveBeenCalledWith(
      '/auth/register',
      {
        email: 'ana@example.com',
        pass: 'Secret1!',
      },
      { validateStatus: expect.any(Function) },
    )
  })

  it('centralizes the password recovery auth endpoints', async () => {
    await forgotPassword({ email: 'ana@example.com' })
    await validateResetToken('12345678')
    await resetPassword({
      token: '12345678',
      pass: 'Secret1!',
      pass_confirm: 'Secret1!',
    })

    expect(apiPost).toHaveBeenCalledWith('/forgot-password', {
      email: 'ana@example.com',
    })
    expect(apiPost).toHaveBeenCalledWith('/validate-reset-token', '12345678')
    expect(apiPost).toHaveBeenCalledWith('/reset-password', {
      token: '12345678',
      pass: 'Secret1!',
      pass_confirm: 'Secret1!',
    })
  })

  it('sends the recovery payloads required by the recover flow', async () => {
    await validateResetToken({ email: 'ana@example.com', code: '12345678' })
    await resetPassword({
      email: 'ana@example.com',
      password: 'Secret1!',
      token: '12345678',
    })

    expect(apiPost).toHaveBeenCalledWith('/validate-reset-token', {
      email: 'ana@example.com',
      code: '12345678',
    })
    expect(apiPost).toHaveBeenCalledWith('/reset-password', {
      email: 'ana@example.com',
      password: 'Secret1!',
      token: '12345678',
    })
  })
})
