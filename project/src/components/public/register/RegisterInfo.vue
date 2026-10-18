<script setup>
import { computed, ref } from 'vue'

import { confirmVerificationEmail, sendVerificationEmail } from '@/services/auth.service'
import { authErrorMessage } from '@/utils/authErrors'

const props = defineProps({
  email: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['resend', 'back', 'continue'])

const verificationCode = ref('')
const serverError = ref('')
const resendMessage = ref('')
const isChecking = ref(false)
const isResending = ref(false)

const isBusy = computed(() => props.loading || isChecking.value || isResending.value)
const normalizedCode = computed(() => verificationCode.value.trim())
const canConfirm = computed(() => normalizedCode.value.length > 0 && !isBusy.value)

function emailFromResponse(response) {
  return response?.email ?? response?.data?.email ?? response?.user?.email ?? props.email
}

function tokenFromResponse(response) {
  return (
    response?.token ??
    response?.data?.token ??
    response?.verification_token ??
    response?.data?.verification_token ??
    normalizedCode.value
  )
}

async function onConfirmCode() {
  serverError.value = ''
  resendMessage.value = ''

  if (!normalizedCode.value) {
    serverError.value = 'Ingresa el código de verificación.'
    return
  }

  isChecking.value = true
  try {
    const response = await confirmVerificationEmail({
      email: props.email,
      code: normalizedCode.value,
      token: normalizedCode.value,
    })

    emit('continue', {
      token: tokenFromResponse(response),
      email: emailFromResponse(response),
    })
  } catch (err) {
    serverError.value = authErrorMessage(err, 'No se pudo confirmar el código.')
  } finally {
    isChecking.value = false
  }
}

async function onResend() {
  serverError.value = ''
  resendMessage.value = ''

  if (!props.email) {
    serverError.value = 'No se encontró el correo para reenviar el código.'
    return
  }

  isResending.value = true
  try {
    await sendVerificationEmail({ email: props.email })
    resendMessage.value = 'Te enviamos un nuevo código de verificación.'
    emit('resend')
  } catch (err) {
    serverError.value = authErrorMessage(err, 'No se pudo reenviar el código.')
  } finally {
    isResending.value = false
  }
}
function onBack() {
  emit('back')
}
</script>

<template>
  <div class="rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md p-8 max-w-md">
    <h1 class="text-center text-2xl md:text-3xl font-semibold text-acento">
      Se ha enviado un código
      <br />
      de verificación
      <br />
      a tu correo electrónico
    </h1>

    <p class="mt-4 text-center text-white/65 text-sm md:text-base leading-relaxed">
      Para completar tu registro, necesitamos verificar que tu correo sea real. Entra a tu correo a
      continuación y te enviaremos un enlace de verificación.
      <br />
      <span v-if="email" class="text-white/80 font-semibold"> ({{ email }}) </span>
    </p>

    <form class="mt-6 space-y-3" @submit.prevent="onConfirmCode">
      <label for="verification-code" class="block text-sm font-semibold text-white/70">
        Código de verificación
      </label>

      <input
        id="verification-code"
        v-model="verificationCode"
        name="verification_code"
        type="text"
        inputmode="text"
        autocomplete="one-time-code"
        autocapitalize="off"
        spellcheck="false"
        placeholder="Ingresa el código"
        :disabled="isBusy"
        class="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-center font-mono text-sm font-semibold text-white placeholder:font-sans placeholder:font-normal placeholder:text-white/50 outline-none focus:border-white/70 disabled:opacity-60"
      />

      <p v-if="serverError" class="text-center text-sm text-red-300">
        {{ serverError }}
      </p>

      <p v-if="resendMessage" class="text-center text-sm text-green-300">
        {{ resendMessage }}
      </p>

      <button
        type="submit"
        class="w-full rounded-xl bg-primario px-4 py-3 text-base font-semibold text-white hover:bg-[#12294A] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="!canConfirm"
      >
        {{ isChecking ? 'Verificando...' : 'Confirmar código' }}
      </button>
    </form>

    <p class="mt-5 text-center text-white/70 text-sm font-semibold">
      ¿Aún no te ha llegado el correo?
      <button
        type="button"
        class="ml-1 text-orange-400 hover:underline disabled:opacity-60"
        :disabled="isBusy"
        @click="onResend"
      >
        {{ isResending ? 'Reenviando...' : 'Reenviar Código' }}
      </button>
    </p>

    <div class="mt-6 flex justify-center">
      <button
        type="button"
        class="rounded-xl border border-white/20 bg-black/20 px-6 py-2 text-white/80 hover:bg-white/10 disabled:opacity-60"
        :disabled="isBusy"
        @click="onBack"
      >
        Regresar
      </button>
    </div>
  </div>
</template>
