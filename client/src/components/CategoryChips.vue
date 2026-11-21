<script setup>
defineProps({ categories: Array, modelValue: String });
defineEmits(['update:modelValue']);
</script>

<template>
  <ul class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2" aria-label="Categorie">
    <li v-for="name in ['', ...categories]" :key="name">
      <button type="button" class="chip" :aria-pressed="modelValue === name" @click="$emit('update:modelValue', name)">
        {{ name || 'Tutte' }}
      </button>
    </li>
  </ul>
</template>
