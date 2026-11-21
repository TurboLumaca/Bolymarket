<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ErrorText from '../components/ErrorText.vue';
import { useAuth } from '../composables/useAuth';

const { register } = useAuth();
const router = useRouter();
const form = ref({ nickname: '', email: '', password: '', consent: false });
const error = ref('');

async function submit() {
  error.value = '';
  try {
    await register(form.value);
    router.push('/');
  } catch (e) {
    error.value = e.message;
  }
}
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Registrati</h1>
  <form class="card max-w-md space-y-4" @submit.prevent="submit" novalidate>
    <div>
      <label for="nickname" class="mb-1 block font-semibold">Nickname pubblico</label>
      <input id="nickname" v-model="form.nickname" autocomplete="nickname" class="input" required aria-describedby="nicknameHelp" />
      <p id="nicknameHelp" class="mt-1 text-sm text-muted">3-20 caratteri. È l'unico nome che gli altri vedranno.</p>
    </div>
    <div>
      <label for="email" class="mb-1 block font-semibold">Email universitaria</label>
      <input id="email" v-model="form.email" type="email" autocomplete="email" class="input" required />
    </div>
    <div>
      <label for="password" class="mb-1 block font-semibold">Password (almeno 8 caratteri)</label>
      <input id="password" v-model="form.password" type="password" autocomplete="new-password" class="input" required />
    </div>
    <div class="flex items-start gap-3">
      <input id="consent" v-model="form.consent" type="checkbox" class="mt-1 h-6 w-6 shrink-0" />
      <label for="consent">Ho letto l'<RouterLink to="/privacy">informativa sulla privacy</RouterLink> e acconsento al trattamento dei dati.</label>
    </div>
    <ErrorText id="registerError" :message="error" />
    <button type="submit" class="btn w-full">Crea account</button>
  </form>
</template>
