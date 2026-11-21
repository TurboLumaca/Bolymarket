<script setup>
import ProbabilityBar from './ProbabilityBar.vue';
import Sparkline from './Sparkline.vue';
import YesNoButtons from './YesNoButtons.vue';
import { day, statusLabel } from '../format';

defineProps({ market: Object });
</script>

<template>
  <article class="card flex flex-col gap-3">
    <p class="text-sm text-muted">{{ market.category }} · {{ statusLabel[market.status] }}</p>
    <h2 class="text-lg font-semibold leading-snug">
      <RouterLink :to="`/mercati/${market.id}`" class="text-ink no-underline hover:underline">{{ market.question }}</RouterLink>
    </h2>
    <div class="flex items-end justify-between gap-4">
      <ProbabilityBar :price-yes="market.priceYes" class="min-w-0 flex-1" />
      <div class="w-24 shrink-0"><Sparkline :values="market.trend || []" /></div>
    </div>
    <p v-if="market.status === 'resolved'" class="font-semibold">
      Risolto: {{ market.outcome === 'yes' ? 'Sì' : 'No' }}
    </p>
    <p class="text-sm text-muted">
      {{ market.status === 'open' ? 'Chiude il' : 'Chiuso il' }} {{ day(market.closesAt) }} · {{ market.tradeCount }} operazioni
    </p>
    <YesNoButtons v-if="market.status === 'open'" :market-id="market.id" :price-yes="market.priceYes" :price-no="market.priceNo" />
  </article>
</template>
