<script setup>
import { ref, onMounted } from 'vue';
import ContentRules from '../components/ContentRules.vue';
import ErrorText from '../components/ErrorText.vue';
import { api } from '../api';
import { statusLabel } from '../format';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();
const categories = ref([]);
const mine = ref([]);
const form = ref({ question: '', category: '', resolutionRule: '', closesAt: '' });
const error = ref('');
const done = ref('');

async function loadMine() {
  if (user.value) mine.value = await api('GET', '/proposals/mine');
}

async function submit() {
  error.value = '';
  done.value = '';
  try {
    await api('POST', '/proposals', form.value);
    done.value = 'Proposta inviata: il gestore la valuterà.';
    form.value = { question: '', category: '', resolutionRule: '', closesAt: '' };
    loadMine();
  } catch (e) {
    error.value = e.message;
  }
}

onMounted(async () => {
  categories.value = await api('GET', '/categories');
  loadMine();
});
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Proponi un mercato</h1>
  <p v-if="!user">Devi <RouterLink to="/accedi">accedere</RouterLink> per proporre un mercato.</p>
  <div v-else class="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
    <div class="space-y-4">
      <ContentRules />
      <form class="card space-y-4" novalidate @submit.prevent="submit">
        <div>
          <label for="question" class="mb-1 block font-semibold">Domanda (sì o no)</label>
          <input id="question" v-model="form.question" class="input" maxlength="200" required />
        </div>
        <div>
          <label for="category" class="mb-1 block font-semibold">Categoria</label>
          <select id="category" v-model="form.category" class="input" required>
            <option value="" disabled>Scegli…</option>
            <option v-for="c in categories" :key="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label for="rule" class="mb-1 block font-semibold">Regola di risoluzione</label>
          <textarea id="rule" v-model="form.resolutionRule" class="input py-2" rows="4" maxlength="500" required aria-describedby="ruleHelp"></textarea>
          <p id="ruleHelp" class="mt-1 text-sm text-muted">Indica quando vince il Sì e la fonte verificabile.</p>
        </div>
        <div>
          <label for="closesAt" class="mb-1 block font-semibold">Data di chiusura</label>
          <input id="closesAt" v-model="form.closesAt" type="datetime-local" class="input" required />
        </div>
        <ErrorText id="proposeError" :message="error" />
        <p v-if="done" role="status" class="font-semibold text-yes">{{ done }}</p>
        <button type="submit" class="btn w-full">Invia proposta</button>
      </form>
    </div>
    <section aria-labelledby="mineTitle">
      <h2 id="mineTitle" class="mb-2 text-lg font-bold">Le mie proposte</h2>
      <p v-if="!mine.length" class="text-muted">Non hai ancora proposto nulla.</p>
      <ul class="space-y-3">
        <li v-for="p in mine" :key="p.id" class="card">
          <p class="font-semibold">{{ p.question }}</p>
          <p class="text-sm text-muted">Stato: {{ statusLabel[p.status] }}</p>
          <p v-if="p.rejectionReason" class="text-sm">Motivo del rifiuto: {{ p.rejectionReason }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>
