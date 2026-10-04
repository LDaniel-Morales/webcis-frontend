<script setup>
import { computed, onMounted } from 'vue'

import ContinueCourseCard from '@/components/app/dashboard/ContinueCourseCard.vue'
import EnrolledCoursesList from '@/components/app/dashboard/EnrolledCoursesList.vue'
import QuickAccessGrid from '@/components/app/dashboard/QuickAccessGrid.vue'
import StatCard from '@/components/app/dashboard/StatCard.vue'
import WelcomeHeader from '@/components/app/dashboard/WelcomeHeader.vue'
import { useDashboardStore } from '@/stores/dashboard'

const dashboard = useDashboardStore()

onMounted(() => {
  dashboard.fetchDashboard()
})

function statValue(value, suffix = '') {
  return dashboard.loaded && value !== null ? `${value}${suffix}` : '—'
}

const coursesValue = computed(() => statValue(dashboard.courses))
const progressValue = computed(() => statValue(dashboard.progress, '%'))
const medalsValue = computed(() => statValue(dashboard.medals))

const errorDetails = computed(() => {
  const err = dashboard.error
  if (!err) return null
  return {
    title: err.status ? `Error ${err.status}` : 'Error de red',
    message: err.message,
  }
})
</script>

<template>
  <section>
    <WelcomeHeader />

    <div
      v-if="errorDetails"
      class="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-white/85"
      role="alert"
    >
      <p class="font-display font-bold text-red-300">{{ errorDetails.title }} · No pudimos cargar tu resumen</p>
      <p class="mt-1 break-words">{{ errorDetails.message }}</p>
    </div>

    <div class="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
      <ContinueCourseCard :course="dashboard.latestCourse" :recent-course-progress="dashboard.recent_course_progress" />

      <div class="flex flex-col gap-4">
        <StatCard :value="coursesValue" label="Cursos en progreso" icon-bg-class="bg-tag-poo-bg">
          <template #icon>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-tag-poo-fg)" stroke-width="1.9">
              <path d="M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z" />
            </svg>
          </template>
        </StatCard>
        <StatCard :value="progressValue" label="Progreso promedio" icon-bg-class="bg-tag-web-bg">
          <template #icon>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-tag-web-fg)" stroke-width="1.9">
              <path d="M3 17l5-5 4 4 8-8" />
            </svg>
          </template>
        </StatCard>
        <StatCard :value="medalsValue" label="Medallas obtenidas" icon-bg-class="bg-tag-datos-bg">
          <template #icon>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-tag-datos-fg)" stroke-width="1.9">
              <circle cx="12" cy="9" r="5" />
              <path d="m9 13-1.5 8L12 18l4.5 3L15 13" />
            </svg>
          </template>
        </StatCard>
      </div>
    </div>

    <div class="mt-9">
      <QuickAccessGrid />
    </div>

    <div class="mt-9">
      <EnrolledCoursesList :courses="dashboard.recent_courses" />
    </div>
  </section>
</template>
