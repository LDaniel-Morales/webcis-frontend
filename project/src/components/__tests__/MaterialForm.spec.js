import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import MaterialForm from '@/components/app/repository/MaterialForm.vue'

async function submit(wrapper) {
  await wrapper.get('form').trigger('submit')
  for (let tick = 0; tick < 5; tick += 1) {
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

describe('MaterialForm', () => {
  it('validates the required backend fields before emitting', async () => {
    const wrapper = mount(MaterialForm)

    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('El título es obligatorio')
    expect(wrapper.text()).toContain('El código es obligatorio')
    expect(wrapper.text()).toContain('La fecha de publicación es obligatoria')
  })

  it('applies the StoreMaterialRequest max lengths', async () => {
    const wrapper = mount(MaterialForm, {
      props: {
        initialValues: {
          mat_title: 'a'.repeat(81),
          mat_publication_date: '2026-10-04',
          mat_code: 'b'.repeat(15),
          mat_description: 'c'.repeat(301),
        },
      },
    })

    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Máximo 80 caracteres')
    expect(wrapper.text()).toContain('Máximo 14 caracteres')
    expect(wrapper.text()).toContain('Máximo 300 caracteres')
  })

  it('emits the backend field names, with an empty description as null', async () => {
    const wrapper = mount(MaterialForm, {
      props: {
        initialValues: {
          mat_title: 'Manual de POO',
          mat_publication_date: '2026-10-04',
          mat_code: 'MAN-POO',
          mat_description: '',
        },
      },
    })

    await submit(wrapper)

    expect(wrapper.emitted('submit')[0][0]).toEqual({
      mat_title: 'Manual de POO',
      mat_publication_date: '2026-10-04',
      mat_code: 'MAN-POO',
      mat_description: null,
    })
  })

  it('shows the submit label and the saving state, and emits cancel', async () => {
    const wrapper = mount(MaterialForm, { props: { submitLabel: 'Crear material', saving: true } })

    expect(wrapper.get('button[type="submit"]').text()).toBe('Guardando…')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()

    await wrapper.setProps({ saving: false })
    expect(wrapper.get('button[type="submit"]').text()).toBe('Crear material')

    await wrapper.get('button[type="button"]').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
