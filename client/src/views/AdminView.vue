<script setup>
import { ref } from 'vue';
import AdminProposals from '../components/AdminProposals.vue';
import AdminMarkets from '../components/AdminMarkets.vue';
import AdminReports from '../components/AdminReports.vue';
import AdminUsers from '../components/AdminUsers.vue';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();
const tabs = [['proposals', 'Proposte', AdminProposals], ['markets', 'Mercati', AdminMarkets], ['reports', 'Segnalazioni', AdminReports], ['users', 'Utenti', AdminUsers]];
const current = ref('proposals');
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Area del gestore</h1>
  <p v-if="!user || user.role !== 'gestore'">Questa pagina è riservata al gestore.</p>
  <template v-else>
    <p class="mb-3"><RouterLink to="/gestore/dashboard">Vai alla dashboard</RouterLink></p>
    <div role="group" aria-label="Sezioni" class="mb-4 flex flex-wrap gap-2">
      <button v-for="[id, label] in tabs" :key="id" type="button" class="chip" :aria-pressed="current === id" @click="current = id">{{ label }}</button>
    </div>
    <template v-for="[id, , component] in tabs" :key="id">
      <component :is="component" v-if="current === id" />
    </template>
  </template>
</template>
