<script setup>
import { fileClasses } from './material-styles'

defineProps({
  files: {
    type: Array,
    default: null,
  },
})

const UNAVAILABLE = 'Aún no disponible en el servidor'
</script>

<template>
  <div class="rounded-3xl bg-white p-[26px] shadow-(--shadow-card)">
    <div class="mb-4 flex items-center justify-between gap-3">
      <p class="font-display text-lg font-bold text-[#1c1c1c]">Archivos</p>
      <button
        v-if="files?.length"
        type="button"
        disabled
        :title="UNAVAILABLE"
        class="rounded-xl bg-primario px-4 py-2 font-display text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Descargar todo
      </button>
    </div>

    <div v-if="files?.length" class="flex flex-col gap-2.5">
      <div
        v-for="file in files"
        :key="file.name"
        class="flex items-center gap-[13px] rounded-[14px] border border-[#eef0f3] p-3"
      >
        <span
          class="flex size-[42px] flex-none items-center justify-center rounded-[11px] font-display text-[11px] font-extrabold"
          :class="fileClasses(file.ext)"
        >{{ file.ext }}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate font-display text-sm font-semibold text-[#1c1c1c]">{{ file.name }}</span>
          <span class="block font-body text-xs text-[#999]">{{ file.kind }} · {{ file.size }}</span>
        </span>
        <button
          type="button"
          disabled
          :title="UNAVAILABLE"
          class="flex size-[38px] flex-none items-center justify-center rounded-[11px] bg-oro-faint text-cobre-digital disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span class="sr-only">Descargar {{ file.name }}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v12M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </button>
      </div>
      <p class="mt-1 font-body text-xs text-[#999]">Descargas: {{ UNAVAILABLE }}</p>
    </div>

    <div v-else class="rounded-[14px] border border-dashed border-gris-interfaz px-4 py-8 text-center">
      <p class="font-display text-sm font-semibold text-[#5b6675]">{{ UNAVAILABLE }}</p>
    </div>
  </div>
</template>
