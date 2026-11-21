import { ref, onMounted, onUnmounted } from 'vue';

// True from the md breakpoint (768px) up.
export function useIsDesktop() {
  const query = window.matchMedia('(min-width: 768px)');
  const isDesktop = ref(query.matches);
  const update = (e) => (isDesktop.value = e.matches);
  onMounted(() => query.addEventListener('change', update));
  onUnmounted(() => query.removeEventListener('change', update));
  return isDesktop;
}
