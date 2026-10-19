import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AppLayout from '@/layouts/AppLayout.vue'

const SidebarStub = {
  props: ['collapsed'],
  emits: ['toggle'],
  template: '<aside :data-collapsed="collapsed" @click="$emit(\'toggle\')" />',
}

function memoryStorage() {
  const items = new Map()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
  }
}

function mountLayout() {
  return mount(AppLayout, {
    global: {
      stubs: { AppSidebar: SidebarStub, AppTopbar: true, AppBottomNav: true, RouterView: true },
    },
  })
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the sidebar and the mobile bottom navigation', () => {
    const wrapper = mountLayout()

    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'AppBottomNav' }).exists()).toBe(true)
  })

  it('starts with the sidebar expanded and toggles it', async () => {
    const wrapper = mountLayout()
    const sidebar = wrapper.get('aside')

    expect(sidebar.attributes('data-collapsed')).toBe('false')

    await sidebar.trigger('click')
    expect(sidebar.attributes('data-collapsed')).toBe('true')

    await sidebar.trigger('click')
    expect(sidebar.attributes('data-collapsed')).toBe('false')
  })

  it('keeps working when the browser storage is not available', async () => {
    vi.stubGlobal('localStorage', undefined)
    const wrapper = mountLayout()

    await wrapper.get('aside').trigger('click')

    expect(wrapper.get('aside').attributes('data-collapsed')).toBe('true')
  })

  it('remembers the collapsed sidebar across reloads', async () => {
    const first = mountLayout()
    await first.get('aside').trigger('click')
    expect(localStorage.getItem('webcis:sidebar-collapsed')).toBe('1')
    first.unmount()

    expect(mountLayout().get('aside').attributes('data-collapsed')).toBe('true')
  })
})
