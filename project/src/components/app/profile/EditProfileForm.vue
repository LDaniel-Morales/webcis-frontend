<script setup>
import { ErrorMessage, Field, Form } from 'vee-validate'

import BaseButton from '@/components/ui/BaseButton.vue'
import { profileEditSchema } from '@/schemas/validationSchema.js'

defineProps({
  // Valores iniciales con los nombres de PATCH /me: username, description,
  // name, surname, second_surname.
  initialValues: {
    type: Object,
    required: true,
  },
  // Solo lectura: PATCH /me no permite cambiarlos.
  email: {
    type: String,
    default: null,
  },
  controlNumber: {
    type: String,
    default: null,
  },
  roleLabel: {
    type: String,
    default: '',
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

// Se reenvían las acciones de vee-validate para que la vista pueda pintar
// los errores 422 del backend en cada campo (setErrors).
function onSubmit(values, actions) {
  emit('submit', values, actions)
}

const inputClass =
  'h-12 w-full rounded-[13px] border-[1.5px] border-gris-interfaz px-3.5 font-display text-[14.5px] outline-none focus:border-cobre-digital'
</script>

<template>
  <Form class="flex flex-col gap-[18px]" :validation-schema="profileEditSchema" :initial-values="initialValues" @submit="onSubmit">
    <div class="rounded-(--radius-card) bg-white p-[18px] shadow-(--shadow-card) sm:p-6">
      <p class="font-display text-[17px] font-bold text-negro-sintaxis">Información de la cuenta</p>

      <div class="mt-4 flex flex-col gap-4">
        <div>
          <p class="mb-1.5 block font-display text-[13.5px] font-semibold text-negro-sintaxis">Correo electrónico</p>
          <div class="flex h-12 items-center rounded-[13px] bg-[#f6f7f9] px-3.5 font-display text-[14.5px] text-[#555]">{{ email ?? '—' }}</div>
        </div>

        <div>
          <label for="username" class="mb-1.5 block font-display text-[13.5px] font-semibold text-negro-sintaxis">
            Nombre de usuario
          </label>
          <div class="flex h-12 items-center rounded-[13px] border-[1.5px] border-gris-interfaz px-3.5 focus-within:border-cobre-digital">
            <span class="font-display text-[14.5px] text-[#999]">@</span>
            <Field
              id="username"
              name="username"
              type="text"
              autocomplete="username"
              class="ml-0.5 h-full flex-1 font-display text-[14.5px] outline-none"
            />
          </div>
          <ErrorMessage v-slot="{ message }" name="username">
            <p class="mt-1 font-display text-xs text-red-600">{{ message }}</p>
          </ErrorMessage>
        </div>

        <div>
          <label for="description" class="mb-1.5 block font-display text-[13.5px] font-semibold text-negro-sintaxis">
            Descripción
          </label>
          <Field
            id="description"
            name="description"
            as="textarea"
            rows="3"
            class="w-full resize-y rounded-[13px] border-[1.5px] border-gris-interfaz px-3.5 py-2.5 font-display text-[14.5px] outline-none focus:border-cobre-digital"
          />
          <p class="mt-1.5 font-display text-xs text-[#999]">Visible en tu muro para toda la comunidad WebCIS.</p>
          <ErrorMessage v-slot="{ message }" name="description">
            <p class="mt-1 font-display text-xs text-red-600">{{ message }}</p>
          </ErrorMessage>
        </div>
      </div>
    </div>

    <div class="rounded-(--radius-card) bg-white p-[18px] shadow-(--shadow-card) sm:p-6">
      <p class="font-display text-[17px] font-bold text-negro-sintaxis">Información personal</p>

      <div class="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div>
          <label for="name" class="mb-1.5 block font-display text-[13.5px] font-semibold text-negro-sintaxis">
            Nombre(s)
          </label>
          <Field id="name" name="name" type="text" autocomplete="given-name" :class="inputClass" />
          <ErrorMessage v-slot="{ message }" name="name">
            <p class="mt-1 font-display text-xs text-red-600">{{ message }}</p>
          </ErrorMessage>
        </div>

        <div>
          <p class="mb-1.5 block font-display text-[13.5px] font-semibold text-negro-sintaxis">Número de control</p>
          <div class="flex h-12 items-center rounded-[13px] bg-[#f6f7f9] px-3.5 font-display text-[14.5px] text-[#555]">{{ controlNumber ?? '—' }}</div>
        </div>

        <div>
          <label for="surname" class="mb-1.5 block font-display text-[13.5px] font-semibold text-negro-sintaxis">
            Primer apellido
          </label>
          <Field id="surname" name="surname" type="text" autocomplete="family-name" :class="inputClass" />
          <ErrorMessage v-slot="{ message }" name="surname">
            <p class="mt-1 font-display text-xs text-red-600">{{ message }}</p>
          </ErrorMessage>
        </div>

        <div>
          <label for="second_surname" class="mb-1.5 block font-display text-[13.5px] font-semibold text-negro-sintaxis">
            Segundo apellido
          </label>
          <Field id="second_surname" name="second_surname" type="text" autocomplete="additional-name" :class="inputClass" />
          <ErrorMessage v-slot="{ message }" name="second_surname">
            <p class="mt-1 font-display text-xs text-red-600">{{ message }}</p>
          </ErrorMessage>
        </div>

        <div class="sm:col-span-2">
          <p class="mb-1.5 block font-display text-[13.5px] font-semibold text-negro-sintaxis">Tipo de usuario</p>
          <div class="flex h-12 items-center gap-2.5 rounded-[13px] bg-[#f6f7f9] px-3.5">
            <span
              class="rounded-full px-2.5 py-0.5 font-display text-xs font-bold"
              style="background: var(--color-tag-poo-bg); color: var(--color-tag-poo-fg)"
            >{{ roleLabel }}</span>
            <span class="ml-auto font-display text-[11.5px] text-[#999]">Solo informativo · asignado por administración</span>
          </div>
        </div>
      </div>

      <div class="mt-5 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-[13px] border-[1.5px] border-[#e2e4e8] px-5 py-2.5 font-display text-sm font-semibold text-[#555]"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>
        <BaseButton type="submit" variant="gold" :disabled="saving">
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </BaseButton>
      </div>
    </div>
  </Form>
</template>
