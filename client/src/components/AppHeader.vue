<script setup>
import { useRouter } from 'vue-router';
import Logo from './Logo.vue';
import { useAuth } from '../composables/useAuth';
import { credits } from '../format';

const { user, logout } = useAuth();
const router = useRouter();

async function onLogout() {
  await logout();
  router.push('/');
}
</script>

<template>
  <header class="border-b border-line">
    <nav aria-label="Principale" class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <RouterLink to="/" class="flex items-center gap-2 font-bold text-ink no-underline">
        <Logo /> Oracolo del Campus
      </RouterLink>
      <RouterLink to="/classifica" class="inline-flex min-h-[44px] items-center">Classifica</RouterLink>
      <RouterLink v-if="user" to="/portafoglio" class="inline-flex min-h-[44px] items-center">Portafoglio</RouterLink>
      <RouterLink to="/proponi" class="inline-flex min-h-[44px] items-center">Proponi</RouterLink>
      <RouterLink v-if="user && user.role === 'gestore'" to="/gestore" class="inline-flex min-h-[44px] items-center">Gestore</RouterLink>
      <span class="flex-1"></span>
      <template v-if="user">
        <span class="text-sm">{{ user.nickname }} · <strong>{{ credits(user.credits) }}</strong> crediti</span>
        <button type="button" class="btn bg-surface !text-ink border border-line" @click="onLogout">Esci</button>
      </template>
      <template v-else>
        <RouterLink to="/accedi" class="inline-flex min-h-[44px] items-center">Accedi</RouterLink>
        <RouterLink to="/registrati" class="btn">Registrati</RouterLink>
      </template>
    </nav>
  </header>
</template>
