<script setup>
import { useTheme } from '../composables/useTheme';

const { mode, set } = useTheme();
const options = [['auto', 'Automatico'], ['dark', 'Scuro'], ['light', 'Chiaro']];
</script>

<template>
  <div role="group" aria-label="Tema dei colori" class="flex flex-wrap gap-2">
    <button v-for="[value, label] in options" :key="value" type="button" class="chip" :aria-pressed="mode === value" @click="set(value)">
      {{ label }}
    </button>
  </div>
</template>
