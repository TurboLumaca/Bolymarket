<script setup>
import { computed } from 'vue';
import { percent } from '../format';

// Simple line chart with a gradient area, drawn with plain SVG. `values` are Yes prices from 0 to 1, oldest first.
const props = defineProps({ values: Array, name: { type: String, default: 'gradient' } });
const W = 480, H = 200, PAD = { left: 40, right: 14, top: 14, bottom: 14 };
const y = (v) => PAD.top + (1 - v) * (H - PAD.top - PAD.bottom);
const points = computed(() => {
  const v = props.values || [];
  if (v.length < 2) return [];
  return v.map((p, i) => ({ x: PAD.left + (i / (v.length - 1)) * (W - PAD.left - PAD.right), y: y(p) }));
});
const line = computed(() => points.value.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '));
const area = computed(() => (line.value ? `${line.value} L${W - PAD.right} ${H - PAD.bottom} L${PAD.left} ${H - PAD.bottom} Z` : ''));
const last = computed(() => points.value[points.value.length - 1]);
const text = computed(() => {
  const v = props.values || [];
  return v.length < 2 ? 'Dati insufficienti per il grafico.' : `Probabilità del Sì: da ${percent(v[0])} a ${percent(v[v.length - 1])} nelle ultime ${v.length} rilevazioni.`;
});
</script>

<template>
  <svg v-if="line" :viewBox="`0 0 ${W} ${H}`" class="h-full w-full" role="img" :aria-label="text">
    <defs>
      <linearGradient :id="'fill-' + name" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgb(var(--yes))" stop-opacity="0.4" />
        <stop offset="1" stop-color="rgb(var(--yes))" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g class="text-muted" fill="currentColor" font-size="12">
      <g v-for="v in [0, 0.5, 1]" :key="v">
        <line :x1="PAD.left" :x2="W - PAD.right" :y1="y(v)" :y2="y(v)" stroke="rgb(var(--line))" />
        <text :x="PAD.left - 6" :y="y(v) + 4" text-anchor="end">{{ percent(v) }}</text>
      </g>
    </g>
    <path :d="area" :fill="`url(#fill-${name})`" />
    <path :d="line" fill="none" stroke="rgb(var(--yes))" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
    <circle :cx="last.x" :cy="last.y" r="4" fill="rgb(var(--yes))" />
  </svg>
  <p v-else class="text-sm text-muted">{{ text }}</p>
</template>
