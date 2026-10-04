<script setup>
import { formatDate } from '@/utils/date'

defineProps({
  // profile.medals (GET /profile): las 5 MedalResource más recientes
  // { name, description, obtained_at, image }.
  medals: {
    type: Array,
    required: true,
  },
})

// El backend no expone todavía un listado completo de medallas ni ids/
// categorías para elegir destacadas, así que "Ver todas" y la selección de
// destacadas (AllMedalsModal.vue + useFeaturedMedals.js) quedan desconectadas
// hasta que exista ese endpoint.
</script>

<template>
  <div class="rounded-(--radius-card) bg-white p-[18px] shadow-(--shadow-card) sm:p-6">
    <p class="font-display text-[17px] font-bold text-negro-sintaxis">Medallas recientes</p>
    <p class="mt-0.5 font-display text-[13px] text-[#999]">Obtenidas por cursos completados</p>

    <div v-if="medals.length" class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
      <div
        v-for="medal in medals"
        :key="`${medal.name}-${medal.obtained_at}`"
        class="flex flex-col items-center gap-1.5 text-center"
        :title="medal.description ?? medal.name"
      >
        <img
          v-if="medal.image"
          :src="medal.image"
          :alt="medal.name"
          class="size-10.5 rounded-full object-cover shadow-[0_3px_8px_rgba(0,0,0,.12)] sm:size-12"
        >
        <span
          v-else
          class="flex size-10.5 items-center justify-center rounded-full bg-tag-datos-bg text-tag-datos-fg shadow-[0_3px_8px_rgba(0,0,0,.12)] sm:size-12"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="14" r="6.5" />
            <path d="m9 12.3 2 2 4-4" />
            <path d="M8.5 3.5 6 8m9-4.5L17.5 8" />
          </svg>
        </span>
        <span class="font-display text-[11px] font-semibold leading-tight text-negro-sintaxis">{{ medal.name }}</span>
        <span v-if="medal.obtained_at" class="font-display text-[10px] text-[#999]">{{ formatDate(medal.obtained_at) }}</span>
      </div>
    </div>
    <p v-else class="mt-4 font-display text-sm text-[#999]">
      Aún no tienes medallas. Completa un curso para obtener la primera.
    </p>
  </div>
</template>
