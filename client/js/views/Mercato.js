import { chiamaApi } from "../data.js";
import { giorno, etichetteStato } from "../formato.js";
import { sessione } from "../autenticazione.js";
import { BarraProbabilita } from "../components/BarraProbabilita.js";
import { GraficoPrezzo } from "../components/GraficoPrezzo.js";
import { PannelloOperazioni } from "../components/PannelloOperazioni.js";
import { FormSegnalazione } from "../components/FormSegnalazione.js";

export const Mercato = {
    components: { BarraProbabilita, GraficoPrezzo, PannelloOperazioni, FormSegnalazione },
    props: ["id"],
    data() {
        return {
            mercato: null,
            errore: "",
            schermoGrande: false,
            queryMedia: null,
            etichetteStato
        };
    },
    computed: {
        utente() {
            return sessione.utente;
        },
        segnalabile() {
            return this.utente && ["open", "closed", "resolved"].includes(this.mercato.status);
        },
        miePosizioni() {
            const p = this.mercato.myPosition;
            return this.utente && p && (p.sharesYes || p.sharesNo) ? p : null;
        }
    },
    watch: {
        id: { immediate: true, handler: "carica" },
        utente: "carica"
    },
    methods: {
        giorno,
        async carica() {
            const id = this.id;
            this.errore = "";
            try {
                const mercato = await chiamaApi("GET", "/markets/" + id);
                if (this.id === id) {
                    this.mercato = mercato;
                }
            } catch (e) {
                console.error(e);
                if (this.id === id) {
                    this.errore = e.message;
                }
            }
        },
        async dopoOperazione() {
            await this.carica();
            if (this.$refs.foglio) {
                this.$refs.foglio.close();
            }
        },
        aggiornaSchermo(evento) {
            this.schermoGrande = evento.matches;
        }
    },
    mounted() {
        // Vero dal breakpoint md (768px) in su.
        this.queryMedia = window.matchMedia("(min-width: 768px)");
        this.schermoGrande = this.queryMedia.matches;
        this.queryMedia.addEventListener("change", this.aggiornaSchermo);
    },
    beforeUnmount() {
        this.queryMedia.removeEventListener("change", this.aggiornaSchermo);
    },
    template: `
        <p v-if="errore" role="alert" class="testo-errore">Errore: {{ errore }}</p>
        <template v-else-if="mercato">
            <div class="layout-mercato">
                <div class="pila">
                    <p class="testo-piccolo attenuato">{{ mercato.category }} · {{ etichetteStato[mercato.status] }}</p>
                    <h1 class="titolo-pagina">{{ mercato.question }}</h1>
                    <barra-probabilita :prezzo-si="mercato.priceYes" grande></barra-probabilita>
                    <p v-if="mercato.status === 'resolved'" class="scheda grassetto">
                        Risolto: {{ mercato.outcome === 'yes' ? 'Sì' : 'No' }}. Prova: {{ mercato.resolutionEvidence }}
                    </p>
                    <p v-if="mercato.status === 'voided'" class="scheda grassetto">Mercato annullato: le operazioni sono state rimborsate.</p>
                    <grafico-prezzo :storico="mercato.history"></grafico-prezzo>
                    <section class="scheda" aria-labelledby="titoloRegola">
                        <h2 id="titoloRegola" class="titolo-scheda">Regola di risoluzione</h2>
                        <p>{{ mercato.resolutionRule }}</p>
                        <p class="testo-piccolo attenuato spazio-sopra">Chiusura: {{ giorno(mercato.closesAt) }}</p>
                    </section>
                    <form-segnalazione v-if="segnalabile" :id-mercato="mercato.id"></form-segnalazione>
                    <p v-if="miePosizioni" class="testo-piccolo">
                        Le tue quote: {{ miePosizioni.sharesYes }} Sì, {{ miePosizioni.sharesNo }} No.
                    </p>
                </div>

                <aside v-if="schermoGrande" class="pannello-fisso" aria-label="Pannello operazioni">
                    <pannello-operazioni :mercato="mercato" @operato="dopoOperazione"></pannello-operazioni>
                </aside>
            </div>

            <template v-if="!schermoGrande">
                <div class="barra-operazioni">
                    <button type="button" class="pulsante pieno" @click="$refs.foglio.showModal()">Opera su questo mercato</button>
                </div>
                <dialog ref="foglio" class="foglio" aria-label="Operazioni">
                    <div class="contenuto-foglio pila-piccola">
                        <pannello-operazioni :mercato="mercato" @operato="dopoOperazione"></pannello-operazioni>
                        <button type="button" class="pulsante pulsante-secondario pieno" @click="$refs.foglio.close()">Chiudi</button>
                    </div>
                </dialog>
            </template>
        </template>
        <p v-else role="status" class="attenuato">Caricamento…</p>
    `
};
