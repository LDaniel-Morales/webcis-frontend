import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RecoverCode from '@/components/public/recover/RecoverCode.vue'
import RecoverInfo from '@/components/public/recover/RecoverInfo.vue'
import RecoverReset from '@/components/public/recover/RecoverReset.vue'

const mocks = vi.hoisted(() => ({
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  validateResetToken: vi.fn(),
}))

vi.mock('@/services/auth.service', () => ({
  forgotPassword: mocks.forgotPassword,
  resetPassword: mocks.resetPassword,
  validateResetToken: mocks.validateResetToken,
}))

const global = {
  stubs: {
    RouterLink: {
      props: ['to'],
      template: '<a><slot /></a>',
    },
  },
}

describe('recover flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.forgotPassword.mockResolvedValue({ message: 'Código enviado' })
    mocks.resetPassword.mockResolvedValue({ message: 'Contraseña actualizada' })
    mocks.validateResetToken.mockResolvedValue({ token: 'reset-token' })
  })

  it('step 1 requests the recovery code with the user email', async () => {
    const wrapper = mount(RecoverInfo, { global })

    await wrapper.get('input[type="email"]').setValue('ana@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.forgotPassword).toHaveBeenCalledWith({
      email: 'ana@example.com',
    })
    expect(wrapper.emitted('continue')?.[0]).toEqual([
      { email: 'ana@example.com' },
    ])
  })

  it('step 1 shows the translated backend error and does not continue when the request fails', async () => {
    mocks.forgotPassword.mockRejectedValue({ status: 500, message: 'Unexpected error occurred' })
    const wrapper = mount(RecoverInfo, { global })

    await wrapper.get('input[type="email"]').setValue('ana@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Error 500 · Ocurrió un error inesperado.')
    expect(wrapper.emitted('continue')).toBeUndefined()
  })

  it('step 2 validates the code and continues with the reset token', async () => {
    const wrapper = mount(RecoverCode, {
      props: { email: 'ana@example.com' },
      global,
    })

    await wrapper.get('input[inputmode="numeric"]').setValue('1234')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.validateResetToken).toHaveBeenCalledWith({
      email: 'ana@example.com',
      code: '1234',
    })
    expect(wrapper.emitted('continue')?.[0]).toEqual([{ token: 'reset-token' }])
  })

  it('step 2 shows a clear message when the backend rejects an invalid or expired code (403)', async () => {
    mocks.validateResetToken.mockRejectedValue({
      status: 403,
      message: 'Expired or invalid token',
    })
    const wrapper = mount(RecoverCode, {
      props: { email: 'ana@example.com' },
      global,
    })

    await wrapper.get('input[inputmode="numeric"]').setValue('1234')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'El código es incorrecto o ya expiró. Verifica los dígitos o solicita uno nuevo.',
    )
    expect(wrapper.text()).not.toContain('Expired or invalid token')
    expect(wrapper.emitted('continue')).toBeUndefined()
  })

  it('step 3 uses the same five password requirements as the register form', async () => {
    const wrapper = mount(RecoverReset, {
      props: {
        email: 'ana@example.com',
        token: 'reset-token',
      },
      global,
    })
    const [passwordInput, confirmPasswordInput] = wrapper.findAll('input[type="password"]')

    expect(wrapper.findAll('li').map((item) => item.text())).toEqual([
      'Mínimo 8 caracteres',
      'Una mayúscula',
      'Una minúscula',
      'Un número',
      'Un símbolo',
    ])

    await passwordInput.setValue('SECRET12')
    await confirmPasswordInput.setValue('SECRET12')

    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('li[data-met="false"]').map((item) => item.text())).toEqual(['Una minúscula', 'Un símbolo'])
    expect(wrapper.text()).toContain('Media')
  })

  it('step 3 resets the password with email, password and reset token', async () => {
    const wrapper = mount(RecoverReset, {
      props: {
        email: 'ana@example.com',
        token: 'reset-token',
      },
      global,
    })
    const [passwordInput, confirmPasswordInput] = wrapper.findAll('input[type="password"]')

    await passwordInput.setValue('Secret1!')
    await confirmPasswordInput.setValue('Secret1!')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.resetPassword).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'Secret1!',
      token: 'reset-token',
    })
    expect(wrapper.emitted('continue')).toHaveLength(1)
  })

  it('step 3 keeps the user on the form when the backend rejects the reset', async () => {
    mocks.resetPassword.mockRejectedValue({
      status: 500,
      message: 'No se pudo actualizar la contraseña. Contacta a soporte.',
    })
    const wrapper = mount(RecoverReset, {
      props: {
        email: 'ana@example.com',
        token: 'bad-token',
      },
      global,
    })
    const [passwordInput, confirmPasswordInput] = wrapper.findAll('input[type="password"]')

    await passwordInput.setValue('Secret1!')
    await confirmPasswordInput.setValue('Secret1!')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Error 500 · No se pudo actualizar la contraseña.')
    expect(wrapper.emitted('continue')).toBeUndefined()
  })

  it('step 3 shows a clear message when the reset token expired or was already used (401)', async () => {
    mocks.resetPassword.mockRejectedValue({
      status: 401,
      message: 'Expired or invalid token',
    })
    const wrapper = mount(RecoverReset, {
      props: {
        email: 'ana@example.com',
        token: 'expired-token',
      },
      global,
    })
    const [passwordInput, confirmPasswordInput] = wrapper.findAll('input[type="password"]')

    await passwordInput.setValue('Secret1!')
    await confirmPasswordInput.setValue('Secret1!')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'El enlace de recuperación expiró o ya fue usado. Vuelve a solicitar un código nuevo desde el correo.',
    )
    expect(wrapper.text()).not.toContain('Expired or invalid token')
    expect(wrapper.emitted('continue')).toBeUndefined()
  })
})
