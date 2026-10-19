<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import AppSidebar from '@/components/navigation/AppSidebar.vue'
import AppTopbar from '@/components/navigation/AppTopbar.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

const SIDEBAR_KEY = 'webcis:sidebar-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

const route = useRoute()
const isDesktop = useMediaQuery('(min-width: 768px)')
const sidebarCollapsed = ref(readCollapsed())
const mobileMenuOpen = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  try {
    localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed.value ? '1' : '0')
  } catch {
    return
  }
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') closeMobileMenu()
}

watch(() => route.fullPath, closeMobileMenu)
watch(isDesktop, (desktop) => desktop && closeMobileMenu())

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <AppTopbar :menu-open="mobileMenuOpen" @open-menu="mobileMenuOpen = true" />
    <div class="flex flex-1 overflow-hidden bg-(image:--gradient-page)">
      <div
        v-if="!isDesktop && mobileMenuOpen"
        class="fixed inset-0 z-40 bg-black/60"
        data-test="menu-backdrop"
        @click="closeMobileMenu"
      />
      <AppSidebar
        :collapsed="isDesktop && sidebarCollapsed"
        :mobile="!isDesktop"
        :open="mobileMenuOpen"
        @toggle="toggleSidebar"
        @close="closeMobileMenu"
      />
      <main class="flex-1 overflow-y-auto px-6 py-8 md:px-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>
