<script setup>
import { ref, onMounted } from 'vue';
import ErrorText from './ErrorText.vue';
import { api } from '../api';
import { day, statusLabel } from '../format';

const markets = ref([]);
const error = ref('');
const evidence = ref({});

async function load() {
  const all = await api('GET', '/admin/markets');
  markets.value = all.filter((m) => ['open', 'closed'].includes(m.status));
}
async function run(promise) {
  error.value = '';
  try { await promise; await load(); } catch (e) { error.value = e.message; }
}
const resolve = (m, outcome) => run(api('POST', `/admin/markets/${m.id}/resolve`, { outcome, evidence: evidence.value[m.id] || '' }));
const voidMarket = (m) => confirm('Annullare il mercato? Tutte le operazioni saranno rimborsate al costo.') && run(api('POST', `/admin/markets/${m.id}/void`, {}));
const hide = (m) => confirm('Nascondere questo mercato?') && run(api('POST', `/admin/markets/${m.id}/hide`, {}));
onMounted(load);
</script>

<template>
  <section aria-labelledby="mktTitle">
    <h2 id="mktTitle" class="mb-3 text-lg font-bold">Mercati aperti e chiusi</h2>
    <ErrorText id="mktError" :message="error" />
    <ul class="space-y-4">
      <li v-for="m in markets" :key="m.id" class="card space-y-3">
        <p class="font-semibold"><RouterLink :to="`/mercati/${m.id}`">{{ m.question }}</RouterLink></p>
        <p class="text-sm text-muted">{{ statusLabel[m.status] }} · chiusura {{ day(m.closesAt) }}</p>
        <div v-if="m.status === 'closed'">
          <label :for="`e${m.id}`" class="mb-1 block font-semibold">Prova della risoluzione (una frase)</label>
          <input :id="`e${m.id}`" v-model="evidence[m.id]" class="input" />
          <div class="mt-2 flex gap-3">
            <button type="button" class="btn" @click="resolve(m, 'yes')">Risolvi Sì</button>
            <button type="button" class="btn" @click="resolve(m, 'no')">Risolvi No</button>
          </div>
        </div>
        <div class="flex gap-3">
          <button type="button" class="chip" @click="voidMarket(m)">Annulla mercato</button>
          <button type="button" class="chip" @click="hide(m)">Nascondi</button>
        </div>
      </li>
    </ul>
  </section>
</template>
