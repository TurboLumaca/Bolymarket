<script setup>
import { ref, watch, onMounted } from 'vue';
import { api } from '../api';
import { credits } from '../format';

const tab = ref('credits');
const data = ref(null);
const error = ref('');

async function load() {
  data.value = null;
  error.value = '';
  try {
    data.value = await api('GET', `/leaderboard?tab=${tab.value}`);
  } catch (e) {
    error.value = e.message;
  }
}
onMounted(load);
watch(tab, load);
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Classifica</h1>
  <div role="group" aria-label="Tipo di classifica" class="mb-4 flex gap-2">
    <button type="button" class="chip" :aria-pressed="tab === 'credits'" @click="tab = 'credits'">Crediti netti</button>
    <button type="button" class="chip" :aria-pressed="tab === 'brier'" @click="tab = 'brier'">Calibrazione</button>
  </div>
  <p v-if="tab === 'brier'" class="mb-3 max-w-prose text-sm text-muted">
    Il punteggio di Brier misura quanto sono precise le tue previsioni: più è basso, meglio è. Compaiono solo gli utenti con almeno
    {{ data ? data.minResolved : 5 }} previsioni risolte.
  </p>
  <p v-if="error" role="alert" class="font-semibold text-no">Errore: {{ error }}</p>
  <p v-else-if="!data" role="status" class="text-muted">Caricamento…</p>
  <p v-else-if="!data.rows.length" class="text-muted">Nessun utente in classifica.</p>
  <div v-else class="overflow-x-auto">
    <table class="w-full text-left">
      <caption class="sr-only">{{ tab === 'credits' ? 'Classifica per crediti netti' : 'Classifica per calibrazione (Brier)' }}</caption>
      <thead>
        <tr class="border-b border-line">
          <th scope="col" class="py-2 pr-3">#</th>
          <th scope="col" class="py-2 pr-3">Nickname</th>
          <th scope="col" class="py-2 text-right">{{ tab === 'credits' ? 'Crediti netti' : 'Brier' }}</th>
          <th v-if="tab === 'brier'" scope="col" class="py-2 pl-3 text-right">Previsioni</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in data.rows" :key="row.nickname" class="border-b border-line">
          <td class="py-2 pr-3">{{ i + 1 }}</td>
          <th scope="row" class="py-2 pr-3 font-semibold">{{ row.nickname }}</th>
          <td class="py-2 text-right font-bold">{{ tab === 'credits' ? credits(row.netCredits) : row.brier.toFixed(3) }}</td>
          <td v-if="tab === 'brier'" class="py-2 pl-3 text-right">{{ row.resolvedCount }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
