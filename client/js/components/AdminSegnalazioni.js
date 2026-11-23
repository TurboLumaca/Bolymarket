import { chiamaApi } from "../data.js";
import { dataOra } from "../formato.js";
import { TestoErrore } from "./TestoErrore.js";

export const AdminSegnalazioni = {
    components: { TestoErrore },
    data() {
        return { segnalazioni: [], errore: "" };
    },
    methods: {
        dataOra,
        async carica() {
            this.segnalazioni = await chiamaApi("GET", "/admin/reports");
        },
        async esegui(operazione) {
            this.errore = "";
            try {
                await operazione;
                await this.carica();
            } catch (e) {
                this.errore = e.message;
            }
        },
        archivia(s) {
            this.esegui(chiamaApi("POST", "/admin/reports/" + s.id + "/close", {}));
        },
        nascondiMercato(s) {
            this.esegui(
                chiamaApi("POST", "/admin/markets/" + s.marketId + "/hide", {})
                    .then(() => chiamaApi("POST", "/admin/reports/" + s.id + "/close", {}))
            );
        },
        puoNascondere(s) {
            return !["resolved", "voided", "hidden"].includes(s.marketStatus);
        }
    },
    async mounted() {
        try {
            await this.carica();
        } catch (e) {
            this.errore = e.message;
        }
    },
    template: `
        <section aria-labelledby="titoloSegnalazioni">
            <h2 id="titoloSegnalazioni" class="titolo-sezione">Segnalazioni aperte</h2>
            <testo-errore id="erroreSegnalazioni" :messaggio="errore"></testo-errore>
            <p v-if="!segnalazioni.length" class="attenuato">Nessuna segnalazione aperta.</p>
            <ul class="elenco-schede-verticale">
                <li v-for="s in segnalazioni" :key="s.id" class="scheda pila-piccola">
                    <p class="grassetto">{{ s.question }}</p>
                    <p>«{{ s.reason }}» <span class="testo-piccolo attenuato">({{ s.reporter }}, {{ dataOra(s.createdAt) }})</span></p>
                    <div class="gruppo-chip">
                        <button type="button" class="chip" @click="archivia(s)">Archivia</button>
                        <button v-if="puoNascondere(s)" type="button" class="chip" @click="nascondiMercato(s)">Nascondi il mercato</button>
                    </div>
                </li>
            </ul>
        </section>
    `
};
