<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SideIcon from './SideIcon.vue';
import ErrorText from './ErrorText.vue';
import { api } from '../api';
import { credits, percent } from '../format';
import { useAuth } from '../composables/useAuth';

const props = defineProps({ market: Object });
const emit = defineEmits(['traded']);
const route = useRoute();
const { user, loadUser } = useAuth();

const side = ref(route.query.side === 'no' ? 'no' : 'yes');
const action = ref('buy');
const shares = ref('10');
const error = ref('');
const preview = ref(null);
const announcement = ref('');
const busy = ref(false);
let timer = null;

const canTrade = computed(() => props.market.status === 'open' && user.value);
const held = computed(() => {
  const p = props.market.myPosition;
  return p ? (side.value === 'yes' ? p.sharesYes : p.sharesNo) : 0;
});

async function updatePreview() {
  preview.value = null;
  announcement.value = '';
  error.value = '';
  if (!canTrade.value || !/^\d+$/.test(shares.value)) {
    if (shares.value !== '') error.value = 'Inserisci un numero intero di quote.';
    return;
  }
  try {
    preview.value = await api('POST', `/markets/${props.market.id}/preview`, {
      side: side.value, action: action.value, shares: Number(shares.value),
    });
    const verb = action.value === 'buy' ? 'Costo' : 'Incasso';
    announcement.value = `${verb}: ${credits(preview.value.credits)} crediti. Probabilità del Sì dopo l'operazione: ${percent(preview.value.priceYesAfter)}.`;
  } catch (e) {
    error.value = e.message;
  }
}

// The preview is announced only after the user stops typing.
function schedulePreview() {
  clearTimeout(timer);
  preview.value = null;
  announcement.value = '';
  timer = setTimeout(updatePreview, 600);
}

async function submit() {
  busy.value = true;
  error.value = '';
  try {
    const result = await api('POST', `/markets/${props.market.id}/trades`, {
      side: side.value, action: action.value, shares: Number(shares.value),
    });
    announcement.value = `Operazione eseguita: ${credits(result.credits)} crediti.`;
    await loadUser();
    emit('traded');
    preview.value = null;
  } catch (e) {
    error.value = e.message;
  }
  busy.value = false;
}

watch([side, action, shares], schedulePreview);
onMounted(updatePreview);
</script>

<template>
  <section aria-labelledby="tradeTitle" class="card space-y-4">
    <h2 id="tradeTitle" class="text-lg font-bold">Opera su questo mercato</h2>

    <p v-if="market.status !== 'open'">Questo mercato non accetta più operazioni.</p>
    <p v-else-if="!user">
      <RouterLink to="/accedi">Accedi</RouterLink> o <RouterLink to="/registrati">registrati</RouterLink> per operare.
    </p>

    <form v-else class="space-y-4" novalidate @submit.prevent="submit">
      <fieldset>
        <legend class="mb-1 font-semibold">Scegli</legend>
        <div class="grid grid-cols-2 gap-3">
          <label class="side-pill side-yes cursor-pointer has-[:checked]:bg-yes has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
            <input v-model="side" type="radio" name="side" value="yes" class="sr-only" /> <SideIcon side="yes" /> Sì
          </label>
          <label class="side-pill side-no cursor-pointer has-[:checked]:bg-no has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
            <input v-model="side" type="radio" name="side" value="no" class="sr-only" /> <SideIcon side="no" /> No
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-1 font-semibold">Operazione</legend>
        <div class="flex gap-4">
          <label class="flex min-h-[44px] items-center gap-2"><input v-model="action" type="radio" name="action" value="buy" class="h-5 w-5" /> Compra</label>
          <label class="flex min-h-[44px] items-center gap-2"><input v-model="action" type="radio" name="action" value="sell" class="h-5 w-5" /> Vendi</label>
        </div>
      </fieldset>

      <div>
        <label for="shares" class="mb-1 block font-semibold">Numero di quote</label>
        <input id="shares" v-model="shares" inputmode="numeric" autocomplete="off" class="input"
          :aria-invalid="error ? 'true' : undefined" aria-describedby="sharesHelp sharesError" />
        <p id="sharesHelp" class="mt-1 text-sm text-muted">Da 1 a 200. Ogni quota vincente paga 1 credito.
          <span v-if="action === 'sell'">Ne possiedi {{ held }}.</span></p>
        <ErrorText id="sharesError" :message="error" />
      </div>

      <div class="rounded-lg border border-line p-3" aria-hidden="false">
        <p v-if="preview"><strong>{{ action === 'buy' ? 'Costo' : 'Incasso' }}: {{ credits(preview.credits) }} crediti</strong></p>
        <p v-if="preview" class="text-sm text-muted">Probabilità del Sì dopo: {{ percent(preview.priceYesAfter) }}</p>
        <p v-else class="text-sm text-muted">Il costo apparirà qui.</p>
      </div>
      <div class="sr-only" role="status" aria-live="polite">{{ announcement }}</div>

      <button type="submit" class="btn w-full" :disabled="busy || !preview">
        Conferma {{ action === 'buy' ? 'acquisto' : 'vendita' }}
      </button>
    </form>
  </section>
</template>
