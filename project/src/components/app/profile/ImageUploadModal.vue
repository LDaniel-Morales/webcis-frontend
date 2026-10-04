<script setup>
import { ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import { IMAGE_ACCEPT, validateImageFile } from '@/utils/image'

// Modal de subida para PATCH /me/profile-picture y PATCH /me/banner. Emite
// el File elegido en `save`; la vista hace la petición y devuelve el estado
// con `saving` / `error`.
const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  currentSrc: {
    type: String,
    default: null,
  },
  // 'avatar' (círculo) o 'banner' (rectángulo ancho): solo cambia el preview.
  shape: {
    type: String,
    default: 'avatar',
  },
  // Reglas del Form Request correspondiente en el backend.
  rules: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const previewSrc = ref(null)
// La vista previa arranca con la imagen actual; si esa URL no carga, se
// muestra el texto de "elegir imagen" en vez del ícono roto.
const previewFailed = ref(false)
const selectedFile = ref(null)
const localError = ref(null)
const fileInput = ref(null)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    previewSrc.value = props.currentSrc
    previewFailed.value = false
    selectedFile.value = null
    localError.value = null
  },
)

function pickFile() {
  fileInput.value?.click()
}

async function onFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  localError.value = await validateImageFile(file, props.rules)
  if (localError.value) return

  selectedFile.value = file
  previewSrc.value = URL.createObjectURL(file)
  previewFailed.value = false
}

function confirm() {
  if (selectedFile.value) emit('save', selectedFile.value)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-280 flex items-center justify-center bg-[rgba(8,12,20,.62)] p-6" @click="$emit('close')">
    <div
      class="max-w-full rounded-(--radius-card) bg-white p-8 shadow-(--shadow-pop)"
      :class="shape === 'banner' ? 'w-160' : 'w-105'"
      @click.stop
    >
      <p class="font-display text-xl font-bold text-negro-sintaxis">{{ title }}</p>
      <p class="mt-1.5 mb-4.5 font-display text-sm text-[#666]">Elige una imagen desde tu equipo.</p>

      <button
        type="button"
        class="mx-auto flex items-center justify-center overflow-hidden border-[3px] border-dashed border-gris-interfaz"
        :class="shape === 'banner' ? 'h-40 w-full rounded-2xl' : 'size-55 rounded-full'"
        @click="pickFile"
      >
        <img
          v-if="previewSrc && !previewFailed"
          :src="previewSrc"
          alt=""
          class="size-full object-cover"
          @error="previewFailed = true"
        >
        <span v-else class="px-6 text-center font-display text-sm text-[#999]">Haz click para elegir una imagen</span>
      </button>
      <input ref="fileInput" type="file" :accept="IMAGE_ACCEPT" class="hidden" @change="onFileChange">

      <p class="mt-3.5 text-center font-display text-xs text-[#999]">
        JPG, PNG o WEBP · máx. {{ rules.maxKB / 1024 }} MB · mínimo {{ rules.minWidth }}×{{ rules.minHeight }} px.
      </p>
      <p v-if="localError || error" class="mt-2 text-center font-display text-xs text-red-600" role="alert">
        {{ localError || error }}
      </p>

      <div class="mt-5.5 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-[14px] border-[1.5px] border-[#e2e4e8] px-5.5 py-2.5 font-display text-[15px] font-semibold text-[#555]"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <BaseButton variant="gold" :disabled="!selectedFile || saving" @click="confirm">
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
