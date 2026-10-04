<script setup>
import AppFooter from "@/components/AppFooter.vue";
import AppHeader from "@/components/AppHeader.vue";
import AppMenu from "@/components/AppMenu.vue";
</script>

<template>
  <AppHeader />
  <AppMenu variant="public" />
  <main>
    <RouterView />
  </main>
  <AppFooter />
</template>

<style scoped>

</style>
