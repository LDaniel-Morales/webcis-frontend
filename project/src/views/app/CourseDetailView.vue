<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getCourse } from '@/services/course.service'

// GET /courses/{code} → { data: CourseResource } { code, title, short_title,
// description, categories, subjects, image, lessons: [{ id, title,
// short_title, order }] }.
//
// El backend todavía no tiene endpoints para inscribirse a un curso ni para
// ver el contenido de una lección, así que esta vista es solo informativa.
const route = useRoute()
const course = ref(null)
const loading = ref(false)
const error = ref(null)
// Si la portada no carga (p. ej. 403 del storage del backend, BUG-03), se
// oculta y la tarjeta queda como un curso sin imagen.
const imageFailed = ref(false)

async function load(code) {
  loading.value = true
  error.value = null
  course.value = null
  imageFailed.value = false
  try {
    const response = await getCourse(code)
    course.value = response?.data ?? null
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

watch(() => route.params.code, (code) => code && load(code), { immediate: true })
</script>

<template>
  <section>
    <RouterLink to="/app/explorer" class="font-display text-sm font-semibold text-acento hover:underline">
      ← Volver a explorar
    </RouterLink>

    <p v-if="loading" class="mt-6 font-body text-white/70">Cargando curso…</p>

    <div
      v-else-if="error"
      class="mt-6 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-body text-sm text-white/70"
      role="alert"
    >
      {{ error.status === 404 ? 'Este curso no existe o ya no está disponible.' : `No pudimos cargar el curso. ${error.message}` }}
    </div>

    <template v-else-if="course">
      <div class="mt-5 overflow-hidden rounded-(--radius-card) bg-white shadow-(--shadow-card)">
        <img
          v-if="course.image && !imageFailed"
          :src="course.image"
          alt=""
          class="h-48 w-full object-cover sm:h-64"
          @error="imageFailed = true"
        >
        <div class="p-6 sm:p-8">
          <p class="font-display text-xs font-bold uppercase tracking-wider text-cobre-digital">{{ course.code }}</p>
          <h1 class="mt-1 font-display text-3xl font-bold text-texto">{{ course.title }}</h1>
          <p class="mt-1 font-display text-base text-texto/60">{{ course.short_title }}</p>

          <div v-if="course.categories?.length || course.subjects?.length" class="mt-4 flex flex-wrap gap-1.5">
            <span
              v-for="category in course.categories"
              :key="`cat-${category.code}`"
              class="rounded-full bg-tag-poo-bg px-2.5 py-0.5 font-display text-xs font-semibold text-tag-poo-fg"
            >{{ category.name }}</span>
            <span
              v-for="subject in course.subjects"
              :key="`sub-${subject.code}`"
              class="rounded-full bg-tag-web-bg px-2.5 py-0.5 font-display text-xs font-semibold text-tag-web-fg"
            >{{ subject.name }}</span>
          </div>

          <p v-if="course.description" class="mt-5 font-body text-[15px] leading-relaxed text-texto/80">
            {{ course.description }}
          </p>
        </div>
      </div>

      <div class="mt-6 rounded-(--radius-card) bg-white p-6 shadow-(--shadow-card) sm:p-8">
        <h2 class="font-display text-xl font-bold text-texto">Lecciones</h2>
        <ol v-if="course.lessons?.length" class="mt-4 flex flex-col">
          <li
            v-for="(lesson, index) in course.lessons"
            :key="lesson.id"
            :class="index > 0 ? 'border-t border-[#f1f2f5]' : ''"
          >
            <RouterLink
              :to="`/app/courses/${course.code}/lessons/${lesson.id}`"
              class="group -mx-3 flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-[#f6f7f9]"
            >
              <span class="flex size-9 flex-none items-center justify-center rounded-full bg-gris-interfaz font-display text-sm font-bold text-texto">
                {{ lesson.order }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-display text-[15px] font-semibold text-texto group-hover:text-cobre-digital">{{ lesson.title }}</span>
                <span v-if="lesson.short_title" class="block font-display text-xs text-texto/60">{{ lesson.short_title }}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="flex-none text-texto/40 group-hover:text-cobre-digital">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </RouterLink>
          </li>
        </ol>
        <p v-else class="mt-3 font-body text-sm text-texto/60">Este curso aún no tiene lecciones.</p>
      </div>
    </template>
  </section>
</template>
