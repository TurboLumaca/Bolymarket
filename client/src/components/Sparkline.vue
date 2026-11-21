<script setup>
import { computed } from 'vue';

const props = defineProps({ values: Array });
const W = 120, H = 32;
const path = computed(() => {
  const v = props.values;
  if (v.length < 2) return '';
  return v.map((p, i) => `${i ? 'L' : 'M'}${((i / (v.length - 1)) * W).toFixed(1)} ${(2 + (1 - p) * (H - 4)).toFixed(1)}`).join(' ');
});
const area = computed(() => (path.value ? `${path.value} L${W} ${H} L0 ${H} Z` : ''));
</script>

<template>
  <svg v-if="path" :viewBox="`0 0 ${W} ${H}`" class="h-8 w-full" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgb(var(--yes))" stop-opacity="0.3" />
        <stop offset="1" stop-color="rgb(var(--yes))" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path :d="area" fill="url(#sparkFill)" />
    <path :d="path" fill="none" stroke="rgb(var(--yes))" stroke-width="2" vector-effect="non-scaling-stroke" />
  </svg>
</template>
