import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useMediaQuery(query, fallback = true) {
  const media = typeof window.matchMedia === 'function' ? window.matchMedia(query) : null
  const matches = ref(media ? media.matches : fallback)

  function onChange(event) {
    matches.value = event.matches
  }

  onMounted(() => media?.addEventListener('change', onChange))
  onBeforeUnmount(() => media?.removeEventListener('change', onChange))

  return matches
}
