<script setup>
defineProps({
  description: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  controlNumber: {
    type: String,
    default: null,
  },
  roleLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="rounded-(--radius-card) bg-white p-[18px] shadow-(--shadow-card) sm:p-6">
    <p class="font-display text-[17px] font-bold text-negro-sintaxis">Acerca de</p>
    <p v-if="description" class="mt-3.5 font-display text-[15px] leading-relaxed text-[#444]">{{ description }}</p>
    <p v-else class="mt-3.5 font-display text-[15px] text-[#999]">Aún no has agregado una descripción.</p>

    <div class="mt-4 flex flex-col gap-2.5">
      <div class="flex items-center gap-2.5 font-display text-sm text-[#555]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" stroke-width="1.9" class="flex-none">
          <path d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        </svg>
        {{ email ?? '—' }}
      </div>

      <div v-if="controlNumber" class="flex items-center gap-2.5 font-display text-sm text-[#555]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" stroke-width="1.9" class="flex-none">
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <path d="M3 9h18" />
        </svg>
        Número de control {{ controlNumber }}
      </div>

      <div class="flex items-center gap-2.5 font-display text-sm text-[#555]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" stroke-width="1.9" class="flex-none">
          <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />
        </svg>
        Tipo de usuario:
        <span
          class="ml-1 rounded-full px-2.5 py-0.5 font-display text-xs font-bold"
          style="background: var(--color-tag-poo-bg); color: var(--color-tag-poo-fg)"
        >{{ roleLabel }}</span>
      </div>
    </div>
  </div>
</template>
