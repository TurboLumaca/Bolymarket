<script setup>
import { computed } from 'vue';
import { percent } from '../format';

const props = defineProps({ priceYes: Number, large: Boolean });
const yesPercent = computed(() => Math.round(props.priceYes * 100));
</script>

<template>
  <div>
    <p class="font-bold" :class="large ? 'text-4xl' : 'text-3xl'">
      {{ percent(priceYes) }} <span class="text-base font-semibold text-yes">Sì</span>
    </p>
    <div
      class="mt-2 flex h-2 w-full overflow-hidden rounded-full border border-line"
      role="meter"
      aria-label="Probabilità del Sì"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="yesPercent"
      :aria-valuetext="yesPercent + '% Sì'"
    >
      <div class="bg-yes transition-[width] duration-500" :style="{ width: yesPercent + '%' }"></div>
      <div class="no-stripes flex-1"></div>
    </div>
  </div>
</template>
