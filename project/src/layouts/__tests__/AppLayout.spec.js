import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'

import AppLayout from '@/layouts/AppLayout.vue'

const route = reactive({ fullPath: '/app' })

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useRoute: () => route,
  }
})

const SidebarStub = {
  props: ['collapsed', 'mobile', 'open'],
  emits: ['toggle', 'close'],
  template: `
    <aside :data-collapsed="collapsed" :data-mobile="mobile" :data-open="open">
      <button data-test="toggle" @click="$emit('toggle')" />
      <button data-test="close" @click="$emit('close')" />
    </aside>
  `,
}

const TopbarStub = {
  props: ['menuOpen'],
  emits: ['open-menu'],
  template: '<header :data-menu-open="menuOpen"><button data-test="open-menu" @click="$emit(\'open-menu\')" /></header>',
}

function memoryStorage() {
  const items = new Map()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
  }
}

function mediaQuery(matches) {
  const listeners = new Set()
  const media = {
    matches,
    addEventListener: (_, listener) => listeners.add(listener),
    removeEventListener: (_, listener) => listeners.delete(listener),
    change(value) {
      media.matches = value
      listeners.forEach((listener) => listener({ matches: value }))
    },
  }
  vi.stubGlobal('matchMedia', () => media)
  return media
}

function mountLayout() {
  return mount(AppLayout, {
    attachTo: document.body,
    global: {
      stubs: { AppSidebar: SidebarStub, AppTopbar: TopbarStub, RouterView: true },
    },
  })
}

describe('AppLayout', () => {
  beforeEach(() => {
    route.fullPath = '/app'
    vi.stubGlobal('localStorage', memoryStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('desktop', () => {
    beforeEach(() => {
      mediaQuery(true)
    })

    it('starts with the sidebar expanded and toggles it', async () => {
      const wrapper = mountLayout()
      const sidebar = wrapper.get('aside')

      expect(sidebar.attributes()).toMatchObject({ 'data-collapsed': 'false', 'data-mobile': 'false' })

      await wrapper.get('[data-test="toggle"]').trigger('click')
      expect(sidebar.attributes('data-collapsed')).toBe('true')

      await wrapper.get('[data-test="toggle"]').trigger('click')
      expect(sidebar.attributes('data-collapsed')).toBe('false')
    })

    it('keeps working when the browser storage is not available', async () => {
      vi.stubGlobal('localStorage', undefined)
      const wrapper = mountLayout()

      await wrapper.get('[data-test="toggle"]').trigger('click')

      expect(wrapper.get('aside').attributes('data-collapsed')).toBe('true')
    })

    it('remembers the collapsed sidebar across reloads', async () => {
      const first = mountLayout()
      await first.get('[data-test="toggle"]').trigger('click')
      expect(localStorage.getItem('webcis:sidebar-collapsed')).toBe('1')
      first.unmount()

      expect(mountLayout().get('aside').attributes('data-collapsed')).toBe('true')
    })
  })

  describe('mobile', () => {
    let media

    beforeEach(() => {
      media = mediaQuery(false)
    })

    it('uses the sidebar as a closed drawer and ignores the desktop collapsed state', () => {
      localStorage.setItem('webcis:sidebar-collapsed', '1')
      const wrapper = mountLayout()

      expect(wrapper.get('aside').attributes()).toMatchObject({
        'data-mobile': 'true',
        'data-open': 'false',
        'data-collapsed': 'false',
      })
      expect(wrapper.find('[data-test="menu-backdrop"]').exists()).toBe(false)
    })

    it('opens the drawer from the topbar and closes it from the backdrop', async () => {
      const wrapper = mountLayout()

      await wrapper.get('[data-test="open-menu"]').trigger('click')
      expect(wrapper.get('aside').attributes('data-open')).toBe('true')
      expect(wrapper.get('header').attributes('data-menu-open')).toBe('true')

      await wrapper.get('[data-test="menu-backdrop"]').trigger('click')
      expect(wrapper.get('aside').attributes('data-open')).toBe('false')
    })

    it('closes the drawer with the close button, Escape and navigation', async () => {
      const wrapper = mountLayout()
      const open = () => wrapper.get('[data-test="open-menu"]').trigger('click')
      const isOpen = () => wrapper.get('aside').attributes('data-open')

      await open()
      await wrapper.get('[data-test="close"]').trigger('click')
      expect(isOpen()).toBe('false')

      await open()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await wrapper.vm.$nextTick()
      expect(isOpen()).toBe('false')

      await open()
      route.fullPath = '/app/explorer'
      await wrapper.vm.$nextTick()
      expect(isOpen()).toBe('false')
    })

    it('closes the drawer when the screen grows to desktop', async () => {
      const wrapper = mountLayout()

      await wrapper.get('[data-test="open-menu"]').trigger('click')
      media.change(true)
      await wrapper.vm.$nextTick()

      expect(wrapper.get('aside').attributes()).toMatchObject({ 'data-open': 'false', 'data-mobile': 'false' })
    })
  })
})
