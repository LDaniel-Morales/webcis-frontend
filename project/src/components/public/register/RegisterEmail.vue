<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { registerEmailSchema  } from '@/schemas/validationSchema.js'
import { useRouter } from 'vue-router'
import { sendVerificationEmail } from '@/services/auth.service'
import { userTypeFromEmail } from '@/utils/userType.js'
import { authErrorMessage } from '@/utils/authErrors'

const router = useRouter()
const emit = defineEmits(['next'])

const loading = ref(false)
const serverError = ref('')

async function onSubmit(values) {
  serverError.value = ''
  loading.value = true
  try {
    await sendVerificationEmail({ email: values.email })
    emit('next', { email: values.email, userType: userTypeFromEmail(values.email) })
  } catch (err) {
    serverError.value = authErrorMessage(err, 'No se pudo enviar el correo.')
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <div class="flex flex-col gap-3 max-w-md">
    <!-- Card principal -->
    <div class="rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md p-6">
      <h1 class="mt-5 text-4xl font-semibold text-white/70 leading-tight text-center">
        Regístrate
      </h1>

      <div class="mt-3 h-1 w-full bg-blue-600/80"></div>

      <p class="mt-5 text-center text-white/85 text-lg leading-relaxed px-2">
        Como primer paso, necesitamos que ingreses tu correo electrónico.
      </p>

      <p class="mt-5 text-center text-white/50 text-sm leading-relaxed px-5">
        Si eres un <strong>Docente</strong>, necesitamos que ingreses tu correo <strong>Institucional</strong> para poder registrarte.
        De lo contrario, se asignará el tipo de cuenta de alumno.
      </p>

      <Form class="mt-10 space-y-4" :validation-schema="registerEmailSchema " @submit="onSubmit">
        <div>
          <Field
            name="email"
            type="email"
            autocomplete="email"
            :disabled="loading"
            placeholder="Correo Electrónico"
            class="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-white/60 placeholder:italic outline-none focus:border-white/70"
          />
        </div>

        <ErrorMessage name="email" v-slot="{ message }">
          <p class="mt-2 text-sm text-red-300">
            {{ message }}
          </p>
        </ErrorMessage>

        <p v-if="serverError" class="text-sm text-red-300">
          {{ serverError }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-xl bg-primario px-4 py-3 text-xl font-semibold text-white hover:bg-[#12294A]"
        >
          {{ loading ? 'Enviando...' : '¡REGISTRATE!' }}
        </button>
      </Form>
    </div>

    <!-- Card inferior -->
    <div class="rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md py-3 px-3">
      <div class="text-center text-sm text-white/70 font-semibold">
        ¿Tienes una cuenta?
        <button
          type="button"
          class="ml-2 font-semibold text-orange-400 hover:underline"
          @click="router.push('/login')"
        >
          ENTRAR
        </button>
      </div>
    </div>
  </div>
</template>
