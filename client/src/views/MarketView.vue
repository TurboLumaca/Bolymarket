<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import ProbabilityBar from '../components/ProbabilityBar.vue';
import PriceChart from '../components/PriceChart.vue';
import TradePanel from '../components/TradePanel.vue';
import ReportForm from '../components/ReportForm.vue';
import { api } from '../api';
import { day, statusLabel } from '../format';
import { useIsDesktop } from '../composables/useIsDesktop';
import { useAuth } from '../composables/useAuth';

const route = useRoute();
const market = ref(null);
const error = ref('');
const sheet = ref(null);
const isDesktop = useIsDesktop();
const { user } = useAuth();

async function load() {
  try {
    market.value = await api('GET', `/markets/${route.params.id}`);
  } catch (e) {
    error.value = e.message;
  }
}
async function onTraded() {
  await load();
  sheet.value?.close();
}
onMounted(load);
watch(user, load);
</script>

<template>
  <p v-if="error" role="alert" class="font-semibold text-no">Errore: {{ error }}</p>
  <template v-else-if="market">
    <div class="md:grid md:grid-cols-[1fr_22rem] md:gap-6">
      <div class="space-y-4">
        <p class="text-sm text-muted">{{ market.category }} · {{ statusLabel[market.status] }}</p>
        <h1 class="text-2xl font-bold leading-snug">{{ market.question }}</h1>
        <ProbabilityBar :price-yes="market.priceYes" large />
        <p v-if="market.status === 'resolved'" class="card font-semibold">
          Risolto: {{ market.outcome === 'yes' ? 'Sì' : 'No' }}. Prova: {{ market.resolutionEvidence }}
        </p>
        <p v-if="market.status === 'voided'" class="card font-semibold">Mercato annullato: le operazioni sono state rimborsate.</p>
        <PriceChart :history="market.history" />
        <section class="card" aria-labelledby="ruleTitle">
          <h2 id="ruleTitle" class="mb-1 font-bold">Regola di risoluzione</h2>
          <p>{{ market.resolutionRule }}</p>
          <p class="mt-2 text-sm text-muted">Chiusura: {{ day(market.closesAt) }}</p>
        </section>
        <ReportForm v-if="user && ['open', 'closed', 'resolved'].includes(market.status)" :market-id="market.id" />
        <p v-if="user && market.myPosition && (market.myPosition.sharesYes || market.myPosition.sharesNo)" class="text-sm">
          Le tue quote: {{ market.myPosition.sharesYes }} Sì, {{ market.myPosition.sharesNo }} No.
        </p>
      </div>

      <aside v-if="isDesktop" class="sticky top-4 self-start" aria-label="Pannello operazioni">
        <TradePanel :market="market" @traded="onTraded" />
      </aside>
    </div>

    <template v-if="!isDesktop">
      <div class="sticky bottom-0 -mx-4 mt-4 border-t border-line bg-paper p-3">
        <button type="button" class="btn w-full" @click="sheet.showModal()">Opera su questo mercato</button>
      </div>
      <dialog ref="sheet" class="sheet" aria-label="Operazioni">
        <div class="mx-auto max-w-md space-y-3 p-4">
          <TradePanel :market="market" @traded="onTraded" />
          <button type="button" class="btn w-full border border-edge !bg-surface !text-ink" @click="sheet.close()">Chiudi</button>
        </div>
      </dialog>
    </template>
  </template>
  <p v-else role="status" class="text-muted">Caricamento…</p>
</template>
