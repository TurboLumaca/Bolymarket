<script setup>
import { ref } from 'vue';
import ErrorText from './ErrorText.vue';
import { api } from '../api';

const props = defineProps({ marketId: Number });
const open = ref(false);
const reason = ref('');
const error = ref('');
const done = ref(false);

async function submit() {
  error.value = '';
  try {
    await api('POST', `/markets/${props.marketId}/reports`, { reason: reason.value });
    done.value = true;
    open.value = false;
  } catch (e) {
    error.value = e.message;
  }
}
</script>

<template>
  <div>
    <p v-if="done" role="status" class="font-semibold text-yes">Segnalazione inviata, grazie.</p>
    <button v-else-if="!open" type="button" class="chip" @click="open = true">Segnala questo mercato</button>
    <form v-else class="card space-y-3" novalidate @submit.prevent="submit">
      <label for="reportReason" class="block font-semibold">Perché segnali questo mercato?</label>
      <textarea id="reportReason" v-model="reason" rows="3" class="input py-2" maxlength="300" aria-describedby="reportError"></textarea>
      <ErrorText id="reportError" :message="error" />
      <div class="flex gap-3">
        <button type="submit" class="btn">Invia</button>
        <button type="button" class="chip" @click="open = false">Annulla</button>
      </div>
    </form>
  </div>
</template>
