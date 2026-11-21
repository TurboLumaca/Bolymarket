<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../api';
import { day } from '../format';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();
const data = ref(null);
const error = ref('');
const maxTraders = computed(() => Math.max(1, ...(data.value?.activeTradersPerWeek.map((w) => w.traders) ?? [1])));
const maxTrades = computed(() => Math.max(1, ...(data.value?.tradesPerMarket.map((m) => m.trades) ?? [1])));

onMounted(async () => {
  if (!user.value || user.value.role !== 'gestore') return;
  try {
    data.value = await api('GET', '/admin/dashboard');
  } catch (e) {
    error.value = e.message;
  }
});
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Dashboard del gestore</h1>
  <p v-if="!user || user.role !== 'gestore'">Questa pagina è riservata al gestore.</p>
  <p v-else-if="error" role="alert" class="font-semibold text-no">Errore: {{ error }}</p>
  <div v-else-if="data" class="space-y-6">
    <dl class="grid gap-3 sm:grid-cols-3">
      <div class="card"><dt class="text-sm text-muted">Proposte approvate / inviate</dt><dd class="text-2xl font-bold">{{ data.proposals.approved }} / {{ data.proposals.proposed }}</dd></div>
      <div class="card"><dt class="text-sm text-muted">Ore medie da chiusura a risoluzione</dt><dd class="text-2xl font-bold">{{ data.avgHoursClosingToResolution ?? '–' }}</dd></div>
      <div class="card"><dt class="text-sm text-muted">Segnalazioni aperte</dt><dd class="text-2xl font-bold">{{ data.openReports }}</dd></div>
    </dl>

    <section aria-labelledby="weeksTitle" class="card">
      <h2 id="weeksTitle" class="mb-3 font-bold">Utenti attivi per settimana</h2>
      <ul class="space-y-2">
        <li v-for="w in data.activeTradersPerWeek" :key="w.firstDay" class="grid grid-cols-[8rem_1fr_2rem] items-center gap-2">
          <span class="text-sm">Dal {{ day(w.firstDay + ' 00:00:00') }}</span>
          <span class="h-3 rounded bg-brand" :style="{ width: (w.traders / maxTraders) * 100 + '%' }" aria-hidden="true"></span>
          <span class="font-bold">{{ w.traders }}</span>
        </li>
      </ul>
    </section>

    <section aria-labelledby="perMarketTitle" class="card">
      <h2 id="perMarketTitle" class="mb-3 font-bold">Operazioni per mercato</h2>
      <ul class="space-y-3">
        <li v-for="m in data.tradesPerMarket" :key="m.id">
          <p class="text-sm"><RouterLink :to="`/mercati/${m.id}`">{{ m.question }}</RouterLink> · <strong>{{ m.trades }}</strong></p>
          <span class="mt-1 block h-3 rounded bg-brand" :style="{ width: (m.trades / maxTrades) * 100 + '%' }" aria-hidden="true"></span>
        </li>
      </ul>
    </section>
  </div>
  <p v-else role="status" class="text-muted">Caricamento…</p>
</template>
