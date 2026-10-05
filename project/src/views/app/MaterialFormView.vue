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
  <section>
    <RouterLink
      to="/app/repository"
      class="mb-4 inline-flex items-center gap-[7px] font-display text-sm font-semibold text-white/70 hover:text-white"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6" /></svg>
      Volver al repositorio
    </RouterLink>

    <p v-if="loading" class="font-body text-white/70">Cargando material…</p>

    <div
      v-else-if="error && !initialValues"
      class="flex flex-col items-center gap-1.5 rounded-3xl border border-[#d6788c]/35 bg-[#610d31]/18 px-6 py-[60px] text-center"
      role="alert"
    >
      <p class="font-display text-2xl font-bold text-white">No se pudo cargar el material</p>
      <p class="max-w-[440px] wrap-break-word font-display text-base text-white/65">
        {{ error.status ? `Error ${error.status}` : 'Error de red' }} · {{ error.message }}
      </p>
    </div>

    <MaterialForm
      v-else-if="initialValues"
      :initial-values="initialValues"
      :is-edit="isEdit"
      :saving="saving"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <template #alert>
        <div
          v-if="error"
          class="mb-[18px] rounded-2xl border border-[#d6788c]/35 bg-[#610d31]/18 px-5 py-4 font-body text-sm text-white/85"
          role="alert"
        >
          <p class="font-display font-bold text-[#e58ba1]">
            {{ error.status ? `Error ${error.status}` : 'Error de red' }} · No pudimos guardar el material
          </p>
          <p class="mt-1 wrap-break-word">{{ error.message }}</p>
        </div>
      </template>
    </MaterialForm>
  </section>
</template>
