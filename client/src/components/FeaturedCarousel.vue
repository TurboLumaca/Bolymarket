<script setup>
import { ref, computed } from 'vue';
import SideIcon from './SideIcon.vue';
import TrendChart from './TrendChart.vue';
import { percent, credits, day } from '../format';

// One big card at a time. No autoplay, so nobody is rushed and reduced motion is respected.
const props = defineProps({ markets: Array });
const index = ref(0);
const current = computed(() => props.markets[Math.min(index.value, props.markets.length - 1)]);
const go = (step) => (index.value = (index.value + step + props.markets.length) % props.markets.length);
</script>

<template>
  <section aria-roledescription="carosello" aria-label="Mercati in evidenza" class="card">
    <article class="grid gap-4 md:grid-cols-[1fr_1.1fr] md:gap-6" :aria-label="`${index + 1} di ${markets.length}`">
      <div class="flex flex-col gap-3">
        <p class="text-sm text-muted">{{ current.category }} · in evidenza</p>
        <h2 class="text-xl font-bold leading-snug md:text-2xl">
          <RouterLink :to="`/mercati/${current.id}`" class="text-ink no-underline hover:underline">{{ current.question }}</RouterLink>
        </h2>
        <ul class="divide-y divide-line">
          <li class="flex items-center gap-3 py-2">
            <span class="flex flex-1 items-center gap-2 font-semibold text-yes"><SideIcon side="yes" /> Sì</span>
            <span class="text-3xl font-extrabold">{{ percent(current.priceYes) }}</span>
            <RouterLink :to="{ path: `/mercati/${current.id}`, query: { side: 'yes' } }" class="side-pill side-yes">Sì · {{ credits(current.priceYes) }}</RouterLink>
          </li>
          <li class="flex items-center gap-3 py-2">
            <span class="flex flex-1 items-center gap-2 font-semibold text-no"><SideIcon side="no" /> No</span>
            <span class="text-3xl font-extrabold">{{ percent(current.priceNo) }}</span>
            <RouterLink :to="{ path: `/mercati/${current.id}`, query: { side: 'no' } }" class="side-pill side-no">No · {{ credits(current.priceNo) }}</RouterLink>
          </li>
        </ul>
        <p class="text-sm text-muted">Chiude il {{ day(current.closesAt) }} · {{ current.tradeCount }} operazioni</p>
      </div>
      <div class="min-h-[160px]">
        <p class="mb-1 text-sm font-semibold">Probabilità del Sì, ultime rilevazioni</p>
        <TrendChart :values="current.trend || []" :name="'f' + current.id" />
      </div>
    </article>

    <div v-if="markets.length > 1" class="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
      <button type="button" class="chip" @click="go(-1)">← Precedente</button>
      <div class="flex">
        <button v-for="(m, i) in markets" :key="m.id" type="button" class="tab-dot"
          :aria-current="i === index" :aria-label="`Mostra mercato ${i + 1} di ${markets.length}`" @click="index = i"></button>
      </div>
      <button type="button" class="chip" @click="go(1)">Successivo →</button>
    </div>
  </section>
</template>
