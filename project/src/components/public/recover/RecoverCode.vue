<script setup>
import { ref, computed } from 'vue'

import { validateResetToken } from '@/services/auth.service'
import { authErrorMessage } from '@/utils/authErrors'

const props = defineProps({
  email: { type: String, required: true },
})

const emit = defineEmits(['continue'])

const CODE_LENGTH = 4

const code = ref('')
const loading = ref(false)
const errorMsg = ref('')

const isValid = computed(() => code.value.trim().length === CODE_LENGTH)

function handleInput(e) {
  code.value = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH)
}

function resetTokenFromResponse(response) {
  if (typeof response === 'string') return response
  return response?.token ?? response?.reset_token ?? response?.data?.token ?? response?.data?.reset_token ?? ''
}

async function onVerify() {
  errorMsg.value = ''

  if (!props.email) {
    errorMsg.value = 'No se encontró el correo de recuperación.'
    return
  }

  if (!isValid.value) {
    errorMsg.value = `El código debe tener ${CODE_LENGTH} dígitos.`
    return
  }

  loading.value = true

  try {
    const response = await validateResetToken({
      email: props.email,
      code: code.value.trim(),
    })
    const token = resetTokenFromResponse(response)
    if (!token) throw new Error('El backend no devolvió el token de restablecimiento.')
    emit('continue', { token })
  } catch (err) {
    errorMsg.value = authErrorMessage(err, 'No se pudo validar el código.', {
      403: 'El código es incorrecto o ya expiró. Verifica los dígitos o solicita uno nuevo.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md p-8">

      <h1 class="text-3xl font-semibold text-white text-center">
        Recuperar contraseña
      </h1>

      <p class="mt-3 text-center text-sm text-white/70 leading-relaxed">
        Ingresa el código de autentificación que se ha enviado a tu correo para restablecer tu contraseña
      </p>

      <form class="mt-6 space-y-5" @submit.prevent="onVerify">

        <div>
          <input
            :value="code"
            @input="handleInput"
            type="text"
            inputmode="numeric"
            :maxlength="CODE_LENGTH"
            :disabled="loading"
            :placeholder="`Código de ${CODE_LENGTH} dígitos`"
            class="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-white text-center text-lg tracking-widest placeholder:text-white/60 placeholder:italic placeholder:text-base placeholder:tracking-normal outline-none focus:border-white/70"
          />
        </div>

        <p v-if="errorMsg" class="text-sm text-red-300 text-center">
          {{ errorMsg }}
        </p>

        <button
          type="submit"
          :disabled="loading || !isValid"
          class="w-full rounded-xl bg-primario px-4 py-3 text-xl font-semibold text-white hover:bg-[#12294A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Verificando...' : 'Verificar' }}
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
