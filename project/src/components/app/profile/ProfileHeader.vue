<script setup>
import { computed, ref, watch } from 'vue'

import { BANNER_OPTIONS } from './banner-options'

const props = defineProps({
  bannerSrc: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  roleLabel: {
    type: String,
    default: '',
  },
  avatarSrc: {
    type: String,
    default: null,
  },
  initials: {
    type: String,
    default: '',
  },
})

const tab = defineModel('tab', { default: 'muro' })

// Si la URL de la foto o del banner no carga (p. ej. 403 del storage del
// backend), se muestran las iniciales o el banner por defecto en vez del
// ícono de imagen rota. Al cambiar la URL (subida nueva) se reintenta.
const avatarFailed = ref(false)
const bannerFailed = ref(false)
watch(() => props.avatarSrc, () => { avatarFailed.value = false })
watch(() => props.bannerSrc, () => { bannerFailed.value = false })

const shownBannerSrc = computed(() => (bannerFailed.value ? BANNER_OPTIONS[0].src : props.bannerSrc))
defineEmits(['open-avatar', 'open-banner'])
</script>

<template>
  <div>
    <div class="relative h-[140px] overflow-hidden sm:h-[200px]">
      <img :src="shownBannerSrc" alt="" class="size-full object-cover" @error="bannerFailed = true">
      <div
        class="absolute inset-0"
        style="background: linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(10, 10, 10, 0.55))"
      />
      <div class="absolute inset-0 mx-auto max-w-[900px] px-6">
        <button
          type="button"
          title="Cambiar foto de banner"
          class="absolute top-3 right-6 flex size-8.5 items-center justify-center rounded-xl border border-white/25 bg-[rgba(8,16,30,.6)] text-white sm:size-10.5"
          @click="$emit('open-banner')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <circle cx="9" cy="10.5" r="1.8" />
            <path d="m5.5 17 4-4.2 2.7 2.8 3-3.6L21 16" />
          </svg>
        </button>
      </div>
    </div>

    <div class="mx-auto max-w-[900px] px-6">
      <div class="relative z-10 -mt-[38px] flex items-end gap-4 sm:-mt-[52px] sm:gap-5">
        <div class="relative size-20 flex-none sm:size-28">
          <div
            class="size-full overflow-hidden rounded-full border-4 border-[#e7e5df]"
            style="box-shadow: 0 0 0 3px var(--color-oro-ingenieril)"
          >
            <img
              v-if="avatarSrc && !avatarFailed"
              :src="avatarSrc"
              alt=""
              class="size-full object-cover"
              @error="avatarFailed = true"
            >
            <div
              v-else
              class="flex size-full items-center justify-center bg-primario font-display text-lg font-semibold text-white sm:text-2xl"
            >
              {{ initials }}
            </div>
          </div>
          <button
            type="button"
            title="Cambiar foto de perfil"
            class="absolute right-0.5 bottom-0.5 flex size-6.5 items-center justify-center rounded-full border-[3px] border-[#e7e5df] bg-oro-ingenieril text-[#3a2a08] sm:size-8"
            @click="$emit('open-avatar')"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h3l2-2.5h6L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
              <circle cx="12" cy="13" r="3.4" />
            </svg>
          </button>
        </div>

        <div class="min-w-0 flex-1 pb-1.5">
          <h1 class="truncate font-display text-lg font-bold text-white sm:text-2xl">{{ fullName }}</h1>
          <p class="mt-0.5 truncate font-display text-xs text-white/60 sm:text-sm">
            @{{ username }} · {{ roleLabel }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex w-max gap-1.5 rounded-[14px] border border-white/12 bg-white/6 p-1 sm:mt-5.5">
        <button
          type="button"
          class="rounded-[10px] px-4 py-2 font-display text-sm font-semibold sm:px-5.5"
          :class="tab === 'muro' ? 'bg-oro-ingenieril text-[#3a2a08]' : 'text-white/70'"
          @click="tab = 'muro'"
        >
          Muro
        </button>
        <button
          type="button"
          class="rounded-[10px] px-4 py-2 font-display text-sm font-semibold sm:px-5.5"
          :class="tab === 'editar' ? 'bg-oro-ingenieril text-[#3a2a08]' : 'text-white/70'"
          @click="tab = 'editar'"
        >
          Editar perfil
        </button>
      </div>
    </div>
  </div>
</template>
