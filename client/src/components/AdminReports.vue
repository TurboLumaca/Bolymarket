<script setup>
import { ref, onMounted } from 'vue';
import ErrorText from './ErrorText.vue';
import { api } from '../api';
import { dateTime } from '../format';

const reports = ref([]);
const error = ref('');
async function load() { reports.value = await api('GET', '/admin/reports'); }
async function run(promise) {
  error.value = '';
  try { await promise; await load(); } catch (e) { error.value = e.message; }
}
const close = (r) => run(api('POST', `/admin/reports/${r.id}/close`, {}));
const hide = (r) => run(api('POST', `/admin/markets/${r.marketId}/hide`, {}).then(() => api('POST', `/admin/reports/${r.id}/close`, {})));
onMounted(load);
</script>

<template>
  <section aria-labelledby="repTitle">
    <h2 id="repTitle" class="mb-3 text-lg font-bold">Segnalazioni aperte</h2>
    <ErrorText id="repError" :message="error" />
    <p v-if="!reports.length" class="text-muted">Nessuna segnalazione aperta.</p>
    <ul class="space-y-4">
      <li v-for="r in reports" :key="r.id" class="card space-y-2">
        <p class="font-semibold">{{ r.question }}</p>
        <p>«{{ r.reason }}» <span class="text-sm text-muted">({{ r.reporter }}, {{ dateTime(r.createdAt) }})</span></p>
        <div class="flex gap-3">
          <button type="button" class="chip" @click="close(r)">Archivia</button>
          <button v-if="!['resolved', 'voided', 'hidden'].includes(r.marketStatus)" type="button" class="chip" @click="hide(r)">Nascondi il mercato</button>
        </div>
      </li>
    </ul>
  </section>
</template>
