<script setup>
defineProps({ side: String });
</script>

<template>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-if="side === 'yes'" d="M3 8.5l3.5 3.5L13 4.5" />
    <path v-else d="M4 4l8 8M12 4l-8 8" />
  </svg>
</template>
