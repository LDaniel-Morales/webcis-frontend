<script setup>
import { computed, ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { registerFormSchema } from '@/schemas/validationSchema.js'
import { RecaptchaV2, useRecaptcha } from 'vue3-recaptcha-v2'
import { register } from '@/services/auth.service'
import { authErrorMessage } from '@/utils/authErrors'

const props = defineProps({
  email: { type: String, default: '' },
  token: { type: String, default: '' },
  userType: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['registered'])

const recaptchaSiteKey =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
  (import.meta.env.MODE === 'test' ? 'test-site-key' : '')
const fieldClass =
  'w-full mt-1 rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white outline-none focus:border-white/70'

const personalFields = [
  {
    name: 'names',
    label: 'Nombre(s)',
    type: 'text',
    autocomplete: 'given-name',
    wrapperClass: 'flex flex-col',
  },
  {
    name: 'control_number',
    label: 'Número de Control',
    type: 'text',
    autocomplete: 'off',
    wrapperClass: 'flex flex-col',
  },
  {
    name: 'surname',
    label: 'Primer Apellido',
    type: 'text',
    autocomplete: 'family-name',
    wrapperClass: 'flex flex-col',
  },
  {
    name: 'second_surname',
    label: 'Segundo Apellido',
    type: 'text',
    autocomplete: 'additional-name',
    wrapperClass: 'flex flex-col',
  },
]

const accountFields = [
  {
    name: 'email',
    label: 'Correo Electrónico',
    type: 'email',
    autocomplete: 'email',
    disabled: true,
    wrapperClass: 'flex flex-col',
  },
  {
    name: 'username',
    label: 'Nombre de Usuario',
    type: 'text',
    autocomplete: 'username',
    wrapperClass: 'flex flex-col',
  },
  {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    autocomplete: 'new-password',
    wrapperClass: 'flex flex-col',
  },
  {
    name: 'password_confirm',
    label: 'Confirmar Contraseña',
    type: 'password',
    autocomplete: 'new-password',
    wrapperClass: 'flex flex-col',
  },
]

const recaptchaToken = ref('')
const recaptchaWidgetId = ref(null)
const captchaError = ref('')
const serverError = ref('')
const isSubmitting = ref(false)
const visiblePasswords = ref({
  password: false,
  password_confirm: false,
})
const { handleReset } = useRecaptcha()

const isFormDisabled = computed(() => props.loading || isSubmitting.value)
const hasRecaptchaSiteKey = computed(() => recaptchaSiteKey.length > 0)
const captchaMessage = computed(() => {
  if (!hasRecaptchaSiteKey.value) {
    return 'Configura VITE_RECAPTCHA_SITE_KEY para activar reCAPTCHA.'
  }

  return captchaError.value
})
const canSubmit = computed(
  () => hasRecaptchaSiteKey.value && recaptchaToken.value.length > 0 && !isFormDisabled.value,
)

function isPasswordField(field) {
  return field.type === 'password'
}

function fieldType(field) {
  if (!isPasswordField(field)) return field.type
  return visiblePasswords.value[field.name] ? 'text' : 'password'
}

function togglePassword(fieldName) {
  visiblePasswords.value[fieldName] = !visiblePasswords.value[fieldName]
}

function onCaptchaWidgetId(widgetId) {
  recaptchaWidgetId.value = widgetId
}

function onCaptchaVerified(token) {
  captchaError.value = ''
  recaptchaToken.value = token
}

function resetCaptcha(message = '') {
  recaptchaToken.value = ''
  captchaError.value = message

  if (recaptchaWidgetId.value === null) return

  try {
    handleReset(recaptchaWidgetId.value)
  } catch {
    recaptchaWidgetId.value = null
  }
}

function onCaptchaExpired() {
  resetCaptcha('El captcha expiró. Confírmalo de nuevo.')
}

function onCaptchaError() {
  resetCaptcha('Error cargando reCAPTCHA. Intenta de nuevo.')
}

async function onSubmit(values) {
  captchaError.value = ''
  serverError.value = ''

  if (!hasRecaptchaSiteKey.value) {
    captchaError.value = 'Configura VITE_RECAPTCHA_SITE_KEY para activar reCAPTCHA.'
    return
  }

  if (!recaptchaToken.value) {
    captchaError.value = 'Confirma que no eres un robot.'
    return
  }

  isSubmitting.value = true
  try {
    const { password_confirm, ...registerValues } = values
    const response = await register({
      ...registerValues,
      email: props.email || values.email,
      token: props.token,
      type: props.userType,
      recaptcha_token: recaptchaToken.value,
    })
    emit('registered', response)
  } catch (err) {
    serverError.value = authErrorMessage(err, 'No se pudo completar el registro.', {
      401: 'La verificación de tu correo expiró. Vuelve a registrarte para recibir un código nuevo.',
    })
    resetCaptcha()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <div class="rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md p-8">
      <h1 class="text-4xl font-semibold text-white leading-tight text-center py-2">
        Completa tus Datos de Registro
      </h1>

      <div class="mt-3 h-1 w-full bg-blue-600/80"></div>

      <Form
        class="mt-10 space-y-10"
        :validation-schema="registerFormSchema"
        :initial-values="{ email: props.email }"
        @submit="onSubmit"
      >
        <div class="space-y-10">
          <!-- Datos Personales -->
          <section class="space-y-4">
            <h2 class="text-2xl font-semibold text-white/90 leading-tight py-2">
              Datos Personales
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="field in personalFields" :key="field.name" :class="field.wrapperClass">
                <label :for="field.name" class="text-white/60 italic p-1">{{ field.label }}</label>
                <Field
                  :id="field.name"
                  :name="field.name"
                  :type="field.type"
                  :autocomplete="field.autocomplete"
                  :disabled="isFormDisabled"
                  :class="fieldClass"
                />
                <ErrorMessage :name="field.name" v-slot="{ message }">
                  <p class="mt-1 text-sm text-red-300">{{ message }}</p>
                </ErrorMessage>
              </div>
            </div>
          </section>

          <!-- Información de la Cuenta -->
          <section class="space-y-4">
            <h2 class="text-2xl font-semibold text-white/90 leading-tight py-2">
              Información de la Cuenta
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="field in accountFields" :key="field.name" :class="field.wrapperClass">
                <label :for="field.name" class="text-white/60 italic p-1">{{ field.label }}</label>
                <div :class="isPasswordField(field) ? 'relative' : ''">
                  <Field
                    :id="field.name"
                    :name="field.name"
                    :type="fieldType(field)"
                    :autocomplete="field.autocomplete"
                    :disabled="field.disabled || isFormDisabled"
                    :class="[fieldClass, isPasswordField(field) ? 'pr-24' : '']"
                  />
                  <button
                    v-if="isPasswordField(field)"
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-white/25 px-3 py-0.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
                    :disabled="field.disabled || isFormDisabled"
                    @click="togglePassword(field.name)"
                  >
                    {{ visiblePasswords[field.name] ? 'Ocultar' : 'Mostrar' }}
                  </button>
                </div>
                <ErrorMessage :name="field.name" v-slot="{ message }">
                  <p class="mt-1 text-sm text-red-300">{{ message }}</p>
                </ErrorMessage>
              </div>
            </div>
          </section>

          <!-- Verificación -->
          <section class="space-y-4">
            <h2 class="text-2xl font-semibold text-white/90 leading-tight py-2">Verificación</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div class="flex flex-col">
                <label class="text-white/60 italic p-1">Captcha</label>
                <div class="pt-4 flex justify-center md:justify-start">
                  <div class="space-y-2">
                    <RecaptchaV2
                      v-if="hasRecaptchaSiteKey"
                      @widget-id="onCaptchaWidgetId"
                      @load-callback="onCaptchaVerified"
                      @expired-callback="onCaptchaExpired"
                      @error-callback="onCaptchaError"
                    />
                    <p v-if="captchaMessage" class="text-center text-sm text-red-300">
                      {{ captchaMessage }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-stretch md:items-end gap-4">
                <p v-if="serverError" class="text-sm text-red-300">
                  {{ serverError }}
                </p>
                <button
                  type="submit"
                  :disabled="!canSubmit"
                  class="px-7 py-3 rounded-lg bg-primario text-sm font-semibold text-white hover:bg-[#12294A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting ? 'Registrando...' : 'Registrar' }}
                </button>
              </div>
            </div>
          </section>
        </div>
      </Form>
    </div>
  </div>
</template>

<style scoped></style>
