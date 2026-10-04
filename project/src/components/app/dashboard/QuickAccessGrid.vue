<script setup>
const items = [
  {
    label: 'Explorar cursos',
    to: '/app/explorer',
    circle: { cx: 11, cy: 11, r: 7 },
    paths: ['m20 20-3.2-3.2'],
  },
  {
    label: 'Repositorio digital',
    to: '/app/repository',
    paths: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
  },
  {
    label: 'Mis tareas',
    to: null,
    paths: ['M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'],
  },
  {
    label: 'Mi perfil',
    to: '/app/profile',
    circle: { cx: 12, cy: 8.5, r: 3.5 },
    paths: ['M5 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5'],
  },
]
</script>

<template>
  <div>
    <h2 class="mb-4 font-display text-xl font-bold text-acento">Accesos rápidos</h2>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <component
        :is="item.to ? 'RouterLink' : 'span'"
        v-for="item in items"
        :key="item.label"
        :to="item.to ?? undefined"
        class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-(--shadow-card)"
        :class="item.to ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
        :title="item.to ? undefined : 'Próximamente'"
      >
        <span class="flex size-12 items-center justify-center rounded-xl bg-oro-faint">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-cobre-digital)" stroke-width="1.9">
            <circle v-if="item.circle" :cx="item.circle.cx" :cy="item.circle.cy" :r="item.circle.r" />
            <path v-for="d in item.paths" :key="d" :d="d" />
          </svg>
        </span>
        <span class="font-display text-base font-semibold text-texto">{{ item.label }}</span>
      </component>
    </div>
  </div>
</template>
