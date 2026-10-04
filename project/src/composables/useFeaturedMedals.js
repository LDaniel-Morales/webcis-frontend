import { computed, ref, watch } from 'vue'

export const MAX_FEATURED_MEDALS = 6

function storageKey(username) {
  return `webcis:profile:featured-medals:${username}`
}

function readFeaturedIds(username) {
  if (!username) return []
  try {
    const raw = localStorage.getItem(storageKey(username))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeFeaturedIds(username, ids) {
  if (!username) return
  try {
    localStorage.setItem(storageKey(username), JSON.stringify(ids))
  } catch {
    // localStorage no disponible (modo privado, cuota excedida, etc.): la
    // selección queda aplicada solo en memoria durante esta sesión.
  }
}

// Resuelve qué medallas mostrar en MedalsCard: primero las elegidas
// explícitamente (en el orden en que se guardaron) y, si son menos de
// MAX_FEATURED_MEDALS, completa con las no elegidas más recientes
// (completedAt desc) hasta llegar a 6, o al total si hay menos de 6.
function resolveFeatured(allMedals, featuredIds) {
  const byId = new Map(allMedals.map((medal) => [medal.id, medal]))
  const chosen = featuredIds.map((id) => byId.get(id)).filter(Boolean)

  if (chosen.length >= MAX_FEATURED_MEDALS) return chosen.slice(0, MAX_FEATURED_MEDALS)

  const chosenIds = new Set(chosen.map((medal) => medal.id))
  const rest = [...allMedals]
    .filter((medal) => !chosenIds.has(medal.id))
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))

  return [...chosen, ...rest].slice(0, MAX_FEATURED_MEDALS)
}

// Selección de medallas destacadas del Muro (Historia 2). No existe
// endpoint de perfil en el backend todavía, así que la selección se
// persiste en localStorage namespaced por username — sobrevive recargas,
// pero queda local a este navegador (decisión tomada para esta historia,
// distinta de avatar/banner que solo persisten en la sesión).
export function useFeaturedMedals(username, allMedals) {
  const featuredIds = ref([])

  watch(
    username,
    (value) => {
      featuredIds.value = readFeaturedIds(value)
    },
    { immediate: true },
  )

  const featuredMedals = computed(() => resolveFeatured(allMedals, featuredIds.value))

  function saveFeatured(ids) {
    const limited = ids.slice(0, MAX_FEATURED_MEDALS)
    featuredIds.value = limited
    writeFeaturedIds(username.value, limited)
  }

  return { featuredIds, featuredMedals, saveFeatured }
}
