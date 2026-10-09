<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import { getCourse, getLesson, getLessons } from '@/services/course.service'

const UNAVAILABLE = 'Aún no disponible en el servidor'

const route = useRoute()
const course = ref(null)
const lessons = ref([])
const lesson = ref(null)
const loading = ref(false)
const error = ref(null)
const failedOn = ref(null)

async function loadCourse(code) {
  const [courseResponse, lessonsResponse] = await Promise.all([getCourse(code), getLessons(code)])
  course.value = courseResponse?.data ?? null
  lessons.value = [...(lessonsResponse?.lessons ?? [])].sort((a, b) => a.order - b.order)
}

async function load(code, id) {
  loading.value = true
  error.value = null
  lesson.value = null
  failedOn.value = 'course'
  try {
    if (course.value?.code !== code) await loadCourse(code)
    failedOn.value = 'lesson'
    lesson.value = (await getLesson(code, id))?.lesson ?? null
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.params.code, route.params.id],
  ([code, id]) => code && id && load(code, id),
  { immediate: true },
)

const position = computed(() => lessons.value.findIndex((item) => String(item.id) === String(route.params.id)))
const previous = computed(() => (position.value > 0 ? lessons.value[position.value - 1] : null))
const next = computed(() =>
  position.value !== -1 && position.value < lessons.value.length - 1 ? lessons.value[position.value + 1] : null,
)

const content = computed(() => {
  const value = lesson.value?.content
  if (value === null || value === undefined || value === '') return null
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
})

const errorTitle = computed(() => {
  if (error.value?.status !== 404) return 'No se pudo cargar la lección'
  return failedOn.value === 'course'
    ? 'Este curso no existe o ya no está disponible.'
    : 'Esta lección no existe o ya no está disponible.'
})

function lessonPath(item) {
  return `/app/courses/${route.params.code}/lessons/${item.id}`
}
</script>

<template>
  <section>
    <RouterLink
      :to="`/app/courses/${route.params.code}`"
      class="mb-3.5 inline-flex items-center gap-[7px] font-display text-sm font-semibold text-white/70 hover:text-white"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6" /></svg>
      {{ course?.title ?? route.params.code }}
    </RouterLink>

    <div class="mb-2 flex max-w-[880px] items-center justify-between">
      <p class="font-display text-sm text-white/60">Progreso del curso</p>
      <p class="font-display text-sm font-semibold text-oro-ingenieril">{{ UNAVAILABLE }}</p>
    </div>
    <div class="mb-[22px] h-[9px] max-w-[880px] overflow-hidden rounded-full bg-white/14" />

    <p v-if="loading" class="font-body text-white/70">Cargando lección…</p>

    <div
      v-else-if="error"
      class="flex max-w-[880px] flex-col items-center gap-1.5 rounded-3xl border border-[#d6788c]/35 bg-[#610d31]/18 px-6 py-[60px] text-center"
      role="alert"
    >
      <p class="font-display text-2xl font-bold text-white">
        {{ errorTitle }}
      </p>
      <p class="max-w-[440px] wrap-break-word font-display text-base text-white/65">
        {{ error.status ? `Error ${error.status}` : 'Error de red' }} · {{ error.message }}
      </p>
    </div>

    <template v-else-if="lesson">
      <article class="max-w-[880px] rounded-3xl bg-white px-[42px] py-[38px] shadow-(--shadow-card)">
        <p class="font-body text-[13px] font-bold uppercase tracking-wider text-cobre-digital">Lección {{ lesson.order }}</p>
        <h1 class="mt-1.5 mb-[18px] font-display text-[34px] font-bold text-[#1c1c1c]">{{ lesson.title }}</h1>
        <p v-if="content" class="whitespace-pre-wrap font-display text-[17px] leading-[1.7] text-[#444]">{{ content }}</p>
        <p v-else class="rounded-[14px] border border-dashed border-gris-interfaz bg-[#f6f7f9] px-5 py-8 text-center font-display text-[15px] text-[#999]">
          Contenido aún no disponible en el servidor
        </p>
      </article>

      <div class="mt-[22px] flex max-w-[880px] flex-wrap items-center justify-between gap-3.5">
        <RouterLink v-if="previous" :to="lessonPath(previous)" class="btn-webcis-ghost border-white/35! text-white!">← Anterior</RouterLink>
        <span v-else />
        <BaseButton variant="gold" disabled :title="UNAVAILABLE">Marcar como completada</BaseButton>
        <RouterLink v-if="next" :to="lessonPath(next)" class="btn-webcis-blue">Siguiente →</RouterLink>
        <span v-else />
      </div>
    </template>
  </section>
</template>
