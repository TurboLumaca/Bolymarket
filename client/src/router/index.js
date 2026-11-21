import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';
import { useAnnouncer } from '../composables/useAnnouncer';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: 'Mercati' } },
  { path: '/mercati/:id', name: 'market', component: () => import('../views/MarketView.vue'), meta: { title: 'Mercato' } },
  { path: '/proponi', name: 'propose', component: () => import('../views/ProposeView.vue'), meta: { title: 'Proponi un mercato' } },
  { path: '/gestore', name: 'admin', component: () => import('../views/AdminView.vue'), meta: { title: 'Area del gestore' } },
  { path: '/portafoglio', name: 'portfolio', component: () => import('../views/PortfolioView.vue'), meta: { title: 'Il mio portafoglio' } },
  { path: '/classifica', name: 'leaderboard', component: () => import('../views/LeaderboardView.vue'), meta: { title: 'Classifica' } },
  { path: '/gestore/dashboard', name: 'dashboard', component: () => import('../views/AdminDashboardView.vue'), meta: { title: 'Dashboard del gestore' } },
  { path: '/accedi', name: 'login', component: () => import('../views/LoginView.vue'), meta: { title: 'Accedi' } },
  { path: '/registrati', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { title: 'Registrati' } },
  { path: '/privacy', name: 'privacy', component: () => import('../views/PrivacyView.vue'), meta: { title: 'Privacy' } },
  { path: '/:rest(.*)', name: 'notFound', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Pagina non trovata' } },
];

const router = createRouter({ history: createWebHistory(), routes });

// On every route change: set the title, announce it, move focus to the h1.
router.afterEach(async (to, from) => {
  // Only the query changed (search, filters): keep the focus where it is.
  if (to.path === from.path) return;
  const title = `${to.meta.title} · Bolymarket`;
  document.title = title;
  await nextTick();
  const heading = document.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
  useAnnouncer().announce(title);
});

export default router;
