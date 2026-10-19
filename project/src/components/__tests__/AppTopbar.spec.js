import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppTopbar from '@/components/navigation/AppTopbar.vue'

describe('AppTopbar', () => {
  it('shows the WebCIS logo with the same size as the public header', () => {
    const logo = shallowMount(AppTopbar, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' }, AppUserMenu: true } },
    }).get('img[alt="WebCIS"]')

    expect(logo.classes()).toEqual(expect.arrayContaining(['h-18', 'w-auto']))
    expect(logo.attributes()).toMatchObject({ width: '1077', height: '719' })
  })
})
