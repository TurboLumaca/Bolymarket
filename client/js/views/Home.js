import { chiamaApi } from "../data.js";
import { SchedaMercato } from "../components/SchedaMercato.js";
import { Carosello } from "../components/Carosello.js";
import { BarraLaterale } from "../components/BarraLaterale.js";

const stati = [["open", "Aperti"], ["closed", "Chiusi"], ["resolved", "Risolti"], ["voided", "Annullati"]];

function perScambi(a, b) {
    return b.tradeCount - a.tradeCount;
}

function variazione(m) {
    return m.trend && m.trend.length > 1 ? Math.round((m.trend[m.trend.length - 1] - m.trend[0]) * 100) : 0;
}

export const Home = {
    components: { SchedaMercato, Carosello, BarraLaterale },
    data() {
        return {
            stati,
            mercati: [],
            mercatiAperti: [], // tutti i mercati aperti, per la scheda in evidenza e gli elenchi laterali
            caricamento: true,
            errore: ""
        };
    },
    computed: {
        // I filtri vivono nell'indirizzo: ?status=...&category=...&q=...
        stato() {
            return String(this.$route.query.status || "open");
        },
        categoria() {
            return String(this.$route.query.category || "");
        },
        ricerca() {
            return String(this.$route.query.q || "");
        },
        inEvidenza() {
            return [...this.mercatiAperti].sort(perScambi).slice(0, 3);
        },
        piuScambiati() {
            return [...this.mercatiAperti].sort(perScambi).slice(0, 5);
        },
        piuMossi() {
            return this.mercatiAperti
                .map(m => ({ ...m, change: variazione(m) }))
                .filter(m => m.change !== 0)
                .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                .slice(0, 5);
        }
    },
    watch: {
        "$route.query": { immediate: true, handler: "carica" }
    },
    methods: {
        async carica() {
            this.caricamento = true;
            this.errore = "";
            try {
                const parametri = new URLSearchParams({
                    status: this.stato, category: this.categoria, q: this.ricerca
                });
                this.mercati = await chiamaApi("GET", "/markets?" + parametri);
            } catch (e) {
                console.error(e);
                this.errore = e.message;
            }
            this.caricamento = false;
        },
        impostaStato(valore) {
            const query = { ...this.$route.query };
            if (valore === "open") {
                delete query.status;
            } else {
                query.status = valore;
            }
            this.$router.replace({ path: "/", query });
        }
    },
    async mounted() {
        try {
            this.mercatiAperti = await chiamaApi("GET", "/markets?status=open");
        } catch (e) {
            console.error(e); // gli elenchi laterali restano vuoti
        }
    },
    template: `
        <div class="layout-home">
            <div class="pila-grande colonna-principale">
                <h1 class="titolo-pagina">Mercati del campus</h1>
                <carosello v-if="inEvidenza.length" :mercati="inEvidenza"></carosello>

                <section aria-labelledby="titoloLista" class="pila-piccola">
                    <div class="testata-lista">
                        <h2 id="titoloLista" class="titolo-lista">
                            {{ categoria || 'Tutti i mercati' }}<span v-if="ricerca" class="attenuato normale"> · «{{ ricerca }}»</span>
                        </h2>
                        <div role="group" aria-label="Stato del mercato" class="gruppo-chip">
                            <button v-for="[valore, etichetta] in stati" :key="valore" type="button" class="chip"
                                :aria-pressed="stato === valore" @click="impostaStato(valore)">
                                {{ etichetta }}
                            </button>
                        </div>
                    </div>
                    <p v-if="errore" role="alert" class="testo-errore">Errore: {{ errore }}</p>
                    <p v-else-if="caricamento" role="status" class="attenuato">Caricamento…</p>
                    <p v-else-if="!mercati.length" role="status" class="attenuato">Nessun mercato trovato.</p>
                    <ul v-else class="griglia-mercati">
                        <li v-for="mercato in mercati" :key="mercato.id"><scheda-mercato :mercato="mercato"></scheda-mercato></li>
                    </ul>
                </section>
            </div>

            <aside aria-label="In breve" class="colonna-laterale">
                <barra-laterale :mossi="piuMossi" :scambiati="piuScambiati"></barra-laterale>
            </aside>
        </div>
    `
};
