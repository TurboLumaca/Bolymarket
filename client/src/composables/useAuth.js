import { ref } from 'vue';
import { api } from '../api';

const user = ref(null);
const loaded = ref(false);

export function useAuth() {
  async function loadUser() {
    user.value = await api('GET', '/me');
    loaded.value = true;
  }
  async function login(email, password) {
    user.value = await api('POST', '/auth/login', { email, password });
  }
  async function register(form) {
    user.value = await api('POST', '/auth/register', form);
  }
  async function logout() {
    await api('POST', '/auth/logout');
    user.value = null;
  }
  async function deleteAccount(password) {
    await api('DELETE', '/me', { password });
    user.value = null;
  }
  return { user, loaded, loadUser, login, register, logout, deleteAccount };
}
