import { annuncia } from "./annunci.js";
import { Home } from "./views/Home.js";
import { Mercato } from "./views/Mercato.js";
import { Proponi } from "./views/Proponi.js";
import { Gestore } from "./views/Gestore.js";
import { DashboardGestore } from "./views/DashboardGestore.js";
import { Portafoglio } from "./views/Portafoglio.js";
import { Classifica } from "./views/Classifica.js";
import { Login } from "./views/Login.js";
import { Registrazione } from "./views/Registrazione.js";
import { Privacy } from "./views/Privacy.js";
import { NonTrovata } from "./views/NonTrovata.js";
const { createRouter, createWebHashHistory } = VueRouter;
export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: "/", component: Home, meta: { titolo: "Mercati" } },
        { path: "/mercati/:id([1-9]\\d*)", component: Mercato, props: true, meta: { titolo: "Mercato" } },
        { path: "/proponi", component: Proponi, meta: { titolo: "Proponi un mercato" } },
        { path: "/gestore", component: Gestore, meta: { titolo: "Area del gestore" } },
        { path: "/gestore/dashboard", component: DashboardGestore, meta: { titolo: "Dashboard del gestore" } },
        { path: "/portafoglio", component: Portafoglio, meta: { titolo: "Il mio portafoglio" } },
        { path: "/classifica", component: Classifica, meta: { titolo: "Classifica" } },
        { path: "/accedi", component: Login, meta: { titolo: "Accedi" } },
        { path: "/registrati", component: Registrazione, meta: { titolo: "Registrati" } },
        { path: "/privacy", component: Privacy, meta: { titolo: "Privacy" } },
        { path: "/:pathMatch(.*)*", component: NonTrovata, meta: { titolo: "Pagina non trovata" } }
    ]
});

// A ogni cambio di pagina: aggiorna il titolo, lo annuncia e sposta il focus sull'h1.
router.afterEach(async (to, from) => {
    // Se cambia solo la query (ricerca, filtri) il focus resta dov'è.
    if (to.path === from.path) {
        return;
    }

    const titolo = to.meta.titolo + " · Bolymarket";
    document.title = titolo;

    await Vue.nextTick();
    const intestazione = document.querySelector("h1");
    if (intestazione) {
        intestazione.setAttribute("tabindex", "-1");
        intestazione.focus();
    }
    annuncia(titolo);
});
