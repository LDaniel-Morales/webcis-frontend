<script setup>
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import { MAX_FEATURED_MEDALS } from '@/composables/useFeaturedMedals'

import { formatCompletedDate, MEDAL_CATEGORY_CLASSES } from './profile.mock'

const PAGE_SIZE = 8

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  allMedals: {
    type: Array,
    required: true,
  },
  featuredIds: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['close', 'save'])

const page = ref(1)
const draftSelected = ref([])

// El modal abre siempre con la selección guardada como punto de partida; si
// el usuario cierra sin guardar, el draft se descarta (no se persiste nada
// hasta hacer click en "Guardar selección").
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    page.value = 1
    draftSelected.value = [...props.featuredIds]
  },
)

const totalPages = computed(() => Math.max(1, Math.ceil(props.allMedals.length / PAGE_SIZE)))
const pagedMedals = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return props.allMedals.slice(start, start + PAGE_SIZE)
})

function isSelected(id) {
  return draftSelected.value.includes(id)
}

function toggle(id) {
  if (isSelected(id)) {
    draftSelected.value = draftSelected.value.filter((selectedId) => selectedId !== id)
    return
  }
  if (draftSelected.value.length >= MAX_FEATURED_MEDALS) return
  draftSelected.value = [...draftSelected.value, id]
}

function categoryClasses(category) {
  return MEDAL_CATEGORY_CLASSES[category] ?? MEDAL_CATEGORY_CLASSES.poo
}

function confirmSave() {
  emit('save', draftSelected.value)
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-280 flex items-center justify-center bg-[rgba(8,12,20,.62)] p-6"
    @click="$emit('close')"
  >
    <div class="max-h-[80vh] w-160 max-w-full overflow-auto rounded-(--radius-card) bg-white p-8 shadow-(--shadow-pop)" @click.stop>
      <div class="flex items-center justify-between gap-4">
        <p class="font-display text-xl font-bold text-negro-sintaxis">Todas mis medallas</p>
        <button
          type="button"
          class="text-2xl leading-none text-black/30 hover:text-black/50"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
      <p class="mt-1 font-display text-sm text-[#666]">
        {{ allMedals.length }} medallas obtenidas por cursos completados.
      </p>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f6f7f9] px-4 py-3">
        <p class="font-display text-[13px] text-[#555]">
          Elegí hasta {{ MAX_FEATURED_MEDALS }} medallas para tu Muro ·
          <span class="font-semibold text-negro-sintaxis">{{ draftSelected.length }}/{{ MAX_FEATURED_MEDALS }}</span>
          seleccionadas
        </p>
        <BaseButton variant="gold" @click="confirmSave">Guardar selección</BaseButton>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
        <button
          v-for="medal in pagedMedals"
          :key="medal.id"
          type="button"
          class="flex flex-col items-center gap-2 rounded-2xl p-2 text-center"
          @click="toggle(medal.id)"
        >
          <span class="relative">
            <span
              class="flex size-18 items-center justify-center rounded-full shadow-[0_4px_10px_rgba(0,0,0,.12)]"
              :class="[categoryClasses(medal.category).bg, categoryClasses(medal.category).fg]"
              :style="isSelected(medal.id) ? { boxShadow: '0 0 0 3px var(--color-oro-ingenieril)' } : {}"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="14" r="6.5" />
                <path d="m9 12.3 2 2 4-4" />
                <path d="M8.5 3.5 6 8m9-4.5L17.5 8" />
              </svg>
            </span>
            <span
              v-if="isSelected(medal.id)"
              class="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-oro-ingenieril text-xs font-bold text-[#3a2a08]"
            >
              ✓
            </span>
          </span>
          <span class="font-display text-[12.5px] font-semibold leading-tight text-negro-sintaxis">{{ medal.label }}</span>
          <span class="font-display text-[11px] text-[#999]">{{ formatCompletedDate(medal.completedAt) }}</span>
        </button>
      </div>

      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          class="rounded-xl border-[1.5px] border-gris-interfaz px-3 py-1.5 font-display text-sm font-semibold text-[#555] disabled:opacity-40"
          :disabled="page === 1"
          @click="page -= 1"
        >
          Anterior
        </button>
        <span class="font-display text-sm text-[#666]">Página {{ page }} de {{ totalPages }}</span>
        <button
          type="button"
          class="rounded-xl border-[1.5px] border-gris-interfaz px-3 py-1.5 font-display text-sm font-semibold text-[#555] disabled:opacity-40"
          :disabled="page === totalPages"
          @click="page += 1"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>
