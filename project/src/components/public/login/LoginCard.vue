<script setup>

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authErrorMessage } from '@/utils/authErrors'

const identifier = ref('') // correo o username
const pass = ref('')
const showPass = ref(false)

const loading = ref(false)
const errorMsg = ref('')

const router = useRouter()
const auth = useAuthStore()

const isValid = computed(() => identifier.value.trim() && pass.value.trim())

function toPayload() {
  const value = identifier.value.trim()
  const isEmail = value.includes('@')

  return {
    email: isEmail ? value : undefined,
    username: !isEmail ? value : undefined,
    pass: pass.value,
  }
}

async function onSubmit() {
  errorMsg.value = ''

  if (!isValid.value) {
    errorMsg.value = 'Completa usuario/correo y contraseña.'
    return
  }

  loading.value = true
  try {
    await auth.login(toPayload())
    await router.push('/app')
  }catch(err) {
    errorMsg.value = authErrorMessage(err, 'No se pudo iniciar sesión.')
  } finally {
    loading.value = false
  }

}

</script>

<template>
  <div class="flex flex-col gap-3 ">
    <div class="rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md p-6">
      <!-- Title -->
      <h1 class="text-4xl font-semibold text-white/70 leading-tight text-center">
        Inicio de sesión
      </h1>
      <div class="mt-2 h-1 w-full bg-blue-600/80"></div>

      <!-- Form -->
      <form class="mt-10 space-y-4" @submit.prevent="onSubmit">
        <div>
          <input
            v-model="identifier"
            type="text"
            autocomplete="username"
            :disabled="loading"
            placeholder="Usuario o correo electrónico"
            class="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-white/60 placeholder:italic outline-none focus:border-white/70"
          />
        </div>

        <div class="relative">
          <input
            v-model="pass"
            :type="showPass ? 'text' : 'password'"
            autocomplete="current-password"
            :disabled="loading"
            placeholder="Contraseña"
            class="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 pr-24 text-white placeholder:text-white/60 placeholder:italic outline-none focus:border-white/70"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-white/25 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
            :disabled="loading"
            @click="showPass = !showPass"
          >
            {{ showPass ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>

        <p v-if="errorMsg" class="text-sm text-red-300">
          {{ errorMsg }}
        </p>

        <button
          type="submit"
          :disabled="loading || !isValid"
          class="w-full rounded-xl bg-primario px-4 py-3 text-xl font-semibold text-white hover:bg-[#12294A]"
        >
          {{ loading ? 'Entrando...' : '¡ENTRAR!' }}
        </button>

      </form>
    </div>

    <div class="rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md py-2 px-3">
      <div class="pt-2 text-center text-sm text-white/70 font-semibold">
        ¿No tienes una cuenta?
        <RouterLink to="/register" class="ml-2 font-semibold text-orange-400 hover:underline py-2">
          REGÍSTRATE
        </RouterLink>
      </div>

      <div class="text-center text-xs text-white/60 py-1">
        <RouterLink to="/recover" class="hover:underline">
          ¿Ha olvidado su contraseña?
        </RouterLink>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
