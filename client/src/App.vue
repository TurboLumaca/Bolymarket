<script setup>
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import FakeCreditsBanner from './components/FakeCreditsBanner.vue';
import { useAuth } from './composables/useAuth';
import ThemeToggle from './components/ThemeToggle.vue';
import { useAnnouncer } from './composables/useAnnouncer';
import { useTheme } from './composables/useTheme';

const { loadUser } = useAuth();
const { message } = useAnnouncer();
useTheme().init();
onMounted(loadUser);
</script>

<template>
  <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:p-3">
    Vai al contenuto
  </a>
  <FakeCreditsBanner />
  <AppHeader />
  <main id="main" class="mx-auto w-full max-w-6xl px-4 py-6">
    <RouterView />
  </main>
  <footer class="mx-auto max-w-6xl space-y-3 px-4 py-6 text-sm text-muted">
    <ThemeToggle />
    <p><RouterLink to="/privacy">Informativa sulla privacy</RouterLink></p>
  </footer>
  <div class="sr-only" role="status" aria-live="polite">{{ message }}</div>
</template>
