<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { roleLabel as labelForRole } from '@/utils/roleLabels'
import { initialsFromName } from '@/utils/text'

const router = useRouter()
const auth = useAuthStore()
const open = ref(false)

const displayName = computed(() => auth.user?.name ?? 'Usuario')
const profilePicture = computed(() => auth.user?.profile_picture ?? null)
// Si la foto no carga, se muestran las iniciales; se reintenta al cambiar la URL.
const pictureFailed = ref(false)
watch(profilePicture, () => { pictureFailed.value = false })
const initials = computed(() => initialsFromName(displayName.value))
const roleLabel = computed(() => labelForRole(auth.type))

function goToProfile() {
  open.value = false
}

async function handleLogout() {
  open.value = false
  await auth.logout()
  await router.push('/')
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex items-center gap-3 rounded-xl bg-white/10 px-2 py-1.5 text-white"
      :aria-expanded="open"
      @click="open = !open"
    >
      <img
        v-if="profilePicture && !pictureFailed"
        :src="profilePicture"
        alt=""
        class="size-10 rounded-full border-2 border-acento object-cover"
        @error="pictureFailed = true"
      >
      <span
        v-else
        class="flex size-10 items-center justify-center rounded-full border-2 border-acento bg-primario font-display text-sm font-semibold"
      >{{ initials }}</span>
      <span class="hidden text-left leading-tight md:block">
        <span class="block font-display text-sm font-semibold">{{ displayName }}</span>
        <span class="block font-body text-xs text-white/60">{{ roleLabel }}</span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m6 9 6 6 6-6" /></svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl bg-white p-2 text-texto shadow-(--shadow-pop)"
    >
      <div class="border-b border-black/10 px-3 py-2">
        <p class="font-display text-sm font-semibold">{{ displayName }}</p>
      </div>

      <RouterLink
        to="/app/profile"
        class="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 font-display text-sm text-texto hover:bg-black/5"
        @click="goToProfile"
      >Mi perfil</RouterLink>
      <span
        class="flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 font-display text-sm text-texto/40"
        title="Próximamente"
      >Configuración</span>

      <div class="my-1 h-px bg-black/10" />

      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-display text-sm font-semibold text-superior hover:bg-black/5"
        @click="handleLogout"
      >
        Cerrar sesión
      </button>
    </div>
  </div>
</template>
