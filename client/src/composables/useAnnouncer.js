import { ref } from 'vue';

const message = ref('');

// Text placed in the aria-live region of App.vue.
export function useAnnouncer() {
  function announce(text) {
    message.value = '';
    setTimeout(() => (message.value = text), 50);
  }
  return { message, announce };
}
