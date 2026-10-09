import { apiGet } from './api.js'

// GET /courses (CourseController::index, CourseIndexRequest). Solo devuelve
// cursos Published. Params con los nombres del backend: page, per_page (≤50),
// search, categories[] (cat_code), subjects[] (sub_code), created_from,
// created_to, sort (title | created_at | updated_at), order (asc | desc).
// Respuesta: paginador de Laravel { data: CourseSummaryResource[], links, meta }.
export async function getCourses(params = {}) {
  return apiGet('/courses', { params })
}

// GET /courses/{code} → { data: CourseResource } con categories, subjects,
// image y lessons (ordenadas por les_order).
export async function getCourse(code) {
  return apiGet(`/courses/${encodeURIComponent(code)}`)
}

export async function getLessons(code) {
  return apiGet(`/courses/${encodeURIComponent(code)}/lessons`)
}

export async function getLesson(code, id) {
  return apiGet(`/courses/${encodeURIComponent(code)}/lessons/${encodeURIComponent(id)}`)
}
