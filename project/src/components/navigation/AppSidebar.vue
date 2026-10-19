<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  mobile: {
    type: Boolean,
    default: false,
  },
  open: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle', 'close'])

const toggleLabel = computed(() => (props.collapsed ? 'Expandir menú' : 'Colapsar menú'))

const asideClass = computed(() => {
  if (props.mobile) {
    return ['fixed inset-y-0 left-0 z-50 w-[248px] bg-sidebar transition-transform duration-200 ease-out', props.open ? 'translate-x-0' : '-translate-x-full']
  }
  return ['bg-sidebar/55 transition-[width] duration-200 ease-out', props.collapsed ? 'w-[76px]' : 'w-[248px]']
})

const route = useRoute()
const auth = useAuthStore()
const dashboard = useDashboardStore()

const hasProgress = computed(() => dashboard.loaded && dashboard.progress !== null)

const canAdmin = computed(() => auth.type === 'Admin')

const navItems = computed(() => [
  {
    label: 'Inicio',
    to: '/app',
    paths: ['M3 10.5 12 3l9 7.5', 'M5 9.5V20h14V9.5'],
  },
  {
    label: 'Cursos',
    to: '/app/explorer',
    paths: ['M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z', 'M9 4.5V14l2.4-1.6L13.8 14V4.5'],
  },
  {
    label: 'Repositorio',
    to: '/app/repository',
    ellipse: { cx: 12, cy: 6, rx: 7.5, ry: 3 },
    paths: ['M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6', 'M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3'],
  },
  {
    label: 'Crear contenido',
    to: '/app/repository/new',
    paths: ['M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z', 'M12 8.5v7M8.5 12h7'],
  },
  ...(canAdmin.value
    ? [{
        label: 'Administración',
        to: '/admin',
        paths: ['M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z', 'm9 12 2 2 4-4'],
      }]
    : []),
])

// El detalle de curso (/app/courses/:code) cuenta como parte de "Cursos".
function isActive(path) {
  if (path === '/app/explorer') return route.path === path || route.path.startsWith('/app/courses/')
  if (path === '/app/repository') {
    return route.path === path || (route.path.startsWith('/app/repository/') && route.path !== '/app/repository/new')
  }
  return route.path === path
}

function iconStroke(path) {
  return isActive(path) ? 'var(--color-acento)' : 'rgba(255,255,255,.7)'
}
</script>

<template>
  <aside
    class="flex shrink-0 flex-col overflow-x-hidden border-r border-white/8 py-4"
    :class="asideClass"
    :inert="mobile && !open ? true : undefined"
  >
    <button
      v-if="mobile"
      type="button"
      class="mx-2 mb-1 flex items-center self-end rounded-xl px-4 py-2 text-white/60 hover:bg-white/5 hover:text-white"
      aria-label="Cerrar menú"
      title="Cerrar menú"
      @click="$emit('close')"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
    <button
      v-else
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="iconStroke(item.to)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="flex-none">
        <ellipse v-if="item.ellipse" :cx="item.ellipse.cx" :cy="item.ellipse.cy" :rx="item.ellipse.rx" :ry="item.ellipse.ry" />
        <path v-for="d in item.paths" :key="d" :d="d" />
      </svg>
      <span v-if="!collapsed" class="whitespace-nowrap">{{ item.label }}</span>
    </RouterLink>

    <div class="mt-auto">
      <RouterLink
        to="/app/profile"
        class="relative mx-2 my-0.5 flex items-center gap-3 rounded-xl px-4 py-3 font-display text-sm font-medium text-white/80 hover:bg-white/5"
        :class="{ 'bg-acento/15 text-white': isActive('/app/profile') }"
        :title="collapsed ? 'Mi perfil' : undefined"
        :aria-label="collapsed ? 'Mi perfil' : undefined"
      >
        <span
          class="absolute inset-y-2 -left-2 w-1 rounded-r-sm bg-acento"
          :class="isActive('/app/profile') ? 'opacity-100' : 'opacity-0'"
        />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="iconStroke('/app/profile')" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="flex-none">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" />
        </svg>
        <span v-if="!collapsed" class="whitespace-nowrap">Mi perfil</span>
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
