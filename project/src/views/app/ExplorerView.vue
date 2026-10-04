<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CourseCard from '@/components/app/courses/CourseCard.vue'
import {
  filtersToQuery,
  isSameQuery,
  ORDER_OPTIONS,
  PER_PAGE_OPTIONS,
  SORT_OPTIONS,
  useCoursesStore,
} from '@/stores/courses'

const SORT_LABELS = { title: 'Título', created_at: 'Fecha de creación', updated_at: 'Última actualización' }
const ORDER_LABELS = { asc: 'Ascendente', desc: 'Descendente' }

const route = useRoute()
const router = useRouter()
const courses = useCoursesStore()
const search = ref(courses.filters.search)
let searchTimer = null

// No hay endpoint para listar categorías/materias (FALT-01/02): los nombres
// de los filtros activos se recuerdan a partir de los cursos ya cargados.
const knownNames = reactive({ categories: {}, subjects: {} })

watch(
  () => courses.data,
  (list) => {
    for (const course of list) {
      for (const category of course.categories ?? []) knownNames.categories[category.code] = category.name
      for (const subject of course.subjects ?? []) knownNames.subjects[subject.code] = subject.name
    }
  },
)

// Filtros ↔ URL. La URL es la entrada: al montar (recarga, enlace compartido,
// "Atrás" desde el detalle) y cuando cambia (Atrás/Adelante o edición a mano)
// se leen y validan sus filtros. Cada cambio de filtro se escribe en la URL
// con replace, para no llenar el historial con un paso por cada tecla.
onMounted(() => {
  courses.applyQuery(route.query)
})

watch(
  () => route.query,
  (query) => {
    if (route.path !== '/app/explorer') return
    if (!isSameQuery(query, filtersToQuery(courses.filters))) courses.applyQuery(query)
  },
)

watch(
  () => courses.filters,
  (filters) => {
    if (filters.search !== search.value.trim()) search.value = filters.search
    const query = filtersToQuery(filters)
    if (!isSameQuery(query, route.query)) router.replace({ query })
  },
  { deep: true },
)

// per_page puede llegar por URL con cualquier valor válido (1-50); se agrega
// al select si no está entre las opciones.
const perPageOptions = computed(() =>
  [...new Set([...PER_PAGE_OPTIONS, courses.filters.per_page])].sort((a, b) => a - b),
)

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
})

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    courses.setFilters({ search: search.value.trim() })
  }, 350)
}

function toggle(key, item) {
  knownNames[key][item.code] = item.name
  courses.toggleFilterCode(key, item.code)
}

const activeFilters = computed(() => [
  ...courses.filters.categories.map((code) => ({ key: 'categories', code, name: knownNames.categories[code] ?? code })),
  ...courses.filters.subjects.map((code) => ({ key: 'subjects', code, name: knownNames.subjects[code] ?? code })),
])

function clearAll() {
  search.value = ''
  courses.resetFilters()
}

const hasFilters = computed(
  () =>
    Boolean(courses.filters.search) ||
    Boolean(courses.filters.created_from) ||
    Boolean(courses.filters.created_to) ||
    activeFilters.value.length > 0,
)

// Error del backend tal cual (código, mensaje y errores de validación 422),
// para que sea evidente qué respondió la API.
const errorDetails = computed(() => {
  const err = courses.error
  if (!err) return null
  const validation = Object.values(err.data?.errors ?? {}).flat()
  return {
    title: err.status ? `Error ${err.status}` : 'Error de red',
    message: err.message,
    validation,
  }
})
const currentPage = computed(() => courses.meta?.current_page ?? 1)
const lastPage = computed(() => courses.meta?.last_page ?? 1)
</script>

