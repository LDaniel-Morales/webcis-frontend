<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getMaterial } from '@/services/material.service'
import { formatDate } from '@/utils/date'

const route = useRoute()
const material = ref(null)
const loading = ref(false)
const error = ref(null)

async function load(id) {
  loading.value = true
  error.value = null
  material.value = null
  try {
    material.value = await getMaterial(id)
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, (id) => id && load(id), { immediate: true })
</script>

<template>
  <section>
    <RouterLink to="/app/repository" class="font-display text-sm font-semibold text-acento hover:underline">
      ← Volver al repositorio
    </RouterLink>

    <p v-if="loading" class="mt-6 font-body text-white/70">Cargando material…</p>

    <div
      v-else-if="error"
      class="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-white/85"
      role="alert"
    >
      <p class="font-display font-bold text-red-300">
        {{ error.status === 404 ? 'Este material no existe o ya no está disponible.' : `Error ${error.status || ''} · No pudimos cargar el material` }}
      </p>
      <p v-if="error.status !== 404" class="mt-1 break-words">{{ error.message }}</p>
    </div>

    <article v-else-if="material" class="mt-5 rounded-(--radius-card) bg-white p-6 shadow-(--shadow-card) sm:p-8">
      <p class="font-display text-xs font-bold uppercase tracking-wider text-cobre-digital">{{ material.mat_code }}</p>
      <h1 class="mt-1 font-display text-3xl font-bold text-texto">{{ material.mat_title }}</h1>
      <p v-if="material.mat_publication_date" class="mt-1 font-display text-base text-texto/60">
        Publicado: {{ formatDate(material.mat_publication_date) }}
      </p>
      <p v-if="material.mat_description" class="mt-5 font-body text-[15px] leading-relaxed text-texto/80">
        {{ material.mat_description }}
      </p>
      <p class="mt-5 break-all font-body text-sm text-texto/50">Autor: {{ material.fk_materials_users ?? '—' }}</p>
    </article>
  </section>
</template>
