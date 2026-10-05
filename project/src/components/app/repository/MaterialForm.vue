<script setup>
import { ErrorMessage, Field, Form } from 'vee-validate'

import BaseButton from '@/components/ui/BaseButton.vue'
import { materialSchema } from '@/schemas/validationSchema.js'

defineProps({
  initialValues: {
    type: Object,
    default: () => ({ mat_title: '', mat_publication_date: '', mat_code: '', mat_description: '' }),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const UNAVAILABLE = 'Aún no disponible en el servidor'

function onSubmit(values, actions) {
  emit('submit', values, actions)
}

const labelClass = 'mb-[7px] block font-display text-sm font-semibold text-[#1c1c1c]'
const inputClass =
  'h-[50px] w-full rounded-[14px] border-[1.5px] border-gris-interfaz px-4 font-display text-[15px] text-[#1c1c1c] outline-none focus:border-cobre-digital'
const errorClass = 'mt-1 font-display text-xs text-red-600'
const unavailableClass =
  'flex h-[50px] items-center rounded-[14px] border-[1.5px] border-dashed border-gris-interfaz bg-[#f6f7f9] px-4 font-display text-[13px] text-[#999]'
</script>

<template>
  <Form :validation-schema="materialSchema" :initial-values="initialValues" @submit="onSubmit">
    <div class="mb-[18px] flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-[34px] font-bold text-white">{{ isEdit ? 'Editar material' : 'Subir material' }}</h1>
        <p class="mt-0.5 font-display text-[15px] text-white/60">
          {{ isEdit ? 'Actualiza la información del material.' : 'Comparte un recurso con la comunidad. Se revisará antes de publicarse.' }}
        </p>
      </div>
      <div class="flex gap-3">
        <BaseButton
          v-if="isEdit"
          variant="ghost"
          class="border-white/35! text-white!"
          :disabled="saving"
          @click="emit('cancel')"
        >
          Cancelar
        </BaseButton>
        <BaseButton v-else variant="ghost" class="border-white/35! text-white!" disabled :title="UNAVAILABLE">
          Guardar borrador
        </BaseButton>
        <BaseButton type="submit" variant="gold" :disabled="saving">
          {{ saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Enviar a aprobación' }}
        </BaseButton>
      </div>
    </div>

    <slot name="alert" />

    <div class="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-2">
      <div class="rounded-3xl bg-white p-7 shadow-(--shadow-card)">
        <p class="mb-[18px] font-display text-lg font-bold text-[#1c1c1c]">Información del material</p>
        <div class="flex flex-col gap-[18px]">
          <div>
            <label for="mat_title" :class="labelClass">Título</label>
            <Field id="mat_title" name="mat_title" type="text" maxlength="80" placeholder="Ej. Manual de POO en C++" :class="inputClass" />
            <ErrorMessage v-slot="{ message }" name="mat_title">
              <p :class="errorClass">{{ message }}</p>
            </ErrorMessage>
          </div>

          <div>
            <label for="mat_description" :class="labelClass">Descripción</label>
            <Field
              id="mat_description"
              name="mat_description"
              as="textarea"
              maxlength="300"
              placeholder="Describe brevemente el contenido del material…"
              class="min-h-[88px] w-full resize-y rounded-[14px] border-[1.5px] border-gris-interfaz px-4 py-3 font-display text-[15px] text-[#1c1c1c] outline-none focus:border-cobre-digital"
            />
            <ErrorMessage v-slot="{ message }" name="mat_description">
              <p :class="errorClass">{{ message }}</p>
            </ErrorMessage>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="mat_code" :class="labelClass">Código</label>
              <Field id="mat_code" name="mat_code" type="text" maxlength="14" placeholder="Ej. MAT-POO-014" :class="inputClass" />
              <ErrorMessage v-slot="{ message }" name="mat_code">
                <p :class="errorClass">{{ message }}</p>
              </ErrorMessage>
            </div>
            <div>
              <label for="mat_publication_date" :class="labelClass">Fecha de publicación</label>
              <Field id="mat_publication_date" name="mat_publication_date" type="date" :class="inputClass" />
              <ErrorMessage v-slot="{ message }" name="mat_publication_date">
                <p :class="errorClass">{{ message }}</p>
              </ErrorMessage>
            </div>
          </div>

          <div>
            <p :class="labelClass">Asignatura</p>
            <div :class="unavailableClass" aria-disabled="true">{{ UNAVAILABLE }}</div>
          </div>

          <div>
            <p :class="labelClass">Categorías</p>
            <div :class="unavailableClass" aria-disabled="true">{{ UNAVAILABLE }}</div>
          </div>
        </div>
      </div>

      <div class="rounded-3xl bg-white p-7 shadow-(--shadow-card)">
        <p class="mb-1.5 font-display text-lg font-bold text-[#1c1c1c]">Archivos</p>
        <p class="mb-4 font-body text-xs text-[#999]">{{ UNAVAILABLE }}</p>
        <div
          class="flex cursor-not-allowed flex-col items-center gap-2 rounded-[18px] border-2 border-dashed border-gris-interfaz bg-[#f6f7f9] px-5 py-[34px] text-center opacity-60"
          aria-disabled="true"
        >
          <span class="flex size-[54px] items-center justify-center rounded-[15px] bg-oro-faint text-cobre-digital">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 16V4M7 9l5-5 5 5" />
              <path d="M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
            </svg>
          </span>
          <p class="font-display text-base font-semibold text-[#1c1c1c]">Arrastra y suelta tus archivos aquí</p>
          <p class="font-body text-[13px] text-[#999]">o busca en tu equipo</p>
        </div>
      </div>
    </div>
  </Form>
</template>