<template>
  <section>
    <h1 class="font-display text-4xl font-bold text-white">Explorar cursos</h1>
    <p class="mt-2 max-w-2xl font-body text-white/70">
      Cursos publicados por la comunidad de Ingeniería en Sistemas.
    </p>

    <div class="mt-6 flex flex-col gap-3">
      <label class="sr-only" for="course-search">Buscar cursos</label>
      <input
        id="course-search"
        v-model="search"
        type="search"
        maxlength="100"
        placeholder="Buscar por título, descripción o código"
        class="h-12 w-full rounded-[13px] border-[1.5px] border-white/15 bg-white px-4 font-display text-[14.5px] text-texto outline-none focus:border-acento"
        @input="onSearchInput"
      >

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <label class="flex flex-col gap-1 font-display text-xs font-semibold text-white/70">
          Ordenar por
          <select
            :value="courses.filters.sort"
            class="h-11 rounded-[13px] bg-white px-3 text-[14px] font-normal text-texto outline-none"
            @change="courses.setFilters({ sort: $event.target.value })"
          >
            <option v-for="value in SORT_OPTIONS" :key="value" :value="value">{{ SORT_LABELS[value] }}</option>
          </select>
        </label>

        <label class="flex flex-col gap-1 font-display text-xs font-semibold text-white/70">
          Dirección
          <select
            :value="courses.filters.order"
            class="h-11 rounded-[13px] bg-white px-3 text-[14px] font-normal text-texto outline-none"
            @change="courses.setFilters({ order: $event.target.value })"
          >
            <option value="">Predeterminada</option>
            <option v-for="value in ORDER_OPTIONS" :key="value" :value="value">{{ ORDER_LABELS[value] }}</option>
          </select>
        </label>

        <label class="flex flex-col gap-1 font-display text-xs font-semibold text-white/70">
          Creado desde
          <input
            type="date"
            :value="courses.filters.created_from"
            :max="courses.filters.created_to || undefined"
            class="h-11 rounded-[13px] bg-white px-3 text-[14px] font-normal text-texto outline-none"
            @change="courses.setFilters({ created_from: $event.target.value })"
          >
        </label>

        <label class="flex flex-col gap-1 font-display text-xs font-semibold text-white/70">
          Creado hasta
          <input
            type="date"
            :value="courses.filters.created_to"
            :min="courses.filters.created_from || undefined"
            class="h-11 rounded-[13px] bg-white px-3 text-[14px] font-normal text-texto outline-none"
            @change="courses.setFilters({ created_to: $event.target.value })"
          >
        </label>

        <label class="flex flex-col gap-1 font-display text-xs font-semibold text-white/70">
          Cursos por página
          <select
            :value="courses.filters.per_page"
            class="h-11 rounded-[13px] bg-white px-3 text-[14px] font-normal text-texto outline-none"
            @change="courses.setFilters({ per_page: Number($event.target.value) })"
          >
            <option v-for="value in perPageOptions" :key="value" :value="value">{{ value }}</option>
          </select>
        </label>
      </div>
      <p class="font-body text-xs text-white/50">
        Para filtrar por categoría o materia, toca sus etiquetas en las tarjetas de los cursos.
      </p>
    </div>

    <div v-if="hasFilters" class="mt-3 flex flex-wrap items-center gap-2">
      <button
        v-for="filter in activeFilters"
        :key="`${filter.key}-${filter.code}`"
        type="button"
        class="flex items-center gap-1.5 rounded-full bg-primario px-3 py-1 font-display text-xs font-semibold text-white"
        @click="courses.toggleFilterCode(filter.key, filter.code)"
      >
        {{ filter.name }} <span aria-hidden="true">×</span>
        <span class="sr-only">Quitar filtro</span>
      </button>
      <button type="button" class="font-display text-xs font-semibold text-acento underline" @click="clearAll">
        Limpiar filtros
      </button>
    </div>
    <p v-if="courses.meta" class="mt-3 font-body text-sm text-white/60">
      {{ courses.meta.total }} {{ courses.meta.total === 1 ? 'curso' : 'cursos' }}
    </p>

    <p v-if="courses.loading && !courses.data.length" class="mt-8 font-body text-white/70">Cargando cursos…</p>

    <div
      v-else-if="errorDetails"
      class="mt-8 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-white/85"
      role="alert"
    >
      <p class="font-display font-bold text-red-300">{{ errorDetails.title }} · No pudimos cargar el catálogo</p>
      <ul v-if="errorDetails.validation.length" class="mt-1 list-disc pl-5">
        <li v-for="msg in errorDetails.validation" :key="msg">{{ msg }}</li>
      </ul>
      <p v-else class="mt-1 break-words">{{ errorDetails.message }}</p>
    </div>

    <div
      v-else-if="!courses.data.length"
      class="mt-8 rounded-(--radius-card) border border-dashed border-white/20 bg-white/4 px-6 py-12 text-center"
    >
      <p class="font-display text-xl font-bold text-white">
        {{ hasFilters ? 'Ningún curso coincide con tu búsqueda' : 'Aún no hay cursos publicados' }}
      </p>
      <button v-if="hasFilters" type="button" class="mt-3 font-display text-sm font-semibold text-acento underline" @click="clearAll">
        Limpiar filtros
      </button>
    </div>

    <div v-else class="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" :class="{ 'opacity-60': courses.loading }">
      <CourseCard
        v-for="course in courses.data"
        :key="course.code"
        :course="course"
        :active-categories="courses.filters.categories"
        :active-subjects="courses.filters.subjects"
        @toggle-category="toggle('categories', $event)"
        @toggle-subject="toggle('subjects', $event)"
      />
    </div>

    <nav v-if="lastPage > 1" class="mt-8 flex items-center justify-center gap-4" aria-label="Paginación">
      <button
        type="button"
        class="rounded-xl border-[1.5px] border-white/20 px-3 py-1.5 font-display text-sm font-semibold text-white disabled:opacity-40"
        :disabled="currentPage <= 1 || courses.loading"
        @click="courses.setPage(currentPage - 1)"
      >
        Anterior
      </button>
      <span class="font-display text-sm text-white/70">Página {{ currentPage }} de {{ lastPage }}</span>
      <button
        type="button"
        class="rounded-xl border-[1.5px] border-white/20 px-3 py-1.5 font-display text-sm font-semibold text-white disabled:opacity-40"
        :disabled="currentPage >= lastPage || courses.loading"
        @click="courses.setPage(currentPage + 1)"
      >
        Siguiente
      </button>
    </nav>
  </section>
</template>
