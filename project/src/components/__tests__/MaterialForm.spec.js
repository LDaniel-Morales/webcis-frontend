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

  it('shows the submit label by mode and the saving state, and emits cancel when editing', async () => {
    const wrapper = mount(MaterialForm, { props: { saving: true } })
    const submit = () => wrapper.get('button[type="submit"]')

    expect(submit().text()).toBe('Guardando…')
    expect(submit().attributes('disabled')).toBeDefined()

    await wrapper.setProps({ saving: false })
    expect(submit().text()).toBe('Enviar a aprobación')

    await wrapper.setProps({ isEdit: true })
    expect(submit().text()).toBe('Guardar cambios')

    await wrapper.findAll('button').find((button) => button.text() === 'Cancelar').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('shows the upload header with the draft action disabled', () => {
    const wrapper = mount(MaterialForm)
    const draft = wrapper.findAll('button').find((button) => button.text() === 'Guardar borrador')

    expect(wrapper.get('h1').text()).toBe('Subir material')
    expect(wrapper.text()).toContain('Se revisará antes de publicarse.')
    expect(draft.attributes('disabled')).toBeDefined()
    expect(draft.attributes('title')).toBe('Aún no disponible en el servidor')
  })

  it('marks subject, categories and files as not available yet', () => {
    const wrapper = mount(MaterialForm)

    expect(wrapper.text().match(/Aún no disponible en el servidor/g)).toHaveLength(3)
    expect(wrapper.findAll('[aria-disabled="true"]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Arrastra y suelta tus archivos aquí')
  })

  it('shows the edit header without the draft action', () => {
    const wrapper = mount(MaterialForm, { props: { isEdit: true } })

    expect(wrapper.get('h1').text()).toBe('Editar material')
    expect(wrapper.findAll('button').some((button) => button.text() === 'Guardar borrador')).toBe(false)
  })

  it('renders the alert slot between the header and the cards', () => {
    const wrapper = mount(MaterialForm, {
      slots: { alert: '<div role="alert">Error 500 · No pudimos guardar el material</div>' },
    })
    const html = wrapper.html()

    expect(wrapper.get('[role="alert"]').text()).toContain('Error 500')
    expect(html.indexOf('role="alert"')).toBeGreaterThan(html.indexOf('<h1'))
    expect(html.indexOf('role="alert"')).toBeLessThan(html.indexOf('Información del material'))
  })
})
