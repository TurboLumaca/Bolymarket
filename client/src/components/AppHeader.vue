<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Logo from './Logo.vue';
import { useAuth } from '../composables/useAuth';
import { credits } from '../format';
import { api } from '../api';

const { user, logout } = useAuth();
const route = useRoute();
const router = useRouter();
const categories = ref([]);
const term = ref(String(route.query.q || ''));
let timer = null;

onMounted(async () => {
  try { categories.value = await api('GET', '/categories'); } catch { /* the tabs just stay empty */ }
});

// Keep the search field in sync with the address (back button, category tabs).
watch(() => route.query.q, (q) => { term.value = String(q || ''); });

// The search lives in the address (?q=), so the home page only has to read it.
function onSearch() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const query = route.path === '/' ? { ...route.query } : {};
    if (term.value.trim()) query.q = term.value.trim(); else delete query.q;
    router.replace({ path: '/', query });
  }, 300);
}

const tabTo = (name) => ({ path: '/', query: name ? { category: name } : {} });
const isActive = (name) => route.path === '/' && (route.query.category || '') === name;

async function onLogout() {
  await logout();
  router.push('/');
}
</script>

<template>
  <header class="z-40 md:sticky md:top-0 border-b border-line bg-paper">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-2">
      <RouterLink to="/" class="flex items-center gap-2 text-lg font-extrabold text-ink no-underline">
        <Logo /> Bolymarket
      </RouterLink>

      <form role="search" class="order-last w-full md:order-none md:max-w-md md:flex-1" @submit.prevent="onSearch">
        <label for="search" class="sr-only">Cerca mercati</label>
        <input id="search" v-model="term" type="search" class="input rounded-full bg-surface" placeholder="Cerca mercati" autocomplete="off" @input="onSearch" />
      </form>

      <div class="ml-auto flex items-center gap-3">
        <template v-if="user">
          <span class="text-sm">{{ user.nickname }} · <strong>{{ credits(user.credits) }}</strong> crediti</span>
          <button type="button" class="btn border border-edge !bg-surface !text-ink" @click="onLogout">Esci</button>
        </template>
        <template v-else>
          <RouterLink to="/accedi" class="inline-flex min-h-[44px] items-center">Accedi</RouterLink>
          <RouterLink to="/registrati" class="btn">Registrati</RouterLink>
        </template>
      </div>
    </div>

    <nav aria-label="Principale" class="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
      <RouterLink to="/classifica" class="tab">Classifica</RouterLink>
      <RouterLink v-if="user" to="/portafoglio" class="tab">Portafoglio</RouterLink>
      <RouterLink to="/proponi" class="tab">Proponi</RouterLink>
      <RouterLink v-if="user && user.role === 'gestore'" to="/gestore" class="tab">Gestore</RouterLink>
    </nav>

    <nav aria-label="Categorie" class="mx-auto max-w-6xl overflow-x-auto px-4">
      <ul class="flex gap-1">
        <li v-for="name in ['', ...categories]" :key="name">
          <RouterLink v-slot="{ href, navigate }" custom :to="tabTo(name)">
            <a :href="href" class="tab" :aria-current="isActive(name) ? 'true' : undefined" @click="navigate">{{ name || 'Tutti' }}</a>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
