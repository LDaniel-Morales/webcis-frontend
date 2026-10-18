<script setup>
import { computed, ref } from 'vue'

import { forgotPassword } from '@/services/auth.service'
import { authErrorMessage } from '@/utils/authErrors'

const emit = defineEmits(['continue'])

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')

const isValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

async function onSubmit() {
  errorMsg.value = ''

  if (!isValid.value) {
    errorMsg.value = 'Ingresa un correo electrónico válido.'
    return
  }

  loading.value = true
  try {
    const normalizedEmail = email.value.trim()
    await forgotPassword({ email: normalizedEmail })
    emit('continue', { email: normalizedEmail })
  } catch (err) {
    errorMsg.value = authErrorMessage(err, 'No se pudo enviar el código de recuperación.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md p-8">

      <h1 class="text-3xl font-semibold text-white text-center mb-8">
        Recuperar contraseña
      </h1>

      <p class="text-center text-base text-white/80 leading-relaxed px-4 mb-8">
        Ingresa tu correo electrónico y te enviaremos un código de 4 dígitos para restablecer tu contraseña.
      </p>

      <form class="space-y-5" @submit.prevent="onSubmit">
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          :disabled="loading"
          placeholder="Correo electrónico"
          class="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-white/60 placeholder:italic outline-none focus:border-white/70"
        />

        <p v-if="errorMsg" class="text-sm text-red-300 text-center">
          {{ errorMsg }}
        </p>

        <button
          type="submit"
          :disabled="loading || !isValid"
          class="w-full rounded-xl bg-primario px-4 py-3 text-xl font-semibold text-white hover:bg-[#12294A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Enviando...' : 'Enviar código' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <RouterLink to="/login" class="text-sm text-white/60 hover:text-white/90 hover:underline">
          Volver al inicio de sesión
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
</style>
