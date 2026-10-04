<script setup>
import { ErrorMessage, Field, Form } from 'vee-validate'

import BaseButton from '@/components/ui/BaseButton.vue'
import { materialSchema } from '@/schemas/validationSchema.js'

defineProps({
  initialValues: {
    type: Object,
    default: () => ({ mat_title: '', mat_publication_date: '', mat_code: '', mat_description: '' }),
  },
  submitLabel: {
    type: String,
    default: 'Guardar',
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

function onSubmit(values, actions) {
  emit('submit', values, actions)
}

const labelClass = 'mb-1.5 block font-display text-[13.5px] font-semibold text-negro-sintaxis'
const inputClass =
  'h-12 w-full rounded-[13px] border-[1.5px] border-gris-interfaz px-3.5 font-display text-[14.5px] outline-none focus:border-cobre-digital'
</script>

<template>
  <Form
    class="flex flex-col gap-4 rounded-(--radius-card) bg-white p-[18px] shadow-(--shadow-card) sm:p-6"
    :validation-schema="materialSchema"
    :initial-values="initialValues"
    @submit="onSubmit"
  >
    <div>
      <label for="mat_title" :class="labelClass">Título</label>
      <Field id="mat_title" name="mat_title" type="text" maxlength="80" :class="inputClass" />
      <ErrorMessage v-slot="{ message }" name="mat_title">
        <p class="mt-1 font-display text-xs text-red-600">{{ message }}</p>
      </ErrorMessage>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label for="mat_code" :class="labelClass">Código</label>
        <Field id="mat_code" name="mat_code" type="text" maxlength="14" :class="inputClass" />
        <ErrorMessage v-slot="{ message }" name="mat_code">
          <p class="mt-1 font-display text-xs text-red-600">{{ message }}</p>
        </ErrorMessage>
      </div>

      <div>
        <label for="mat_publication_date" :class="labelClass">Fecha de publicación</label>
        <Field id="mat_publication_date" name="mat_publication_date" type="date" :class="inputClass" />
        <ErrorMessage v-slot="{ message }" name="mat_publication_date">
          <p class="mt-1 font-display text-xs text-red-600">{{ message }}</p>
        </ErrorMessage>
      </div>
    </div>

    <div>
      <label for="mat_description" :class="labelClass">Descripción</label>
      <Field
        id="mat_description"
        name="mat_description"
        as="textarea"
        rows="4"
        maxlength="300"
        class="w-full resize-y rounded-[13px] border-[1.5px] border-gris-interfaz px-3.5 py-2.5 font-display text-[14.5px] outline-none focus:border-cobre-digital"
      />
      <ErrorMessage v-slot="{ message }" name="mat_description">
        <p class="mt-1 font-display text-xs text-red-600">{{ message }}</p>
      </ErrorMessage>
    </div>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="rounded-[13px] border-[1.5px] border-[#e2e4e8] px-5 py-2.5 font-display text-sm font-semibold text-[#555]"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
      <BaseButton type="submit" variant="gold" :disabled="saving">
        {{ saving ? 'Guardando…' : submitLabel }}
      </BaseButton>
    </div>
  </Form>
</template>
