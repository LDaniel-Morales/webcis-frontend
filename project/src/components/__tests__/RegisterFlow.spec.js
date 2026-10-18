import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Form } from 'vee-validate'

import RegisterForm from '@/components/public/register/RegisterForm.vue'
import RegisterInfo from '@/components/public/register/RegisterInfo.vue'
import RegisterView from '@/views/public/RegisterView.vue'

const mocks = vi.hoisted(() => ({
  confirmVerificationEmail: vi.fn(),
  register: vi.fn(),
  resetCaptcha: vi.fn(),
  route: { path: '/register/verify' },
  routerPush: vi.fn(),
  sendVerificationEmail: vi.fn(),
}))

vi.mock('@/services/auth.service', () => ({
  confirmVerificationEmail: mocks.confirmVerificationEmail,
  register: mocks.register,
  sendVerificationEmail: mocks.sendVerificationEmail,
}))

vi.mock('vue3-recaptcha-v2', () => ({
  RecaptchaV2: {
    props: ['onLoadCallback'],
    template: `
      <button
        type="button"
        data-test="captcha"
        @click="onLoadCallback('captcha-token')"
      />
    `,
  },
  useRecaptcha: () => ({
    handleReset: mocks.resetCaptcha,
  }),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useRoute: () => mocks.route,
    useRouter: () => ({ push: mocks.routerPush }),
  }
})

function pendingPromise() {
  return new Promise(() => {})
}

function mountRegisterForm() {
  return mount(RegisterForm, {
    props: {
      email: 'ana@example.com',
      token: 'verify-token',
    },
  })
}

async function completeRegisterForm(wrapper) {
  await wrapper.get('input[name="names"]').setValue('Ana')
  await wrapper.get('input[name="surname"]').setValue('López')
  await wrapper.get('input[name="second_surname"]').setValue('Pérez')
  await wrapper.get('input[name="username"]').setValue('ana_lopez')
  await wrapper.get('input[name="control_number"]').setValue('12345678')
  await wrapper.get('input[name="password"]').setValue('Secret1!')
  await wrapper.get('input[name="password_confirm"]').setValue('Secret1!')
  await wrapper.get('[data-test="captcha"]').trigger('click')
}

async function submitRegisterForm(wrapper) {
  await wrapper.findComponent(Form).vm.$emit('submit', {
    email: 'ana@example.com',
    username: 'ana_lopez',
    password: 'Secret1!',
    password_confirm: 'Secret1!',
    names: 'Ana',
    surname: 'López',
    second_surname: 'Pérez',
    control_number: '12345678',
  })
}

describe('register flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.path = '/register/verify'
    mocks.confirmVerificationEmail.mockResolvedValue({
      token: 'server-token',
      email: 'ana@example.com',
    })
    mocks.register.mockResolvedValue({ id: 1 })
    mocks.sendVerificationEmail.mockResolvedValue({})
  })

  it('transitions to the success confirmation after a successful registration', async () => {
    const wrapper = mount(RegisterView, {
      global: {
        stubs: {
          RegisterEmail: { template: '<div />' },
          RegisterInfo: { template: '<div />' },
          RegisterConfirmed: {
            template:
              "<button data-test=\"confirmed\" @click=\"$emit('continue', { token: 'verify-token', email: 'ana@example.com' })\" />",
          },
          RegisterForm: {
            template: '<button data-test="registered" @click="$emit(\'registered\')" />',
          },
          RegisterSuccess: {
            template: '<div data-test="register-success">Cuenta creada exitosamente</div>',
          },
        },
      },
    })

    await wrapper.get('[data-test="confirmed"]').trigger('click')
    await wrapper.get('[data-test="registered"]').trigger('click')

    expect(wrapper.find('[data-test="register-success"]').exists()).toBe(true)
  })

  it('accepts the 32-character alphanumeric verification string from the email', async () => {
    const wrapper = mount(RegisterInfo, {
      props: {
        email: 'ana@example.com',
      },
    })
    const verificationString = 'tSj0hIq9ZxB2mK7pLw4RvN8cYd3FgH1e'
    const input = wrapper.get('input[name="verification_code"]')

    expect(input.attributes('inputmode')).toBe('text')

    await input.setValue(verificationString)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.confirmVerificationEmail).toHaveBeenCalledWith({
      email: 'ana@example.com',
      code: verificationString,
      token: verificationString,
    })
  })

  it('confirms the email code and continues the register flow', async () => {
    const wrapper = mount(RegisterInfo, {
      props: {
        email: 'ana@example.com',
      },
    })

    await wrapper.get('input[name="verification_code"]').setValue('123456')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.confirmVerificationEmail).toHaveBeenCalledWith({
      email: 'ana@example.com',
      code: '123456',
      token: '123456',
    })
    expect(wrapper.emitted('continue')?.[0]?.[0]).toEqual({
      token: 'server-token',
      email: 'ana@example.com',
    })
  })

  it('submits successfully and emits the registered event with the backend response', async () => {
    const wrapper = mountRegisterForm()

    await completeRegisterForm(wrapper)
    await submitRegisterForm(wrapper)
    await flushPromises()

    expect(mocks.register).toHaveBeenCalledWith({
      email: 'ana@example.com',
      username: 'ana_lopez',
      password: 'Secret1!',
      names: 'Ana',
      surname: 'López',
      second_surname: 'Pérez',
      control_number: '12345678',
      token: 'verify-token',
      type: 0,
      recaptcha_token: 'captcha-token',
    })
    expect(wrapper.emitted('registered')?.[0]).toEqual([{ id: 1 }])
  })

  it('shows the backend error when the register token is invalid', async () => {
    mocks.register.mockRejectedValue({ message: 'Token inválido.' })
    const wrapper = mountRegisterForm()

    await completeRegisterForm(wrapper)
    await submitRegisterForm(wrapper)
    await flushPromises()

    expect(wrapper.text()).toContain('Token inválido.')
    expect(mocks.register).toHaveBeenCalledWith({
      email: 'ana@example.com',
      username: 'ana_lopez',
      password: 'Secret1!',
      names: 'Ana',
      surname: 'López',
      second_surname: 'Pérez',
      control_number: '12345678',
      token: 'verify-token',
      type: 0,
      recaptcha_token: 'captcha-token',
    })
    expect(wrapper.emitted('registered')).toBeUndefined()
  })

  it('disables the submit button while the registration request is pending', async () => {
    mocks.register.mockReturnValue(pendingPromise())
    const wrapper = mountRegisterForm()

    await completeRegisterForm(wrapper)
    await submitRegisterForm(wrapper)
    await wrapper.vm.$nextTick()

    const submit = wrapper.get('button[type="submit"]')
    expect(submit.attributes('disabled')).toBeDefined()
    expect(submit.text()).toBe('Registrando...')
  })
})
