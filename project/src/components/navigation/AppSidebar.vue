<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

// `collapsed` deja el layout listo para un futuro modo "rail compacto";
// hoy no se renderiza ningún control para activarlo (sidebar fija únicamente).
defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
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
  if (path === '/app/repository') return route.path === path || route.path.startsWith('/app/repository/')
  return route.path === path
}

function iconStroke(path) {
  return isActive(path) ? 'var(--color-acento)' : 'rgba(255,255,255,.7)'
}
</script>

<template>
  <aside
    class="flex shrink-0 flex-col border-r border-white/8 bg-sidebar/55 py-4"
    :class="collapsed ? 'w-[76px]' : 'w-[248px]'"
  >
    <p class="px-4 pb-2 font-body text-[11px] font-semibold uppercase tracking-wider text-white/40">
      Plataforma
    </p>

    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="relative mx-2 my-0.5 flex items-center gap-3 rounded-xl px-4 py-3 font-display text-sm font-medium text-white/80 hover:bg-white/5"
      :class="{ 'bg-acento/15 text-white': isActive(item.to) }"
    >
      <span
        class="absolute inset-y-2 -left-2 w-1 rounded-r-sm bg-acento"
        :class="isActive(item.to) ? 'opacity-100' : 'opacity-0'"
      />
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="iconStroke(item.to)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="flex-none">
        <ellipse v-if="item.ellipse" :cx="item.ellipse.cx" :cy="item.ellipse.cy" :rx="item.ellipse.rx" :ry="item.ellipse.ry" />
        <path v-for="d in item.paths" :key="d" :d="d" />
      </svg>
      <span v-if="!collapsed">{{ item.label }}</span>
    </RouterLink>

    <div class="mt-auto">
      <RouterLink
        to="/app/profile"
        class="relative mx-2 my-0.5 flex items-center gap-3 rounded-xl px-4 py-3 font-display text-sm font-medium text-white/80 hover:bg-white/5"
        :class="{ 'bg-acento/15 text-white': isActive('/app/profile') }"
      >
        <span
          class="absolute inset-y-2 -left-2 w-1 rounded-r-sm bg-acento"
          :class="isActive('/app/profile') ? 'opacity-100' : 'opacity-0'"
        />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="iconStroke('/app/profile')" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="flex-none">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" />
        </svg>
        <span v-if="!collapsed">Mi perfil</span>
      </RouterLink>

      <div v-if="!collapsed" class="mx-4 mt-3 rounded-2xl border border-acento/25 bg-acento/10 p-4">
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
