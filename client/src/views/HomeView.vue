<script setup>
import { ref, watch, onMounted } from 'vue';
import MarketCard from '../components/MarketCard.vue';
import CategoryChips from '../components/CategoryChips.vue';
import { api } from '../api';

const statuses = [['open', 'Aperti'], ['closed', 'Chiusi'], ['resolved', 'Risolti'], ['voided', 'Annullati']];
const markets = ref([]);
const categories = ref([]);
const status = ref('open');
const category = ref('');
const search = ref('');
const error = ref('');
const loading = ref(true);
let timer = null;

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams({ status: status.value, category: category.value, q: search.value });
    markets.value = await api('GET', '/markets?' + params);
  } catch (e) {
    error.value = e.message;
  }
  loading.value = false;
}

onMounted(async () => {
  categories.value = await api('GET', '/categories');
  load();
});
watch([status, category], load);
watch(search, () => {
  clearTimeout(timer);
  timer = setTimeout(load, 300);
});
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Mercati del campus</h1>

  <div class="mb-4 space-y-3">
    <div>
      <label for="search" class="mb-1 block text-sm font-semibold">Cerca nel titolo</label>
      <input id="search" v-model="search" type="search" class="input" autocomplete="off" />
    </div>
    <div role="group" aria-label="Stato del mercato" class="flex flex-wrap gap-2">
      <button v-for="[value, label] in statuses" :key="value" type="button" class="chip" :aria-pressed="status === value" @click="status = value">
        {{ label }}
      </button>
    </div>
    <CategoryChips v-model="category" :categories="categories" />
  </div>

  <p v-if="error" role="alert" class="font-semibold text-no">Errore: {{ error }}</p>
  <p v-else-if="loading" role="status" class="text-muted">Caricamento…</p>
  <p v-else-if="!markets.length" role="status" class="text-muted">Nessun mercato trovato.</p>
  <ul v-else class="grid gap-4 md:grid-cols-2">
    <li v-for="market in markets" :key="market.id"><MarketCard :market="market" class="h-full" /></li>
  </ul>
</template>
