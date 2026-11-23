import { chiamaApi } from "../data.js";
import { crediti } from "../formato.js";
import { sessione, esci } from "../autenticazione.js";
import { Logo } from "./Logo.js";

export const IntestazioneApp = {
    components: { Logo },
    data() {
        return {
            categorie: [],
            termine: String(this.$route.query.q || ""),
            timer: null
        };
    },
    computed: {
        utente() {
            return sessione.utente;
        },
        schede() {
            return ["", ...this.categorie];
        }
    },
    watch: {
        // Tiene il campo di ricerca allineato all'indirizzo (tasto indietro, schede delle categorie).
        "$route.query.q"(q) {
            this.termine = String(q || "");
        }
    },
    methods: {
        crediti,
        // La ricerca vive nell'indirizzo (?q=), così la home deve solo leggerlo.
        cerca() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                const query = this.$route.path === "/" ? { ...this.$route.query } : {};
                if (this.termine.trim()) {
                    query.q = this.termine.trim();
                } else {
                    delete query.q;
                }
                this.$router.replace({ path: "/", query });
            }, 300);
        },
        verso(nome) {
            return { path: "/", query: nome ? { category: nome } : {} };
        },
        attiva(nome) {
            return this.$route.path === "/" && (this.$route.query.category || "") === nome;
        },
        scorri() {
            this.$refs.riga.scrollBy({ left: 200, behavior: "smooth" });
        },
        async uscita() {
            await esci();
            this.$router.push("/");
        }
    },
    async mounted() {
        try {
            this.categorie = await chiamaApi("GET", "/categories");
        } catch (e) {
            console.error(e);
        }
    },
    template: `
        <header class="intestazione">
            <div class="contenitore riga-alta">
                <router-link to="/" class="marchio"><logo></logo> Bolymarket</router-link>

                <form role="search" class="ricerca" @submit.prevent="cerca">
                    <label for="ricerca" class="solo-lettori">Cerca mercati</label>
                    <input id="ricerca" v-model="termine" type="search" class="campo campo-tondo"
                        placeholder="Cerca mercati" autocomplete="off" @input="cerca" />
                </form>

                <div class="account">
                    <template v-if="utente">
                        <span class="testo-piccolo">{{ utente.nickname }} · <strong>{{ crediti(utente.credits) }}</strong> crediti</span>
                        <button type="button" class="pulsante pulsante-secondario" @click="uscita">Esci</button>
                    </template>
                    <template v-else>
                        <router-link to="/accedi" class="link-alto">Accedi</router-link>
                        <router-link to="/registrati" class="pulsante">Registrati</router-link>
                    </template>
                </div>
            </div>

            <div class="contenitore riga-schede">
                <div ref="riga" class="schede-scorrevoli">
                    <nav aria-label="Categorie" class="non-si-riduce">
                        <ul class="elenco-schede">
                            <li v-for="nome in schede" :key="nome">
                                <router-link custom :to="verso(nome)" v-slot="{ href, navigate }">
                                    <a :href="href" class="scheda-tab" :aria-current="attiva(nome) ? 'true' : undefined"
                                        @click="navigate">{{ nome || 'Tendenze' }}</a>
                                </router-link>
                            </li>
                        </ul>
                    </nav>
                    <span class="separatore" aria-hidden="true"></span>
                    <nav aria-label="Principale" class="elenco-schede non-si-riduce">
                        <router-link to="/classifica" class="scheda-tab">Classifica</router-link>
                        <router-link v-if="utente" to="/portafoglio" class="scheda-tab">Portafoglio</router-link>
                        <router-link to="/proponi" class="scheda-tab">Proponi</router-link>
                        <router-link v-if="utente && utente.role === 'gestore'" to="/gestore" class="scheda-tab">Gestore</router-link>
                    </nav>
                </div>
                <button type="button" class="freccia-schede" aria-label="Scorri le schede a destra" @click="scorri">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
                </button>
            </div>
        </header>
    `
};
