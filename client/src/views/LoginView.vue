<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ErrorText from '../components/ErrorText.vue';
import { useAuth } from '../composables/useAuth';

const { login } = useAuth();
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');

async function submit() {
  error.value = '';
  try {
    await login(email.value, password.value);
    router.push('/');
  } catch (e) {
    error.value = e.message;
  }
}
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Accedi</h1>
  <form class="card max-w-md space-y-4" @submit.prevent="submit" novalidate>
    <div>
      <label for="email" class="mb-1 block font-semibold">Email universitaria</label>
      <input id="email" v-model="email" type="email" autocomplete="email" class="input" required
             :aria-describedby="error ? 'loginError' : undefined" :aria-invalid="error ? 'true' : undefined" />
    </div>
    <div>
      <label for="password" class="mb-1 block font-semibold">Password</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" class="input" required />
    </div>
    <ErrorText id="loginError" :message="error" />
    <button type="submit" class="btn w-full">Accedi</button>
    <p class="text-sm">Non hai un account? <RouterLink to="/registrati">Registrati</RouterLink></p>
  </form>
</template>
