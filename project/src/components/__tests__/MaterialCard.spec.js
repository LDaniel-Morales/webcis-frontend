import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import MaterialCard from '@/components/app/repository/MaterialCard.vue'
import { MOCK_MATERIALS } from '@/mocks/materials.mock'

const global = {
  stubs: {
    RouterLink: {
      props: ['to'],
      template: '<a :href="to"><slot /></a>',
    },
  },
}

const REAL_MATERIAL = {
  mat_serial: 7,
  mat_title: 'Guía de Laravel',
  mat_code: 'GUI-LAR',
  mat_publication_date: '2026-10-04 00:00:00',
  mat_description: null,
  fk_materials_users: '9f1c2d3e-0000-4000-8000-000000000001',
}

describe('MaterialCard', () => {
  it('shows a sample material with the design fields and links to its detail', () => {
    const wrapper = mount(MaterialCard, { props: { material: MOCK_MATERIALS[0] }, global })

    expect(wrapper.get('a').attributes('href')).toBe('/app/repository/demo-1')
    expect(wrapper.text()).toContain('Manual')
    expect(wrapper.text()).toContain('MAT-POO-014')
    expect(wrapper.text()).toContain('Manual de POO en C++')
    expect(wrapper.text()).toContain('Prof. C. Méndez · 12 mar 2026')
    expect(wrapper.text()).toContain('POO')
    expect(wrapper.text()).toContain('4 archivo(s)')
  })

  it('shows only backend fields for a real material, with the author id', () => {
    const wrapper = mount(MaterialCard, { props: { material: REAL_MATERIAL }, global })

    expect(wrapper.get('a').attributes('href')).toBe('/app/repository/7')
    expect(wrapper.text()).toContain('GUI-LAR')
    expect(wrapper.text()).toContain('Guía de Laravel')
    expect(wrapper.text()).toContain('9f1c2d3e-0000-4000-8000-000000000001 · 4 oct 2026')
    expect(wrapper.text()).not.toContain('archivo(s)')
    expect(wrapper.findAll('span.rounded-full')).toHaveLength(0)
  })
})
