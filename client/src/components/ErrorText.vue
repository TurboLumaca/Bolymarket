<script setup>
defineProps({ id: String, message: String });
</script>

<template>
  <p v-if="message" :id="id" role="alert" class="mt-1 text-sm font-semibold text-no">Errore: {{ message }}</p>
</template>
