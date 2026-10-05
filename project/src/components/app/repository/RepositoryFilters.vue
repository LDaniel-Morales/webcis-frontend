<script setup>
import { computed } from 'vue'

const props = defineProps({
  types: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
  subjects: {
    type: Array,
    default: () => [],
  },
})

const query = defineModel('query', { type: String, default: '' })
const type = defineModel('type', { type: String, default: '' })
const category = defineModel('category', { type: String, default: '' })
const subject = defineModel('subject', { type: String, default: '' })

const groups = computed(() =>
  [
    { label: 'Tipo de recurso', all: 'Todos', options: props.types, model: type },
    { label: 'Categoría', all: 'Todas', options: props.categories, model: category },
    { label: 'Asignatura', all: 'Todas', options: props.subjects, model: subject },
  ].filter((group) => group.options.length),
)

function chipClasses(active) {
  return active
    ? 'bg-oro-ingenieril text-[#3a2a08]'
    : 'border border-white/16 bg-white/8 text-white/80 hover:bg-white/12'
}
</script>

<template>
  <div>
    <label class="flex h-[54px] max-w-[640px] items-center gap-3.5 rounded-full bg-white px-[22px]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" class="flex-none text-[#5b6675]">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
      </svg>
      <span class="sr-only">Buscar material</span>
      <input
        v-model="query"
        type="search"
        placeholder="Buscar material por título, autor o código…"
        class="flex-1 bg-transparent font-display text-base text-[#1c1c1c] outline-none"
      >
    </label>

    <div v-if="groups.length" class="mt-[18px] flex flex-wrap gap-x-7 gap-y-3.5">
      <div v-for="group in groups" :key="group.label">
        <p class="mb-2 font-body text-xs uppercase tracking-wider text-white/55">{{ group.label }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in ['', ...group.options]"
            :key="option || group.all"
            type="button"
            class="whitespace-nowrap rounded-full px-[15px] py-[7px] font-display text-[13px] font-semibold"
            :class="chipClasses(group.model.value === option)"
            @click="group.model.value = option"
          >
            {{ option || group.all }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
