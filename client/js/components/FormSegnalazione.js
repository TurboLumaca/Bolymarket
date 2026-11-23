import { chiamaApi } from "../data.js";
import { TestoErrore } from "./TestoErrore.js";

export const FormSegnalazione = {
    components: { TestoErrore },
    props: { idMercato: Number },
    data() {
        return { aperto: false, motivo: "", errore: "", inviata: false };
    },
    methods: {
        async invia() {
            this.errore = "";
            try {
                await chiamaApi("POST", "/markets/" + this.idMercato + "/reports", { reason: this.motivo });
                this.inviata = true;
                this.aperto = false;
            } catch (e) {
                this.errore = e.message;
            }
        }
    },
    template: `
        <div>
            <p v-if="inviata" role="status" class="conferma-testo">Segnalazione inviata, grazie.</p>
            <button v-else-if="!aperto" type="button" class="chip" @click="aperto = true">Segnala questo mercato</button>
            <form v-else class="scheda pila-piccola" novalidate @submit.prevent="invia">
                <label for="motivoSegnalazione" class="etichetta">Perché segnali questo mercato?</label>
                <textarea id="motivoSegnalazione" v-model="motivo" rows="3" class="campo" maxlength="300"
                    aria-describedby="erroreSegnalazione"></textarea>
                <testo-errore id="erroreSegnalazione" :messaggio="errore"></testo-errore>
                <div class="gruppo-chip">
                    <button type="submit" class="pulsante">Invia</button>
                    <button type="button" class="chip" @click="aperto = false">Annulla</button>
                </div>
            </form>
        </div>
    `
};
