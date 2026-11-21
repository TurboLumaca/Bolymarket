<script setup>
import { ref, onMounted } from 'vue';
import ErrorText from './ErrorText.vue';
import { api } from '../api';

const proposals = ref([]);
const categories = ref([]);
const error = ref('');
const reasons = ref({});

async function load() {
  proposals.value = (await api('GET', '/admin/markets?status=proposed')).map((p) => ({ ...p, liquidityB: 100 }));
}
async function run(promise) {
  error.value = '';
  try { await promise; await load(); } catch (e) { error.value = e.message; }
}
const approve = (p) => run(api('POST', `/admin/markets/${p.id}/approve`, {
  question: p.question, category: p.category, resolutionRule: p.resolutionRule, liquidityB: Number(p.liquidityB),
}));
const reject = (p) => run(api('POST', `/admin/markets/${p.id}/reject`, { reason: reasons.value[p.id] || '' }));

onMounted(async () => {
  categories.value = await api('GET', '/categories');
  load();
});
</script>

<template>
  <section aria-labelledby="propTitle">
    <h2 id="propTitle" class="mb-3 text-lg font-bold">Proposte da valutare</h2>
    <ErrorText id="propError" :message="error" />
    <p v-if="!proposals.length" class="text-muted">Nessuna proposta in attesa.</p>
    <ul class="space-y-4">
      <li v-for="p in proposals" :key="p.id" class="card space-y-3">
        <p class="text-sm text-muted">Proposta da {{ p.proposerNickname || 'utente eliminato' }}</p>
        <div>
          <label :for="`q${p.id}`" class="mb-1 block font-semibold">Domanda</label>
          <input :id="`q${p.id}`" v-model="p.question" class="input" />
        </div>
        <div>
          <label :for="`r${p.id}`" class="mb-1 block font-semibold">Regola di risoluzione</label>
          <textarea :id="`r${p.id}`" v-model="p.resolutionRule" rows="3" class="input py-2"></textarea>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label :for="`c${p.id}`" class="mb-1 block font-semibold">Categoria</label>
            <select :id="`c${p.id}`" v-model="p.category" class="input"><option v-for="c in categories" :key="c">{{ c }}</option></select>
          </div>
          <div>
            <label :for="`b${p.id}`" class="mb-1 block font-semibold">Liquidità (b)</label>
            <input :id="`b${p.id}`" v-model="p.liquidityB" inputmode="numeric" class="input" />
          </div>
        </div>
        <button type="button" class="btn" @click="approve(p)">Approva</button>
        <div>
          <label :for="`x${p.id}`" class="mb-1 block font-semibold">Motivo del rifiuto</label>
          <input :id="`x${p.id}`" v-model="reasons[p.id]" class="input" />
          <button type="button" class="chip mt-2" @click="reject(p)">Rifiuta</button>
        </div>
      </li>
    </ul>
  </section>
</template>
