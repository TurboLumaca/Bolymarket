import { chiamaApi } from "../data.js";
import { giorno } from "../formato.js";
import { sessione } from "../autenticazione.js";

export const DashboardGestore = {
    data() {
        return { dati: null, errore: "" };
    },
    computed: {
        utente() {
            return sessione.utente;
        },
        autorizzato() {
            return this.utente && this.utente.role === "gestore";
        },
        massimoUtenti() {
            const lista = this.dati ? this.dati.activeTradersPerWeek.map(w => w.traders) : [1];
            return Math.max(1, ...lista);
        },
        massimoOperazioni() {
            const lista = this.dati ? this.dati.tradesPerMarket.map(m => m.trades) : [1];
            return Math.max(1, ...lista);
        }
    },
    methods: {
        giorno,
        async carica() {
            if (!this.autorizzato) {
                return;
            }
            try {
                this.dati = await chiamaApi("GET", "/admin/dashboard");
            } catch (e) {
                console.error(e);
                this.errore = e.message;
            }
        }
    },
    watch: {
        // L'utente può arrivare dopo il primo disegno della pagina.
        autorizzato: { immediate: true, handler: "carica" }
    },
    template: `
        <h1 class="titolo-pagina">Dashboard del gestore</h1>
        <p v-if="!autorizzato">Questa pagina è riservata al gestore.</p>
        <p v-else-if="errore" role="alert" class="testo-errore">Errore: {{ errore }}</p>
        <div v-else-if="dati" class="pila-grande">
            <dl class="riepilogo">
                <div class="scheda"><dt class="testo-piccolo attenuato">Proposte approvate / inviate</dt><dd class="numero-riepilogo">{{ dati.proposals.approved }} / {{ dati.proposals.proposed }}</dd></div>
                <div class="scheda"><dt class="testo-piccolo attenuato">Ore medie da chiusura a risoluzione</dt><dd class="numero-riepilogo">{{ dati.avgHoursClosingToResolution ?? '–' }}</dd></div>
                <div class="scheda"><dt class="testo-piccolo attenuato">Segnalazioni aperte</dt><dd class="numero-riepilogo">{{ dati.openReports }}</dd></div>
            </dl>

            <section aria-labelledby="titoloSettimane" class="scheda">
                <h2 id="titoloSettimane" class="titolo-scheda">Utenti attivi per settimana</h2>
                <ul class="pila-piccola">
                    <li v-for="w in dati.activeTradersPerWeek" :key="w.firstDay" class="riga-barra">
                        <span class="testo-piccolo">Dal {{ giorno(w.firstDay + ' 00:00:00') }}</span>
                        <span class="barra-dati" :style="{ width: (w.traders / massimoUtenti) * 100 + '%' }" aria-hidden="true"></span>
                        <span class="grassetto">{{ w.traders }}</span>
                    </li>
                </ul>
            </section>

            <section aria-labelledby="titoloPerMercato" class="scheda">
                <h2 id="titoloPerMercato" class="titolo-scheda">Operazioni per mercato</h2>
                <ul class="pila-piccola">
                    <li v-for="m in dati.tradesPerMarket" :key="m.id">
                        <p class="testo-piccolo"><router-link :to="'/mercati/' + m.id">{{ m.question }}</router-link> · <strong>{{ m.trades }}</strong></p>
                        <span class="barra-dati blocco" :style="{ width: (m.trades / massimoOperazioni) * 100 + '%' }" aria-hidden="true"></span>
                    </li>
                </ul>
            </section>
        </div>
        <p v-else role="status" class="attenuato">Caricamento…</p>
    `
};
