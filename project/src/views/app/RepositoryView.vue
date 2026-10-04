<script setup>
import { computed, onMounted } from 'vue'

import { useMaterialsStore } from '@/stores/materials'
import { formatDate } from '@/utils/date'

const materials = useMaterialsStore()

onMounted(() => {
  materials.fetchMaterials()
})

const errorDetails = computed(() => {
  const err = materials.error
  if (!err) return null
  return {
    title: err.status ? `Error ${err.status}` : 'Error de red',
    message: err.message,
  }
})
</script>

<template>
  <section>
    <h1 class="font-display text-4xl font-bold text-white">Repositorio digital</h1>
    <p class="mt-2 max-w-2xl font-body text-white/70">
      Materiales y recursos de apoyo compartidos por la comunidad.
    </p>

    <p v-if="materials.loaded" class="mt-6 font-body text-sm text-white/60">
      {{ materials.materials.length }} {{ materials.materials.length === 1 ? 'material' : 'materiales' }}
    </p>

    <p v-if="materials.loading && !materials.materials.length" class="mt-8 font-body text-white/70">Cargando materiales…</p>

    <div
      v-else-if="errorDetails"
      class="mt-8 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-white/85"
      role="alert"
    >
      <p class="font-display font-bold text-red-300">{{ errorDetails.title }} · No pudimos cargar el repositorio</p>
      <p class="mt-1 break-words">{{ errorDetails.message }}</p>
    </div>

    <div
      v-else-if="!materials.materials.length"
      class="mt-8 rounded-(--radius-card) border border-dashed border-white/20 bg-white/4 px-6 py-12 text-center"
    >
      <p class="font-display text-xl font-bold text-white">Aún no hay materiales en el repositorio</p>
    </div>

    <div v-else class="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="material in materials.materials"
        :key="material.mat_serial"
        class="flex flex-col rounded-(--radius-card) bg-white p-5 shadow-(--shadow-card)"
      >
        <p class="font-display text-xs font-bold uppercase tracking-wider text-cobre-digital">{{ material.mat_code }}</p>
        <p class="mt-0.5 font-display text-lg font-bold leading-snug text-texto">{{ material.mat_title }}</p>
        <p v-if="material.mat_publication_date" class="font-display text-sm text-texto/60">
          Publicado: {{ formatDate(material.mat_publication_date) }}
        </p>
        <p v-if="material.mat_description" class="mt-3 line-clamp-3 font-body text-sm text-texto/75">
          {{ material.mat_description }}
        </p>
        <p class="mt-3 break-all font-body text-xs text-texto/50">Autor: {{ material.fk_materials_users ?? '—' }}</p>
        <div class="mt-auto flex justify-end pt-4">
          <RouterLink :to="`/app/repository/${material.mat_serial}`" class="btn-webcis-blue">Ver detalle</RouterLink>
        </div>
      </article>
    </div>
  </section>
</template>
