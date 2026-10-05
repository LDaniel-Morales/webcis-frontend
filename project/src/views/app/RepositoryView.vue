<script setup>
import { computed, onMounted, ref } from 'vue'

import MaterialCard from '@/components/app/repository/MaterialCard.vue'
import RepositoryFilters from '@/components/app/repository/RepositoryFilters.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { MOCK_MATERIALS, MOCK_NOTICE } from '@/mocks/materials.mock'
import { useMaterialsStore } from '@/stores/materials'

const materials = useMaterialsStore()

const query = ref('')
const type = ref('')
const category = ref('')
const subject = ref('')

onMounted(() => {
  materials.fetchMaterials()
})

const usingMock = computed(() => materials.loaded && !materials.error && materials.materials.length === 0)
const source = computed(() => (usingMock.value ? MOCK_MATERIALS : materials.materials))

function uniqueValues(key) {
  return [...new Set(source.value.map((material) => material[key]).filter(Boolean))]
}

const types = computed(() => uniqueValues('type'))
const categories = computed(() => uniqueValues('category'))
const subjects = computed(() => uniqueValues('subject'))

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  return source.value.filter((material) => {
    if (type.value && material.type !== type.value) return false
    if (category.value && material.category !== category.value) return false
    if (subject.value && material.subject !== subject.value) return false
    if (!term) return true
    return [material.mat_title, material.mat_code, material.author_name ?? material.fk_materials_users]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term))
  })
})

const resultCount = computed(() => `${filtered.value.length} ${filtered.value.length === 1 ? 'material' : 'materiales'}`)
const showSkeleton = computed(() => materials.loading && !materials.loaded && !materials.error)

function clearFilters() {
  query.value = ''
  type.value = ''
  category.value = ''
  subject.value = ''
}
</script>

<template>
  <section>
    <h1 class="font-display text-[38px] font-bold text-white">Repositorio Digital</h1>
    <p class="mb-[22px] font-display text-base text-white/60">
      Manuales, prácticas, proyectos y código compartidos por la comunidad.
    </p>

    <RepositoryFilters
      v-model:query="query"
      v-model:type="type"
      v-model:category="category"
      v-model:subject="subject"
      :types="types"
      :categories="categories"
      :subjects="subjects"
    />

    <p
      v-if="usingMock"
      class="mt-5 inline-flex rounded-full border border-acento/40 bg-acento/10 px-4 py-1.5 font-display text-[13px] font-semibold text-acento"
      role="status"
    >
      {{ MOCK_NOTICE }}
    </p>

    <div v-if="!materials.error" class="mt-6 mb-3.5 flex items-center justify-between">
      <p class="font-display text-[15px] font-semibold text-white/75">{{ showSkeleton ? 'Cargando…' : resultCount }}</p>
      <button
        type="button"
        class="font-display text-sm font-semibold text-white/60 underline underline-offset-[3px]"
        @click="clearFilters"
      >
        Limpiar filtros
      </button>
    </div>

    <div v-if="showSkeleton" class="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
      <div v-for="n in 6" :key="n" class="flex gap-4 rounded-[20px] bg-white p-5 shadow-(--shadow-card)">
        <div class="size-[54px] flex-none animate-pulse rounded-[14px] bg-[#e9eaee]" />
        <div class="flex-1">
          <div class="h-3.5 w-2/5 animate-pulse rounded-lg bg-[#e9eaee]" />
          <div class="mt-2.5 h-[18px] w-4/5 animate-pulse rounded-lg bg-[#e9eaee]" />
          <div class="mt-2.5 h-3 w-1/2 animate-pulse rounded-lg bg-[#e9eaee]" />
        </div>
      </div>
    </div>

    <div
      v-else-if="materials.error"
      class="mt-6 flex flex-col items-center gap-1.5 rounded-3xl border border-[#d6788c]/35 bg-[#610d31]/18 px-6 py-[60px] text-center"
      role="alert"
    >
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" class="text-[#e58ba1]">
        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      </svg>
      <p class="mt-2.5 font-display text-2xl font-bold text-white">No se pudo cargar el repositorio</p>
      <p class="max-w-[440px] wrap-break-word font-display text-base text-white/65">
        {{ materials.error.status ? `Error ${materials.error.status}` : 'Error de red' }} · {{ materials.error.message }}
      </p>
      <div class="mt-[18px]">
        <BaseButton variant="gold" @click="materials.fetchMaterials()">Reintentar</BaseButton>
      </div>
    </div>

    <div
      v-else-if="!filtered.length"
      class="flex flex-col items-center gap-1.5 rounded-3xl border border-dashed border-white/20 bg-white/4 px-6 py-[60px] text-center"
    >
      <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="text-oro-ingenieril opacity-85">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 13h6" />
      </svg>
      <p class="mt-2.5 font-display text-2xl font-bold text-white">Sin materiales que mostrar</p>
      <p class="max-w-[430px] font-display text-base text-white/60">
        No hay recursos que coincidan con los filtros activos. Prueba con otra categoría o limpia la búsqueda.
      </p>
      <div class="mt-[18px]">
        <BaseButton variant="gold" @click="clearFilters">Limpiar filtros</BaseButton>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
      <MaterialCard v-for="material in filtered" :key="material.mat_serial" :material="material" />
    </div>
  </section>
</template>
