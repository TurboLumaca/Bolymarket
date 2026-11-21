import { ref } from 'vue';

const mode = ref('auto'); // 'auto' follows the system, otherwise 'dark' or 'light'

function read() {
  try { return localStorage.getItem('theme') || 'auto'; } catch { return 'auto'; }
}

function apply(value) {
  if (value === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', value);
}

export function useTheme() {
  function init() {
    mode.value = read();
    apply(mode.value);
  }
  function set(value) {
    mode.value = value;
    apply(value);
    try { localStorage.setItem('theme', value); } catch { /* storage may be blocked */ }
  }
  return { mode, init, set };
}
