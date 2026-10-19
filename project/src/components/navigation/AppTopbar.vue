<script setup>
import logo from '@/assets/images/Logo.png'
import AppUserMenu from '@/components/navigation/AppUserMenu.vue'
</script>

<template>
  <header class="flex h-[74px] items-center gap-3 border-b border-white/8 bg-azul-nav px-4 md:gap-6 md:px-6">
    <RouterLink to="/app" class="flex-none" aria-label="Ir al inicio">
      <img :src="logo" alt="WebCIS" width="1077" height="719" class="h-18 w-auto" >
    </RouterLink>

    <div class="mx-auto hidden max-w-md flex-1 md:block">
      <div class="flex h-11 items-center gap-3 rounded-full bg-white px-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b6675" stroke-width="2.2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
        <input
          type="search"
          placeholder="Buscar cursos, materiales, personas…"
          class="w-full border-none bg-transparent font-display text-sm text-texto outline-none"
        >
      </div>
    </div>

    <AppUserMenu class="ml-auto" />
  </header>
</template>
