<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MarketCard from '../components/MarketCard.vue';
import FeaturedCarousel from '../components/FeaturedCarousel.vue';
import HomeSidebar from '../components/HomeSidebar.vue';
import { api } from '../api';

const statuses = [['open', 'Aperti'], ['closed', 'Chiusi'], ['resolved', 'Risolti'], ['voided', 'Annullati']];
const route = useRoute();
const router = useRouter();
const markets = ref([]);
const openMarkets = ref([]); // all open markets, for the featured card and the side lists
const error = ref('');
const loading = ref(true);

// Filters live in the address: ?status=...&category=...&q=...
const status = computed(() => String(route.query.status || 'open'));
const category = computed(() => String(route.query.category || ''));
const search = computed(() => String(route.query.q || ''));

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

function setStatus(value) {
  const query = { ...route.query };
  if (value === 'open') delete query.status; else query.status = value;
  router.replace({ path: '/', query });
}

const byTrades = (a, b) => b.tradeCount - a.tradeCount;
const change = (m) => (m.trend && m.trend.length > 1 ? Math.round((m.trend[m.trend.length - 1] - m.trend[0]) * 100) : 0);
const featured = computed(() => [...openMarkets.value].sort(byTrades).slice(0, 3));
const traded = computed(() => [...openMarkets.value].sort(byTrades).slice(0, 5));
const moved = computed(() =>
  openMarkets.value.map((m) => ({ ...m, change: change(m) }))
    .filter((m) => m.change !== 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5));

onMounted(async () => {
  try { openMarkets.value = await api('GET', '/markets?status=open'); } catch { /* the side lists stay empty */ }
});
watch(() => route.query, load, { immediate: true });
</script>

<template>
  <div class="lg:grid lg:grid-cols-[1fr_20rem] lg:gap-6">
    <div class="space-y-6 lg:col-start-1">
      <h1 class="text-xl font-bold">Mercati del campus</h1>
      <FeaturedCarousel v-if="featured.length" :markets="featured" />

      <section aria-labelledby="listTitle" class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 id="listTitle" class="text-lg font-bold">
            {{ category || 'Tutti i mercati' }}<span v-if="search" class="font-normal text-muted"> · «{{ search }}»</span>
          </h2>
          <div role="group" aria-label="Stato del mercato" class="flex flex-wrap gap-2">
            <button v-for="[value, label] in statuses" :key="value" type="button" class="chip" :aria-pressed="status === value" @click="setStatus(value)">
              {{ label }}
            </button>
          </div>
        </div>
        <p v-if="error" role="alert" class="font-semibold text-no">Errore: {{ error }}</p>
        <p v-else-if="loading" role="status" class="text-muted">Caricamento…</p>
        <p v-else-if="!markets.length" role="status" class="text-muted">Nessun mercato trovato.</p>
        <ul v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <li v-for="market in markets" :key="market.id"><MarketCard :market="market" class="h-full" /></li>
        </ul>
      </section>
    </div>

    <aside aria-label="In breve" class="mt-6 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:self-start">
      <HomeSidebar :moved="moved" :traded="traded" />
    </aside>
  </div>
</template>
