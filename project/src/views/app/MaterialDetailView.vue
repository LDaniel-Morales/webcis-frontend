<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { categoryClasses, typeStyle } from '@/components/app/repository/material-styles'
import MaterialFilesCard from '@/components/app/repository/MaterialFilesCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { findMockMaterial, isMockMaterialId, MOCK_NOTICE } from '@/mocks/materials.mock'
import { getMaterial } from '@/services/material.service'
import { useMaterialsStore } from '@/stores/materials'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const materials = useMaterialsStore()
const material = ref(null)
const loading = ref(false)
const error = ref(null)
const deleting = ref(false)
const deleteError = ref(null)

const isMock = computed(() => isMockMaterialId(route.params.id))
const style = computed(() => typeStyle(material.value?.type))
const author = computed(() => material.value?.author_name ?? material.value?.fk_materials_users ?? '—')
const stats = computed(() =>
  isMock.value && material.value
    ? [
        { label: 'Descargas', value: material.value.downloads },
        { label: 'Tamaño total', value: material.value.total_size },
        { label: 'Archivos', value: material.value.files.length },
      ]
    : [],
)

async function load(id) {
  error.value = null
  deleteError.value = null
  material.value = null
  if (isMockMaterialId(id)) {
    material.value = findMockMaterial(id)
    if (!material.value) error.value = { status: 404, message: 'No existe el material de ejemplo.' }
    return
  }
  loading.value = true
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
    <RouterLink
      to="/app/repository"
      class="mb-4 inline-flex items-center gap-[7px] font-display text-sm font-semibold text-white/70 hover:text-white"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6" /></svg>
      Volver al repositorio
    </RouterLink>

    <p
      v-if="isMock && material"
      class="mb-4 ml-3 inline-flex rounded-full border border-acento/40 bg-acento/10 px-4 py-1.5 font-display text-[13px] font-semibold text-acento"
      role="status"
    >
      {{ MOCK_NOTICE }}
    </p>

    <p v-if="loading" class="font-body text-white/70">Cargando material…</p>

    <div
      v-else-if="error"
      class="flex flex-col items-center gap-1.5 rounded-3xl border border-[#d6788c]/35 bg-[#610d31]/18 px-6 py-[60px] text-center"
      role="alert"
    >
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" class="text-[#e58ba1]">
        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      </svg>
      <p class="mt-2.5 font-display text-2xl font-bold text-white">
        {{ error.status === 404 ? 'Este material no existe o ya no está disponible.' : 'No se pudo cargar el material' }}
      </p>
      <p class="max-w-[440px] wrap-break-word font-display text-base text-white/65">
        {{ error.status ? `Error ${error.status}` : 'Error de red' }} · {{ error.message }}
      </p>
    </div>

    <div v-else-if="material" class="grid grid-cols-1 items-start gap-[22px] xl:grid-cols-[1.6fr_1fr]">
      <article class="rounded-3xl bg-white p-[30px] shadow-(--shadow-card)">
        <div class="flex items-start gap-[18px]">
          <span class="flex size-[72px] flex-none items-center justify-center rounded-[18px]" :class="style.classes">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="d in style.icon" :key="d" :d="d" />
            </svg>
          </span>
          <div class="min-w-0 flex-1">
            <div v-if="material.type || material.category || material.subject" class="mb-2 flex flex-wrap gap-[7px]">
              <span v-if="material.type" class="rounded-full px-3 py-1 font-display text-xs font-bold" :class="style.classes">{{ material.type }}</span>
              <span
                v-if="material.category"
                class="rounded-full px-3 py-1 font-display text-xs font-bold"
                :class="categoryClasses(material.category)"
              >{{ material.category }}</span>
              <span v-if="material.subject" class="rounded-full bg-[#eef0f3] px-3 py-1 font-display text-xs font-semibold text-[#5b6675]">{{ material.subject }}</span>
            </div>
            <h1 class="font-display text-[28px] font-bold text-[#1c1c1c]">{{ material.mat_title }}</h1>
            <p class="mt-1.5 break-all font-body text-[13px] text-[#888]">
              Código <strong class="text-[#5b6675]">{{ material.mat_code }}</strong> · Por {{ author }} ·
              Publicado el {{ formatDate(material.mat_publication_date) ?? '—' }}
            </p>
          </div>
        </div>

        <p v-if="material.mat_description" class="mt-[18px] font-display text-base leading-relaxed text-[#555]">
          {{ material.mat_description }}
        </p>

        <div v-if="stats.length" class="mt-[22px] flex flex-wrap gap-7 border-t border-[#eef0f3] pt-5">
          <div v-for="stat in stats" :key="stat.label">
            <p class="font-body text-xs text-[#999]">{{ stat.label }}</p>
            <p class="font-display text-xl font-bold text-[#1c1c1c]">{{ stat.value }}</p>
          </div>
        </div>

        <template v-if="!isMock">
          <div
            v-if="deleteError"
            class="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-body text-sm text-red-800"
            role="alert"
          >
            <p class="font-display font-bold">{{ deleteError.status ? `Error ${deleteError.status}` : 'Error de red' }} · No pudimos borrar el material</p>
            <p class="mt-1 wrap-break-word">{{ deleteError.message }}</p>
          </div>
          <div class="mt-6 flex justify-end gap-3 border-t border-[#eef0f3] pt-5">
            <RouterLink :to="`/app/repository/${material.mat_serial}/edit`" class="btn-webcis-blue">Editar</RouterLink>
            <BaseButton variant="ghost" :disabled="deleting" @click="handleDelete">
              {{ deleting ? 'Borrando…' : 'Borrar' }}
            </BaseButton>
          </div>
        </template>
      </article>

      <MaterialFilesCard :files="material.files ?? null" />
    </div>
  </section>
</template>
