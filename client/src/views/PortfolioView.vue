<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api';
import { credits, statusLabel } from '../format';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();
const data = ref(null);
const error = ref('');

onMounted(async () => {
  try {
    data.value = await api('GET', '/portfolio');
  } catch (e) {
    error.value = e.message;
  }
});

const sign = (n) => (n > 0 ? '+' : '') + credits(n);
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Il mio portafoglio</h1>
  <p v-if="!user">Devi <RouterLink to="/accedi">accedere</RouterLink> per vedere il portafoglio.</p>
  <p v-else-if="error" role="alert" class="font-semibold text-no">Errore: {{ error }}</p>
  <template v-else-if="data">
    <dl class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="card"><dt class="text-sm text-muted">Crediti disponibili</dt><dd class="text-2xl font-bold">{{ credits(data.credits) }}</dd></div>
      <div class="card"><dt class="text-sm text-muted">Valore delle quote aperte</dt><dd class="text-2xl font-bold">{{ credits(data.openValue) }}</dd></div>
      <div class="card"><dt class="text-sm text-muted">Profitto / perdita</dt><dd class="text-2xl font-bold">{{ sign(data.profit) }}</dd></div>
    </dl>
    <p v-if="!data.positions.length" class="text-muted">Non hai ancora quote. <RouterLink to="/">Vai ai mercati</RouterLink>.</p>
    <ul class="grid gap-4 md:grid-cols-2">
      <li v-for="p in data.positions" :key="p.marketId" class="card space-y-1">
        <p class="font-semibold"><RouterLink :to="`/mercati/${p.marketId}`">{{ p.question }}</RouterLink></p>
        <p class="text-sm text-muted">
          {{ statusLabel[p.status] }}<template v-if="p.outcome"> · esito {{ p.outcome === 'yes' ? 'Sì' : 'No' }}</template>
        </p>
        <p>Quote: {{ p.sharesYes }} Sì, {{ p.sharesNo }} No</p>
        <p>Investito: {{ credits(p.costBasis) }} · Valore: {{ credits(p.value) }}</p>
        <p class="font-bold">Profitto / perdita: {{ sign(p.profit) }}</p>
      </li>
    </ul>
  </template>
  <p v-else role="status" class="text-muted">Caricamento…</p>
</template>
