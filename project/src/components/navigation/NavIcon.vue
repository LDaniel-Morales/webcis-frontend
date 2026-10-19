<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="flex-none">
    <ellipse v-if="item.ellipse" :cx="item.ellipse.cx" :cy="item.ellipse.cy" :rx="item.ellipse.rx" :ry="item.ellipse.ry" />
    <circle v-if="item.circle" :cx="item.circle.cx" :cy="item.circle.cy" :r="item.circle.r" />
    <path v-for="d in item.paths" :key="d" :d="d" />
  </svg>
</template>
