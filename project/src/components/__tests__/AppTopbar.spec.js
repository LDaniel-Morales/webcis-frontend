import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppTopbar from '@/components/navigation/AppTopbar.vue'

function mountTopbar(props = {}) {
  return shallowMount(AppTopbar, {
    props,
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' }, AppUserMenu: true } },
  })
}

describe('AppTopbar', () => {
  it('shows the WebCIS logo with the same size as the public header', () => {
    const logo = mountTopbar().get('img[alt="WebCIS"]')

    expect(logo.classes()).toEqual(expect.arrayContaining(['h-18', 'w-auto']))
    expect(logo.attributes()).toMatchObject({ width: '1077', height: '719' })
  })

  it('opens the mobile menu from a hamburger button hidden on desktop', async () => {
    const wrapper = mountTopbar({ menuOpen: false })
    const button = wrapper.get('button[aria-label="Abrir menú"]')

    expect(button.classes()).toContain('md:hidden')
    expect(button.attributes('aria-expanded')).toBe('false')

    await button.trigger('click')

    expect(wrapper.emitted('open-menu')).toHaveLength(1)
    expect(mountTopbar({ menuOpen: true }).get('button').attributes('aria-expanded')).toBe('true')
  })
})
