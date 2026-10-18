<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import checkIcon from '@/assets/icons/checkIcon.png'
import wrongIcon from '@/assets/icons/wrongIcon.png'
import { confirmVerificationEmail } from '@/services/auth.service'
import { authErrorMessage } from '@/utils/authErrors'
import { userTypeFromEmail } from '@/utils/userType.js'

const emit = defineEmits(['continue'])

const route = useRoute()
const router = useRouter()

const token = computed(() => String(route.query.token ?? '').trim())
const hasToken = computed(() => token.value.length > 0)
const isChecking = ref(false)
const serverError = ref('')

function emailFromResponse(response) {
  return response?.email ?? response?.data?.email ?? response?.user?.email ?? ''
}

function tokenFromResponse(response) {
  return (
    response?.token ??
    response?.data?.token ??
    response?.verification_token ??
    response?.data?.verification_token ??
    token.value
  )
}

function goHome() {
  router.push('/')
}

function goLogin() {
  router.push('/login')
}


async function onContinue() {
  if (!hasToken.value) return

  serverError.value = ''
  isChecking.value = true
  try {
    const response = await confirmVerificationEmail({ token: token.value })
    const email = emailFromResponse(response)
    emit('continue', {
      token: tokenFromResponse(response),
      email,
      userType: userTypeFromEmail(email),
    })
  } catch (err) {
    serverError.value = authErrorMessage(err, 'No se pudo confirmar el correo.')
  } finally {
    isChecking.value = false
  }
}
</script>


<template>
  <div class="rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md p-10 max-w-md ">
    <h1 v-if="hasToken" class="text-center text-2xl md:text-3xl font-semibold text-acento">
      Correo Confirmado
    </h1>

    <div v-if="hasToken" class="flex items-center justify-center mt-4">
      <div class="mt-4 mx-auto w-32 h-32 bg-[#23C523]"
        :style="{
          WebkitMask: `url(${checkIcon}) no-repeat center / contain`,
          mask: `url(${checkIcon}) no-repeat center / contain`
        }"
      />
    </div>

    <p v-if="hasToken" class="mt-6 text-center text-white/70 text-sm md:text-base">
      Tu correo ha sido verificado correctamente. Ya puedes continuar con tu registro.
    </p>

    <p v-if="serverError" class="mt-4 text-center text-sm text-red-300">
      {{ serverError }}
    </p>

    <div v-if="hasToken" class="mt-6 flex justify-center">
      <button
        type="button"
        class="rounded-xl border border-white/20 bg-black/20 px-6 py-2 text-white/80 hover:bg-white/10 disabled:opacity-60"
        :disabled="isChecking"
        @click="onContinue"
      >
        {{ isChecking ? 'Verificando...' : 'Continuar' }}
      </button>
    </div>

    <div v-else class="mt-6">
      <h1 class="text-center text-2xl md:text-3xl font-semibold text-acento">
        Correo NO Confirmado
      </h1>

      <div class="flex items-center justify-center mt-4">
        <div class="mt-4 mx-auto w-32 h-32 bg-[#EB0000]"
             :style="{
          WebkitMask: `url(${wrongIcon}) no-repeat center / contain`,
          mask: `url(${wrongIcon}) no-repeat center / contain`
        }"
        />
      </div>

      <p class="mt-6 text-center text-red-300 text-sm md:text-base">
        No se encontró el token de verificación en el enlace.
      </p>

      <div class="mt-6 flex justify-center gap-3">
        <button
          type="button"
          class="rounded-xl border border-white/20 bg-black/20 px-6 py-2 text-white/80 hover:bg-white/10"
          @click="goHome"
        >
          Volver a Inicio
        </button>

        <button
          type="button"
          class="rounded-xl border border-white/20 bg-black/20 px-6 py-2 text-white/80 hover:bg-white/10"
          @click="goLogin"
        >
          Ir a Login
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>

</style>
