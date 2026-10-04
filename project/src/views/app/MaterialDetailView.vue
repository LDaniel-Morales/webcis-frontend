<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import { getMaterial } from '@/services/material.service'
import { useMaterialsStore } from '@/stores/materials'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const materials = useMaterialsStore()
const deleting = ref(false)
const deleteError = ref(null)
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

async function handleDelete() {
  if (!window.confirm('¿Borrar este material? Esta acción no se puede deshacer.')) return
  deleting.value = true
  deleteError.value = null
  try {
    await materials.deleteMaterial(route.params.id)
    await router.push('/app/repository')
  } catch (err) {
    deleteError.value = err
  } finally {
    deleting.value = false
  }
}
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

      <div
        v-if="deleteError"
        class="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-body text-sm text-red-800"
        role="alert"
      >
        <p class="font-display font-bold">{{ deleteError.status ? `Error ${deleteError.status}` : 'Error de red' }} · No pudimos borrar el material</p>
        <p class="mt-1 break-words">{{ deleteError.message }}</p>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <RouterLink :to="`/app/repository/${material.mat_serial}/edit`" class="btn-webcis-blue">Editar</RouterLink>
        <BaseButton variant="ghost" :disabled="deleting" @click="handleDelete">
          {{ deleting ? 'Borrando…' : 'Borrar' }}
        </BaseButton>
      </div>
    </article>
  </section>
</template>
