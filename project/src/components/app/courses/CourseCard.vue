<script setup>
defineProps({
  // CourseSummaryResource: { code, title, short_title, description,
  // categories: [{ code, name }], subjects: [{ code, name }], status, icon }.
  course: {
    type: Object,
    required: true,
  },
  // cat_code / sub_code activos en el filtro, para resaltar sus chips.
  activeCategories: {
    type: Array,
    default: () => [],
  },
  activeSubjects: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['toggle-category', 'toggle-subject'])
</script>

<template>
  <article class="flex flex-col rounded-(--radius-card) bg-white p-5 shadow-(--shadow-card)">
    <RouterLink :to="`/app/courses/${course.code}`" class="flex items-start gap-4">
      <img
        v-if="course.icon"
        :src="course.icon"
        alt=""
        class="size-16 flex-none rounded-2xl bg-gris-interfaz object-contain p-1.5"
      >
      <div v-else class="flex size-16 flex-none items-center justify-center rounded-2xl bg-gris-interfaz">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-acento)" stroke-width="1.5">
          <path d="M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z" />
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="font-display text-xs font-bold uppercase tracking-wider text-cobre-digital">{{ course.code }}</p>
        <p class="mt-0.5 font-display text-lg font-bold leading-snug text-texto">{{ course.title }}</p>
        <p class="font-display text-sm text-texto/60">{{ course.short_title }}</p>
      </div>
    </RouterLink>

    <p v-if="course.description" class="mt-3 line-clamp-3 font-body text-sm text-texto/75">
      {{ course.description }}
    </p>

    <div v-if="course.categories?.length || course.subjects?.length" class="mt-4 flex flex-wrap gap-1.5">
      <button
        v-for="category in course.categories"
        :key="`cat-${category.code}`"
        type="button"
        class="rounded-full px-2.5 py-0.5 font-display text-xs font-semibold"
        :class="activeCategories.includes(category.code) ? 'bg-primario text-white' : 'bg-tag-poo-bg text-tag-poo-fg'"
        :title="`Filtrar por categoría ${category.name}`"
        @click="$emit('toggle-category', category)"
      >
        {{ category.name }}
      </button>
      <button
        v-for="subject in course.subjects"
        :key="`sub-${subject.code}`"
        type="button"
        class="rounded-full px-2.5 py-0.5 font-display text-xs font-semibold"
        :class="activeSubjects.includes(subject.code) ? 'bg-primario text-white' : 'bg-tag-web-bg text-tag-web-fg'"
        :title="`Filtrar por materia ${subject.name}`"
        @click="$emit('toggle-subject', subject)"
      >
        {{ subject.name }}
      </button>
    </div>

    <div class="mt-auto flex justify-end pt-4">
      <RouterLink :to="`/app/courses/${course.code}`" class="btn-webcis-blue">Ver curso</RouterLink>
    </div>
  </article>
</template>
