<script setup>
import logo from '@/assets/images/Logo.png'
import AppUserMenu from '@/components/navigation/AppUserMenu.vue'
</script>

<template>
  <header class="flex h-[74px] items-center gap-6 border-b border-white/8 bg-azul-nav px-6">
    <RouterLink to="/app" aria-label="Ir al inicio">
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

    <div class="ml-auto flex items-center gap-4">
      <span
        class="relative flex size-11 items-center justify-center rounded-xl bg-white/10 text-white"
        title="Notificaciones"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
      </span>

      <AppUserMenu />
    </div>
  </header>
</template>
