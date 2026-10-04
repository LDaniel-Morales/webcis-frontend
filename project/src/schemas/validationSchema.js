import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

export const registerEmailSchema = toTypedSchema(
  yup.object({
    email: yup.string().required('El correo es obligatorio').email('Ingresa un correo válido'),
  }),
)

/**
 * Reglas de contraseña (segura)
 * - mínimo 8
 * - 1 mayúscula
 * - 1 minúscula
 * - 1 número
 * - 1 símbolo
 */
const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export const registerFormSchema = toTypedSchema(
  yup.object({
    // Datos personales
    names: yup
      .string()
      .required('El nombre es obligatorio')
      .min(2, 'Mínimo 2 caracteres')
      .max(50, 'Máximo 50 caracteres'),

    surname: yup
      .string()
      .required('El primer apellido es obligatorio')
      .min(2, 'Mínimo 2 caracteres')
      .max(40, 'Máximo 40 caracteres'),

    second_surname: yup
      .string()
      .nullable()
      .transform((v) => (v === '' ? null : v))
      .max(40, 'Máximo 40 caracteres'),

    // Cuenta
    username: yup
      .string()
      .required('El usuario es obligatorio')
      .min(4, 'Mínimo 4 caracteres')
      .max(40, 'Máximo 40 caracteres')
      .matches(/^[a-zA-Z0-9._-]+$/, 'Solo letras, números, punto, guion y guion bajo'),

    control_number: yup.string().max(10, 'Máximo 10 caracteres'),

    password: yup
      .string()
      .required('La contraseña es obligatoria')
      .matches(passwordRules, 'Mín. 8 caracteres, mayúscula, minúscula, número y símbolo'),

    password_confirm: yup
      .string()
      .required('Confirma tu contraseña')
      .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
  }),
)

// Editar perfil (Mi Perfil / tab Editar). Sin endpoint real en el backend
// todavía — valida solo lo que EditProfileForm.vue guarda localmente.
// Campos de PATCH /me (ProfileUpdateRequest en el backend). email y
// control_number no son editables, por eso no forman parte del formulario.
export const profileEditSchema = toTypedSchema(
  yup.object({
    username: yup
      .string()
      .required('El usuario es obligatorio')
      .min(4, 'Mínimo 4 caracteres')
      .max(40, 'Máximo 40 caracteres')
      .matches(/^[a-zA-Z0-9._-]+$/, 'Solo letras, números, punto, guion y guion bajo'),

    description: yup
      .string()
      .nullable()
      .transform((v) => (v === '' ? null : v))
      .max(300, 'Máximo 300 caracteres'),

    name: yup
      .string()
      .required('El nombre es obligatorio')
      .min(2, 'Mínimo 2 caracteres')
      .max(50, 'Máximo 50 caracteres'),

    surname: yup
      .string()
      .required('El primer apellido es obligatorio')
      .min(2, 'Mínimo 2 caracteres')
      .max(40, 'Máximo 40 caracteres'),

    second_surname: yup
      .string()
      .nullable()
      .transform((v) => (v === '' ? null : v))
      .max(40, 'Máximo 40 caracteres'),
  }),
)
