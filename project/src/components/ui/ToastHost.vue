<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

const KIND_STYLES = {
  success: { accent: '#1E8A4C', bg: '#e4f5ea', glyph: '✓' },
  error: { accent: '#93372B', bg: '#fbe9e7', glyph: '!' },
}

function styleFor(kind) {
  return KIND_STYLES[kind] ?? KIND_STYLES.success
}
</script>

<template>
  <div class="pointer-events-none fixed top-20 right-6 z-300 flex flex-col gap-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto flex min-w-70 max-w-95 items-center gap-3 rounded-2xl bg-white p-3.5 shadow-(--shadow-pop)"
      :style="{ borderLeft: `5px solid ${styleFor(toast.kind).accent}` }"
    >
      <span
        class="flex size-7.5 flex-none items-center justify-center rounded-full text-base font-extrabold"
        :style="{ background: styleFor(toast.kind).bg, color: styleFor(toast.kind).accent }"
      >{{ styleFor(toast.kind).glyph }}</span>
      <p class="flex-1 font-display text-sm font-medium text-texto">{{ toast.message }}</p>
      <button
        type="button"
        class="text-lg leading-none text-black/30 hover:text-black/50"
        @click="dismiss(toast.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>
