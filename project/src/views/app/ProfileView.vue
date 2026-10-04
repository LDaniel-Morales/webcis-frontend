<script setup>
import { computed, onMounted, ref } from 'vue'

import AboutCard from '@/components/app/profile/AboutCard.vue'
import { BANNER_OPTIONS } from '@/components/app/profile/banner-options'
import EditProfileForm from '@/components/app/profile/EditProfileForm.vue'
import ImageUploadModal from '@/components/app/profile/ImageUploadModal.vue'
import MedalsCard from '@/components/app/profile/MedalsCard.vue'
import ProfileHeader from '@/components/app/profile/ProfileHeader.vue'
import RecentActivityCard from '@/components/app/profile/RecentActivityCard.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/date'
import { ENROLLMENT_STATUS } from '@/utils/enums'
import { firstFieldError } from '@/utils/image'
import { roleLabel as labelForRole } from '@/utils/roleLabels'
import { initialsFromName } from '@/utils/text'

// Reglas de ProfilePictureUpdateRequest / BannerUpdateRequest (backend).
const PROFILE_PICTURE_RULES = { maxKB: 2048, minWidth: 256, minHeight: 256 }
const BANNER_RULES = { maxKB: 2048, minWidth: 1200, minHeight: 300 }

const auth = useAuthStore()
const profile = useProfileStore()
const { notify } = useToast()
const tab = ref('muro')

onMounted(() => {
  profile.fetchProfile()
})

// Toda la información del usuario sale de auth.user (UserResource), que
// GET /profile y cada PATCH /me* mantienen actualizado.
const user = computed(() => auth.user ?? {})

const fullName = computed(() => {
  const name = [user.value.name, user.value.surname, user.value.second_surname].filter(Boolean).join(' ')
  return name || 'Usuario'
})
const roleLabel = computed(() => labelForRole(auth.type))
const initials = computed(() => initialsFromName(fullName.value))
// Banner por defecto mientras el usuario no suba uno propio.
const bannerSrc = computed(() => user.value.banner ?? BANNER_OPTIONS[0].src)

const editInitialValues = computed(() => ({
  username: user.value.username ?? '',
  description: user.value.description ?? '',
  name: user.value.name ?? '',
  surname: user.value.surname ?? '',
  second_surname: user.value.second_surname ?? '',
}))

// Actividad reciente armada con datos reales de GET /profile: medallas
// (obtained_at) y cursos (completed_at / last_accessed_at), ordenada por fecha.
const activities = computed(() => {
  const fromMedals = profile.medals.map((medal) => ({
    kind: 'medalla',
    text: `obtuvo la medalla ${medal.name}.`,
    date: medal.obtained_at,
  }))
  const fromCourses = profile.courses.map((course) => {
    const completed = course.status === ENROLLMENT_STATUS.Completed && course.completed_at
    return {
      kind: 'curso',
      text: completed ? `completó el curso ${course.title}.` : `continuó el curso ${course.title}.`,
      date: completed ? course.completed_at : course.last_accessed_at,
    }
  })

  return [...fromMedals, ...fromCourses]
    .filter((activity) => activity.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((activity) => ({ ...activity, time: formatDate(activity.date) }))
})

const savingProfile = ref(false)

async function handleSaveProfile(values, actions) {
  savingProfile.value = true
  try {
    await profile.updateProfile(values)
    tab.value = 'muro'
    notify('Perfil actualizado correctamente.')
  } catch (err) {
    if (err?.status === 422 && err.data?.errors) {
      actions?.setErrors(
        Object.fromEntries(Object.entries(err.data.errors).map(([field, messages]) => [field, messages[0]])),
      )
    } else {
      notify(err?.message ?? 'No se pudo actualizar el perfil.')
    }
  } finally {
    savingProfile.value = false
  }
}

// Avatar y banner: misma mecánica, distinto endpoint.
function useImageUpload(upload, successMessage) {
  const open = ref(false)
  const saving = ref(false)
  const error = ref(null)

  function show() {
    error.value = null
    open.value = true
  }

  async function save(file) {
    saving.value = true
    error.value = null
    try {
      await upload(file)
      open.value = false
      notify(successMessage)
    } catch (err) {
      error.value = firstFieldError(err, 'image') ?? err?.message ?? 'No se pudo subir la imagen.'
    } finally {
      saving.value = false
    }
  }

  return { open, saving, error, show, save }
}

const avatarUpload = useImageUpload(profile.updateProfilePicture, 'Foto de perfil actualizada.')
const bannerUpload = useImageUpload(profile.updateBanner, 'Banner actualizado.')
const { open: avatarOpen, saving: avatarSaving, error: avatarError } = avatarUpload
const { open: bannerOpen, saving: bannerSaving, error: bannerError } = bannerUpload
</script>

<template>
  <section>
    <ProfileHeader
      v-model:tab="tab"
      :banner-src="bannerSrc"
      :full-name="fullName"
      :username="user.username ?? ''"
      :role-label="roleLabel"
      :avatar-src="user.profile_picture"
      :initials="initials"
      @open-avatar="avatarUpload.show"
      @open-banner="bannerUpload.show"
    />

    <div class="mx-auto max-w-[900px] px-6 pb-10">
      <p
        v-if="profile.error"
        class="mt-5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-body text-sm text-white/70"
        role="status"
      >
        No pudimos cargar tus medallas y actividad. Intenta recargar la página.
      </p>

      <div v-if="tab === 'muro'" class="mt-5 flex flex-col gap-[18px]">
        <AboutCard
          :description="user.description"
          :email="user.email"
          :control-number="user.control_number"
          :role-label="roleLabel"
        />
        <MedalsCard :medals="profile.medals" />
        <RecentActivityCard :full-name="fullName" :activities="activities" />
      </div>

      <div v-else class="mt-5">
        <EditProfileForm
          :initial-values="editInitialValues"
          :email="user.email"
          :control-number="user.control_number"
          :role-label="roleLabel"
          :saving="savingProfile"
          @submit="handleSaveProfile"
          @cancel="tab = 'muro'"
        />
      </div>
    </div>

    <ImageUploadModal
      :open="avatarOpen"
      title="Actualizar foto de perfil"
      shape="avatar"
      :current-src="user.profile_picture"
      :rules="PROFILE_PICTURE_RULES"
      :saving="avatarSaving"
      :error="avatarError"
      @close="avatarOpen = false"
      @save="avatarUpload.save"
    />
    <ImageUploadModal
      :open="bannerOpen"
      title="Actualizar banner"
      shape="banner"
      :current-src="user.banner"
      :rules="BANNER_RULES"
      :saving="bannerSaving"
      :error="bannerError"
      @close="bannerOpen = false"
      @save="bannerUpload.save"
    />
    <ToastHost />
  </section>
</template>
