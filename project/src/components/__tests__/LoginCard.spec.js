import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import LoginCard from '@/components/public/login/LoginCard.vue'

const mocks = vi.hoisted(() => ({
  authLogin: vi.fn(),
  routerPush: vi.fn(),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ login: mocks.authLogin }),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useRouter: () => ({ push: mocks.routerPush }),
  }
})

function mountLoginCard() {
  return mount(LoginCard, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

async function submitCredentials(wrapper, identifier, password) {
  const [identifierInput, passwordInput] = wrapper.findAll('input')
  await identifierInput.setValue(identifier)
  await passwordInput.setValue(password)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('LoginCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authLogin.mockResolvedValue({ user: { id: 1 } })
  })

  it('does not show a role selector', () => {
    const wrapper = mountLoginCard()

    expect(wrapper.text()).not.toMatch(/Alumno|Profesor|Egresado/)
    expect(wrapper.findAll('button[type="button"]').map((button) => button.text())).toEqual(['Mostrar'])
  })

  it('submits an email without a role', async () => {
    const wrapper = mountLoginCard()

    await submitCredentials(wrapper, 'alumno@example.com', 'secret')

    expect(mocks.authLogin).toHaveBeenCalledWith({
      email: 'alumno@example.com',
      username: undefined,
      pass: 'secret',
    })
    expect(mocks.routerPush).toHaveBeenCalledWith('/app')
  })

  it('submits a username without a role', async () => {
    const wrapper = mountLoginCard()

    await submitCredentials(wrapper, 'profesor01', 'secret')

    expect(mocks.authLogin).toHaveBeenCalledWith({
      email: undefined,
      username: 'profesor01',
      pass: 'secret',
    })
  })

  it('shows the login error and does not navigate', async () => {
    mocks.authLogin.mockRejectedValue({ message: 'Credenciales inválidas.' })
    const wrapper = mountLoginCard()

    await submitCredentials(wrapper, 'alumno01', 'wrong-password')

    expect(wrapper.text()).toContain('Credenciales inválidas.')
    expect(mocks.routerPush).not.toHaveBeenCalled()
  })
})
