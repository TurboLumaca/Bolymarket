import { chiamaApi } from "../data.js";
import { crediti, etichetteStato } from "../formato.js";
import { sessione } from "../autenticazione.js";

export const Portafoglio = {
    data() {
        return { dati: null, errore: "", etichetteStato };
    },
    computed: {
        utente() {
            return sessione.utente;
        }
    },
    methods: {
        crediti,
        segno(n) {
            return (n > 0 ? "+" : "") + crediti(n);
        }
    },
    async mounted() {
        try {
            this.dati = await chiamaApi("GET", "/portfolio");
        } catch (e) {
            console.error(e);
            this.errore = e.message;
        }
    },
    template: `
        <h1 class="titolo-pagina">Il mio portafoglio</h1>
        <p v-if="!utente">Devi <router-link to="/accedi">accedere</router-link> per vedere il portafoglio.</p>
        <p v-else-if="errore" role="alert" class="testo-errore">Errore: {{ errore }}</p>
        <template v-else-if="dati">
            <dl class="riepilogo">
                <div class="scheda"><dt class="testo-piccolo attenuato">Crediti disponibili</dt><dd class="numero-riepilogo">{{ crediti(dati.credits) }}</dd></div>
                <div class="scheda"><dt class="testo-piccolo attenuato">Valore delle quote aperte</dt><dd class="numero-riepilogo">{{ crediti(dati.openValue) }}</dd></div>
                <div class="scheda"><dt class="testo-piccolo attenuato">Profitto / perdita</dt><dd class="numero-riepilogo">{{ segno(dati.profit) }}</dd></div>
            </dl>
            <p v-if="!dati.positions.length" class="attenuato">Non hai ancora quote. <router-link to="/">Vai ai mercati</router-link>.</p>
            <ul class="griglia-posizioni">
                <li v-for="p in dati.positions" :key="p.marketId" class="scheda pila-minima">
                    <p class="grassetto"><router-link :to="'/mercati/' + p.marketId">{{ p.question }}</router-link></p>
                    <p class="testo-piccolo attenuato">
                        {{ etichetteStato[p.status] }}<template v-if="p.outcome"> · esito {{ p.outcome === 'yes' ? 'Sì' : 'No' }}</template>
                    </p>
                    <p>Quote: {{ p.sharesYes }} Sì, {{ p.sharesNo }} No</p>
                    <p>Investito: {{ crediti(p.costBasis) }} · Valore: {{ crediti(p.value) }}</p>
                    <p class="forte">Profitto / perdita: {{ segno(p.profit) }}</p>
                </li>
            </ul>
        </template>
        <p v-else role="status" class="attenuato">Caricamento…</p>
    `
};
