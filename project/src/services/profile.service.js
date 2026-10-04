import { apiGet, apiPatch, apiPost } from './api.js'

// GET /profile (ProfileController::index) → { user: UserResource,
// medals: MedalResource[] (5 más recientes), courses: EnrollmentResource[]
// (4 con acceso más reciente) }.
export async function getProfile() {
  return apiGet('/profile')
}

// PATCH /me (ProfileUpdateRequest): solo acepta username, description, name,
// surname y second_surname. email y control_number no son editables.
export async function updateMe(payload) {
  return apiPatch('/me', payload)
}

// PHP no parsea multipart/form-data en peticiones PATCH, así que el archivo
// se envía por POST con `_method=PATCH` (method spoofing de Laravel). El
// Content-Type explícito evita que axios convierta el FormData a JSON por el
// header por defecto de la instancia; el navegador agrega el boundary.
function uploadImage(url, file) {
  const body = new FormData()
  body.append('_method', 'PATCH')
  body.append('image', file)
  return apiPost(url, body, { headers: { 'Content-Type': 'multipart/form-data' } })
}

// PATCH /me/profile-picture (ProfilePictureUpdateRequest): `image`
// jpg/jpeg/png/webp, máx. 2048 KB, mínimo 256×256 px.
export async function updateProfilePicture(file) {
  return uploadImage('/me/profile-picture', file)
}

// PATCH /me/banner (BannerUpdateRequest): `image` jpg/jpeg/png/webp,
// máx. 2048 KB, mínimo 1200×300 px.
export async function updateBanner(file) {
  return uploadImage('/me/banner', file)
}
