<script setup>
import { useRoute } from 'vue-router'

import { isNavActive, NAV_ITEMS } from '@/components/navigation/navItems'
import NavIcon from '@/components/navigation/NavIcon.vue'

const ITEMS = [
  NAV_ITEMS.home,
  NAV_ITEMS.courses,
  { ...NAV_ITEMS.repository, label: 'Repo' },
  { ...NAV_ITEMS.profile, label: 'Perfil' },
]

const route = useRoute()
</script>

<template>
  <nav
    class="grid flex-none grid-cols-4 border-t border-white/8 bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
    aria-label="Navegación principal"
  >
    <RouterLink
      v-for="item in ITEMS"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center gap-1 py-2.5 font-display text-[11px] font-semibold"
      :class="isNavActive(route.path, item.to) ? 'text-acento' : 'text-white/60'"
      :aria-current="isNavActive(route.path, item.to) ? 'page' : undefined"
    >
      <NavIcon :item="item" />
      {{ item.label }}
    </RouterLink>
  </nav>
</template>
