<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { ENROLLMENT_STATUS } from '@/utils/enums'

const props = defineProps({
  course: {
    type: Object,
    default: null,
  },
  recentCourseProgress: {
    type: Number,
    default: null,
  },
})

const percent = computed(() => {
  if (!props.course) return 0
  if (props.course.status === ENROLLMENT_STATUS.Completed) return 100
  return props.recentCourseProgress ?? 0
})
</script>

<template>
  <div class="flex flex-col rounded-(--radius-card) bg-white p-7 shadow-(--shadow-card)">
    <p class="font-display text-xs font-bold uppercase tracking-wider text-cobre-digital">
      Continúa donde lo dejaste
    </p>

    <div v-if="course" class="mt-4 flex items-center gap-5">
      <img
        v-if="course.icon"
        :src="course.icon"
        alt=""
        class="size-24 flex-none rounded-2xl bg-gris-interfaz object-contain p-1.5"
      >
      <div v-else class="flex size-24 flex-none items-center justify-center rounded-2xl bg-gris-interfaz">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-acento)" stroke-width="1.5">
          <path d="M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z" />
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="font-display text-2xl font-bold text-texto">{{ course.title }}</p>
        <p class="mt-0.5 font-display text-sm text-texto/60">{{ course.short_title }}</p>
        <div class="mt-3.5">
          <ProgressBar :percent="percent" />
        </div>
        <p class="mt-1.5 font-body text-xs text-texto/50">{{ percent }}% completado</p>
      </div>
    </div>
    <p v-else class="mt-4 font-body text-sm text-texto/60">
      Aún no tienes un curso en progreso.
    </p>

    <div class="mt-5 flex justify-end">
      <RouterLink :to="course ? `/app/courses/${course.code}` : '/app/explorer'">
        <BaseButton variant="blue">{{ course ? 'Continuar curso' : 'Explorar cursos' }}</BaseButton>
      </RouterLink>
    </div>
  </div>
</template>
