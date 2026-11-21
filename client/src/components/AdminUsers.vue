<script setup>
import { ref, onMounted } from 'vue';
import ErrorText from './ErrorText.vue';
import { api } from '../api';
import { credits } from '../format';

const users = ref([]);
const error = ref('');
async function load() { users.value = await api('GET', '/admin/users'); }
async function toggle(u) {
  error.value = '';
  try { await api('POST', `/admin/users/${u.id}/suspend`, { suspended: !u.suspended }); await load(); } catch (e) { error.value = e.message; }
}
onMounted(load);
</script>

<template>
  <section aria-labelledby="usrTitle">
    <h2 id="usrTitle" class="mb-3 text-lg font-bold">Utenti</h2>
    <ErrorText id="usrError" :message="error" />
    <ul class="space-y-2">
      <li v-for="u in users" :key="u.id" class="card flex flex-wrap items-center justify-between gap-2 !py-2">
        <span>{{ u.nickname }} · {{ credits(u.credits) }} crediti <strong v-if="u.suspended">· Sospeso</strong></span>
        <button type="button" class="chip" @click="toggle(u)">{{ u.suspended ? 'Riattiva' : 'Sospendi' }}</button>
      </li>
    </ul>
  </section>
</template>
