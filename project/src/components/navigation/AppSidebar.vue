<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { isNavActive, NAV_ITEMS } from '@/components/navigation/navItems'
import NavIcon from '@/components/navigation/NavIcon.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle'])

const toggleLabel = computed(() => (props.collapsed ? 'Expandir menú' : 'Colapsar menú'))

const route = useRoute()
const auth = useAuthStore()
const dashboard = useDashboardStore()

const hasProgress = computed(() => dashboard.loaded && dashboard.progress !== null)

const navItems = computed(() => [
  NAV_ITEMS.home,
  NAV_ITEMS.courses,
  NAV_ITEMS.repository,
  NAV_ITEMS.create,
  ...(auth.type === 'Admin' ? [NAV_ITEMS.admin] : []),
])

function isActive(path) {
  return isNavActive(route.path, path)
}
</script>

<template>
  <aside
    class="hidden shrink-0 flex-col overflow-x-hidden border-r border-white/8 bg-sidebar/55 py-4 transition-[width] duration-200 ease-out md:flex"
    :class="collapsed ? 'w-[76px]' : 'w-[248px]'"
  >
    <button
      type="button"
      class="mx-2 mb-1 flex items-center rounded-xl px-4 py-2 text-white/60 hover:bg-white/5 hover:text-white"
      :class="collapsed ? 'self-start' : 'self-end'"
      :aria-label="toggleLabel"
      :aria-expanded="!collapsed"
      :title="toggleLabel"
      @click="$emit('toggle')"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        <path :d="collapsed ? 'm14 9 3 3-3 3' : 'm16 15-3-3 3-3'" />
      </svg>
    </button>

    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="relative mx-2 my-0.5 flex items-center gap-3 rounded-xl px-4 py-3 font-display text-sm font-medium text-white/80 hover:bg-white/5"
      :class="{ 'bg-acento/15 text-white': isActive(item.to) }"
      :title="collapsed ? item.label : undefined"
      :aria-label="collapsed ? item.label : undefined"
    >
      <span
        class="absolute inset-y-2 -left-2 w-1 rounded-r-sm bg-acento"
        :class="isActive(item.to) ? 'opacity-100' : 'opacity-0'"
      />
      <NavIcon :item="item" :class="isActive(item.to) ? 'text-acento' : 'text-white/70'" />
      <span v-if="!collapsed" class="whitespace-nowrap">{{ item.label }}</span>
    </RouterLink>

    <div class="mt-auto">
      <RouterLink
        :to="NAV_ITEMS.profile.to"
        class="relative mx-2 my-0.5 flex items-center gap-3 rounded-xl px-4 py-3 font-display text-sm font-medium text-white/80 hover:bg-white/5"
        :class="{ 'bg-acento/15 text-white': isActive(NAV_ITEMS.profile.to) }"
        :title="collapsed ? NAV_ITEMS.profile.label : undefined"
        :aria-label="collapsed ? NAV_ITEMS.profile.label : undefined"
      >
        <span
          class="absolute inset-y-2 -left-2 w-1 rounded-r-sm bg-acento"
          :class="isActive(NAV_ITEMS.profile.to) ? 'opacity-100' : 'opacity-0'"
        />
        <NavIcon :item="NAV_ITEMS.profile" :class="isActive(NAV_ITEMS.profile.to) ? 'text-acento' : 'text-white/70'" />
        <span v-if="!collapsed" class="whitespace-nowrap">{{ NAV_ITEMS.profile.label }}</span>
      </RouterLink>

      <div v-if="!collapsed" class="mx-4 mt-3 min-w-[216px] rounded-2xl border border-acento/25 bg-acento/10 p-4">
        <p class="mb-2 font-display text-xs font-semibold text-white">Progreso promedio</p>
        <ProgressBar
          :percent="hasProgress ? dashboard.progress : 0"
          track-class="bg-white/10"
          fill-class="bg-(image:--gradient-gold)"
        />
        <p class="mt-2 font-body text-[11px] text-white/60">
          {{ hasProgress ? `${dashboard.progress}% de tus cursos activos` : 'Sin datos aún' }}
        </p>
      </div>
    </div>
  </aside>
</template>
