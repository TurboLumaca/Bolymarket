import { chiamaApi } from "../data.js";
import { giorno, etichetteStato } from "../formato.js";
import { TestoErrore } from "./TestoErrore.js";

export const AdminMercati = {
    components: { TestoErrore },
    data() {
        return { mercati: [], errore: "", prove: {}, etichetteStato };
    },
    methods: {
        giorno,
        async carica() {
            const tutti = await chiamaApi("GET", "/admin/markets");
            this.mercati = tutti.filter(m => ["open", "closed"].includes(m.status));
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
        risolvi(m, esito) {
            this.esegui(chiamaApi("POST", "/admin/markets/" + m.id + "/resolve", {
                outcome: esito,
                evidence: this.prove[m.id] || ""
            }));
        },
        annulla(m) {
            if (confirm("Annullare il mercato? Tutte le operazioni saranno rimborsate al costo.")) {
                this.esegui(chiamaApi("POST", "/admin/markets/" + m.id + "/void", {}));
            }
        },
        nascondi(m) {
            if (confirm("Nascondere questo mercato?")) {
                this.esegui(chiamaApi("POST", "/admin/markets/" + m.id + "/hide", {}));
            }
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
        <section aria-labelledby="titoloMercati">
            <h2 id="titoloMercati" class="titolo-sezione">Mercati aperti e chiusi</h2>
            <testo-errore id="erroreMercati" :messaggio="errore"></testo-errore>
            <ul class="elenco-schede-verticale">
                <li v-for="m in mercati" :key="m.id" class="scheda pila-piccola">
                    <p class="grassetto"><router-link :to="'/mercati/' + m.id">{{ m.question }}</router-link></p>
                    <p class="testo-piccolo attenuato">{{ etichetteStato[m.status] }} · chiusura {{ giorno(m.closesAt) }}</p>
                    <div v-if="m.status === 'closed'">
                        <label :for="'e' + m.id" class="etichetta">Prova della risoluzione (una frase)</label>
                        <input :id="'e' + m.id" v-model="prove[m.id]" class="campo" />
                        <div class="gruppo-chip spazio-sopra">
                            <button type="button" class="pulsante" @click="risolvi(m, 'yes')">Risolvi Sì</button>
                            <button type="button" class="pulsante" @click="risolvi(m, 'no')">Risolvi No</button>
                        </div>
                    </div>
                    <div class="gruppo-chip">
                        <button type="button" class="chip" @click="annulla(m)">Annulla mercato</button>
                        <button type="button" class="chip" @click="nascondi(m)">Nascondi</button>
                    </div>
                </li>
            </ul>
        </section>
    `
};
