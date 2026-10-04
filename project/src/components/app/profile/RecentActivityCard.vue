<script setup>
defineProps({
  fullName: {
    type: String,
    required: true,
  },
  activities: {
    type: Array,
    required: true,
  },
})

const KIND_CLASSES = {
  medalla: { bg: 'bg-tag-datos-bg', fg: 'text-tag-datos-fg' },
  curso: { bg: 'bg-tag-poo-bg', fg: 'text-tag-poo-fg' },
  material: { bg: 'bg-tag-web-bg', fg: 'text-tag-web-fg' },
  perfil: { bg: 'bg-oro-faint', fg: 'text-cobre-digital' },
}

const KIND_ICONS = {
  medalla: {
    circle: { cx: 12, cy: 14, r: 6.5 },
    paths: ['m9 12.3 2 2 4-4', 'M8.5 3.5 6 8m9-4.5L17.5 8'],
  },
  curso: {
    paths: ['M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z', 'M9 4.5V14l2.4-1.6L13.8 14V4.5'],
  },
  material: {
    paths: ['M7 3h7l5 5v13H7z', 'M14 3v5h5'],
  },
  perfil: {
    circle: { cx: 12, cy: 8.5, r: 3.5 },
    paths: ['M5 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5'],
  },
}

function kindClasses(kind) {
  return KIND_CLASSES[kind] ?? KIND_CLASSES.perfil
}

function kindIcon(kind) {
  return KIND_ICONS[kind] ?? KIND_ICONS.perfil
}
</script>

<template>
  <div class="rounded-(--radius-card) bg-white p-[18px] shadow-(--shadow-card) sm:p-6">
    <p class="font-display text-[17px] font-bold text-negro-sintaxis">Actividad reciente</p>

    <p v-if="!activities.length" class="mt-3.5 font-display text-sm text-[#999]">
      Aún no hay actividad. Inscríbete a un curso para empezar.
    </p>
    <div v-else class="flex flex-col">
      <div
        v-for="(activity, index) in activities"
        :key="index"
        class="flex gap-3 py-3"
        :class="index > 0 ? 'border-t border-[#f1f2f5]' : ''"
      >
        <span
          class="flex size-8 flex-none items-center justify-center rounded-[11px] sm:size-9.5"
          :class="[kindClasses(activity.kind).bg, kindClasses(activity.kind).fg]"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle v-if="kindIcon(activity.kind).circle" v-bind="kindIcon(activity.kind).circle" />
            <path v-for="d in kindIcon(activity.kind).paths" :key="d" :d="d" />
          </svg>
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-display text-[14.5px] leading-snug text-negro-sintaxis">
            <strong>{{ fullName }}</strong> {{ activity.text }}
          </p>
          <p class="mt-0.5 font-display text-xs text-[#999]">{{ activity.time }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
