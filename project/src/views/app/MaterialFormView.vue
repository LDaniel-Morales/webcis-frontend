<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MaterialForm from '@/components/app/repository/MaterialForm.vue'
import { getMaterial } from '@/services/material.service'
import { useMaterialsStore } from '@/stores/materials'

const route = useRoute()
const router = useRouter()
const materials = useMaterialsStore()

const isEdit = computed(() => Boolean(route.params.id))
const initialValues = ref(null)
const loading = ref(false)
const saving = ref(false)
const error = ref(null)

function toFormValues(material) {
  return {
    mat_title: material?.mat_title ?? '',
    mat_publication_date: String(material?.mat_publication_date ?? '').slice(0, 10),
    mat_code: material?.mat_code ?? '',
    mat_description: material?.mat_description ?? '',
  }
}

async function load(id) {
  error.value = null
  if (!id) {
    initialValues.value = toFormValues(null)
    return
  }
  loading.value = true
  initialValues.value = null
  try {
    initialValues.value = toFormValues(await getMaterial(id))
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })

async function handleSubmit(values, actions) {
  saving.value = true
  error.value = null
  try {
    const saved = isEdit.value
      ? await materials.updateMaterial(route.params.id, values)
      : await materials.createMaterial(values)
    const id = saved?.mat_serial ?? route.params.id
    await router.push(id ? `/app/repository/${id}` : '/app/repository')
  } catch (err) {
    if (err?.status === 422 && err.data?.errors) {
      actions?.setErrors(
        Object.fromEntries(Object.entries(err.data.errors).map(([field, messages]) => [field, messages[0]])),
      )
    } else {
      error.value = err
    }
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push(isEdit.value ? `/app/repository/${route.params.id}` : '/app/repository')
}
</script>

<template>
  <section class="mx-auto max-w-[760px]">
    <RouterLink to="/app/repository" class="font-display text-sm font-semibold text-acento hover:underline">
      ← Volver al repositorio
    </RouterLink>
    <h1 class="mt-4 font-display text-3xl font-bold text-white">
      {{ isEdit ? 'Editar material' : 'Nuevo material' }}
    </h1>

    <div
      v-if="error"
      class="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-white/85"
      role="alert"
    >
      <p class="font-display font-bold text-red-300">
        {{ error.status ? `Error ${error.status}` : 'Error de red' }} ·
        {{ isEdit && !initialValues ? 'No pudimos cargar el material' : 'No pudimos guardar el material' }}
      </p>
      <p class="mt-1 break-words">{{ error.message }}</p>
    </div>

    <p v-if="loading" class="mt-6 font-body text-white/70">Cargando material…</p>

    <div v-else-if="initialValues" class="mt-5">
      <MaterialForm
        :initial-values="initialValues"
        :submit-label="isEdit ? 'Guardar cambios' : 'Crear material'"
        :saving="saving"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </section>
</template>
