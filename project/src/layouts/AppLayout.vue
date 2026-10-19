<script setup>
import { ref } from 'vue'

import AppBottomNav from '@/components/navigation/AppBottomNav.vue'
import AppSidebar from '@/components/navigation/AppSidebar.vue'
import AppTopbar from '@/components/navigation/AppTopbar.vue'

const SIDEBAR_KEY = 'webcis:sidebar-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

const sidebarCollapsed = ref(readCollapsed())

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  try {
    localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed.value ? '1' : '0')
  } catch {
    return
  }
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <AppTopbar />
    <div class="flex flex-1 overflow-hidden bg-(image:--gradient-page)">
      <AppSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
      <main class="flex-1 overflow-y-auto px-6 py-8 md:px-10">
        <RouterView />
      </main>
    </div>
    <AppBottomNav />
  </div>
</template>
