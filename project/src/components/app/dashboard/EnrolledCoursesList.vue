<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { formatDate } from '@/utils/date'

defineProps({
  courses: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div>
    <h2 class="mb-4 font-display text-xl font-bold text-acento">Cursos recientes</h2>

    <div v-if="courses.length" class="flex flex-col gap-4">
      <div
        v-for="course in courses"
        :key="course.code"
        class="grid grid-cols-[160px_1fr] gap-6 rounded-(--radius-card) bg-white p-6 shadow-(--shadow-card)"
      >
        <img
          v-if="course.icon"
          :src="course.icon"
          alt=""
          class="aspect-square rounded-2xl bg-gris-interfaz object-contain p-2"
        >
        <div v-else class="flex aspect-square items-center justify-center rounded-2xl bg-gris-interfaz">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-acento)" stroke-width="1.5">
            <path d="M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z" />
          </svg>
        </div>
        <div class="flex flex-col">
          <p class="font-display text-xl font-bold text-texto">{{ course.title }}</p>
          <p class="mt-1 font-display text-base font-semibold text-texto">{{ course.short_title }}</p>
          <p v-if="course.last_accessed_at" class="mt-2 font-body text-sm text-texto/70">
            Último acceso: {{ formatDate(course.last_accessed_at) }}
          </p>
          <div class="mt-auto flex justify-end gap-3 pt-4">
            <RouterLink :to="`/app/courses/${course.code}`">
              <BaseButton variant="gold">Contenido</BaseButton>
            </RouterLink>
            <RouterLink :to="`/app/courses/${course.code}`">
              <BaseButton variant="blue">Continuar</BaseButton>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center gap-2 rounded-(--radius-card) border border-dashed border-white/20 bg-white/4 px-6 py-12 text-center"
    >
      <svg
        width="72"
        height="72"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-acento)"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="opacity-85"
      >
        <path d="M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z" />
        <path d="M9 4.5V14l2.4-1.6L13.8 14V4.5" />
        <path d="M12 17.5v3M9 20.5h6" />
      </svg>
      <p class="mt-2 font-display text-[22px] font-bold text-white">
        Aún no te has inscrito a ningún curso
      </p>
      <p class="max-w-[400px] font-display text-[15px] font-normal text-white/60">
        Explora el catálogo y encuentra cursos de la comunidad de Ingeniería en Sistemas para empezar a aprender.
      </p>
      <RouterLink to="/app/explorer" class="mt-3">
        <BaseButton variant="gold">Explorar Cursos</BaseButton>
      </RouterLink>
    </div>
  </div>
</template>
