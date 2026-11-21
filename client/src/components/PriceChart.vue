<script setup>
import { computed, ref } from 'vue';
import { percent, dateTime, toDate } from '../format';

const props = defineProps({ history: Array });
const showTable = ref(false);

const W = 600, H = 220, PAD = { left: 40, right: 12, top: 12, bottom: 24 };
const points = computed(() => {
  const list = props.history;
  if (!list.length) return [];
  const t0 = toDate(list[0].createdAt).getTime();
  const span = Math.max(1, toDate(list[list.length - 1].createdAt).getTime() - t0);
  return list.map((p) => ({
    x: PAD.left + ((toDate(p.createdAt).getTime() - t0) / span) * (W - PAD.left - PAD.right),
    y: PAD.top + (1 - p.priceYes) * (H - PAD.top - PAD.bottom),
  }));
});
const linePath = computed(() => points.value.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '));
const areaPath = computed(() => {
  if (!points.value.length) return '';
  const last = points.value[points.value.length - 1];
  return `${linePath.value} L${last.x.toFixed(1)} ${H - PAD.bottom} L${points.value[0].x.toFixed(1)} ${H - PAD.bottom} Z`;
});
const gridLines = [0, 0.5, 1].map((v) => ({ v, y: PAD.top + (1 - v) * (H - PAD.top - PAD.bottom) }));
const description = computed(() => {
  const list = props.history;
  if (!list.length) return 'Nessun dato disponibile.';
  const first = list[0].priceYes, last = list[list.length - 1].priceYes;
  return `Probabilità del Sì nel tempo: da ${percent(first)} a ${percent(last)} in ${list.length} rilevazioni.`;
});
</script>

<template>
  <figure class="card">
    <figcaption class="mb-2 font-semibold">Andamento della probabilità del Sì</figcaption>
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" aria-labelledby="chartTitle chartDesc">
      <title id="chartTitle">Grafico della probabilità del Sì</title>
      <desc id="chartDesc">{{ description }}</desc>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="rgb(var(--yes))" stop-opacity="0.35" />
          <stop offset="1" stop-color="rgb(var(--yes))" stop-opacity="0" />
        </linearGradient>
      </defs>
      <g class="text-muted" fill="currentColor" font-size="11">
        <g v-for="line in gridLines" :key="line.v">
          <line :x1="PAD.left" :x2="W - PAD.right" :y1="line.y" :y2="line.y" stroke="rgb(var(--line))" stroke-dasharray="3 4" />
          <text :x="PAD.left - 6" :y="line.y + 4" text-anchor="end">{{ percent(line.v) }}</text>
        </g>
      </g>
      <path :d="areaPath" fill="url(#areaFill)" />
      <path :d="linePath" fill="none" stroke="rgb(var(--yes))" stroke-width="2.5" stroke-linejoin="round" />
    </svg>
    <button type="button" class="btn mt-3 border border-edge !bg-surface !text-ink" :aria-expanded="showTable" aria-controls="chartTable" @click="showTable = !showTable">
      {{ showTable ? 'Nascondi tabella dati' : 'Mostra tabella dati' }}
    </button>
    <div v-if="showTable" id="chartTable" class="mt-3 max-h-64 overflow-auto" tabindex="0" role="region" aria-label="Tabella dei dati del grafico">
      <table class="w-full text-left text-sm">
        <caption class="sr-only">Probabilità del Sì per data e ora</caption>
        <thead><tr><th scope="col" class="py-1">Data e ora</th><th scope="col" class="py-1">Probabilità del Sì</th></tr></thead>
        <tbody>
          <tr v-for="(p, i) in history" :key="i" class="border-t border-line">
            <td class="py-1">{{ dateTime(p.createdAt) }}</td><td class="py-1">{{ percent(p.priceYes) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>
