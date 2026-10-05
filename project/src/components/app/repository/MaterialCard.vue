<script setup>
import { computed } from 'vue'

import { formatDate } from '@/utils/date'

import { categoryClasses, typeStyle } from './material-styles'

const props = defineProps({
  material: {
    type: Object,
    required: true,
  },
})

const style = computed(() => typeStyle(props.material.type))
const author = computed(() => props.material.author_name ?? props.material.fk_materials_users ?? '—')
</script>

<template>
  <RouterLink
    :to="`/app/repository/${material.mat_serial}`"
    class="flex items-start gap-4 rounded-[20px] bg-white p-5 shadow-(--shadow-card) transition hover:-translate-y-0.5"
  >
    <span class="flex size-[54px] flex-none items-center justify-center rounded-[14px]" :class="style.classes">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path v-for="d in style.icon" :key="d" :d="d" />
      </svg>
    </span>
    <span class="min-w-0 flex-1">
      <span class="mb-1.5 flex items-center gap-2">
        <span
          v-if="material.type"
          class="rounded-full px-2.5 py-[3px] font-display text-[11px] font-bold"
          :class="style.classes"
        >{{ material.type }}</span>
        <span class="font-body text-[11px] text-[#aaa]">{{ material.mat_code }}</span>
      </span>
      <span class="block font-display text-[17px] font-bold leading-snug text-[#1c1c1c]">{{ material.mat_title }}</span>
      <span class="mt-1.5 block break-all font-body text-xs text-[#888]">
        {{ author }} · {{ formatDate(material.mat_publication_date) ?? '—' }}
      </span>
      <span v-if="material.category || material.files" class="mt-2.5 flex flex-wrap gap-1.5">
        <span
          v-if="material.category"
          class="rounded-full px-2.5 py-[3px] font-display text-[10px] font-bold"
          :class="categoryClasses(material.category)"
        >{{ material.category }}</span>
        <span
          v-if="material.files"
          class="rounded-full bg-[#eef0f3] px-2.5 py-[3px] font-display text-[10px] font-semibold text-[#5b6675]"
        >{{ material.files.length }} archivo(s)</span>
      </span>
    </span>
  </RouterLink>
</template>
