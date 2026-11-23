import { chiamaApi } from "../data.js";
import { crediti } from "../formato.js";
import { TestoErrore } from "./TestoErrore.js";

export const AdminUtenti = {
    components: { TestoErrore },
    data() {
        return { utenti: [], errore: "" };
    },
    methods: {
        crediti,
        async carica() {
            this.utenti = await chiamaApi("GET", "/admin/users");
        },
        async alterna(u) {
            this.errore = "";
            try {
                await chiamaApi("POST", "/admin/users/" + u.id + "/suspend", { suspended: !u.suspended });
                await this.carica();
            } catch (e) {
                this.errore = e.message;
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
        <section aria-labelledby="titoloUtenti">
            <h2 id="titoloUtenti" class="titolo-sezione">Utenti</h2>
            <testo-errore id="erroreUtenti" :messaggio="errore"></testo-errore>
            <ul class="elenco-schede-verticale compatto">
                <li v-for="u in utenti" :key="u.id" class="scheda riga-utente">
                    <span>{{ u.nickname }} · {{ crediti(u.credits) }} crediti <strong v-if="u.suspended">· Sospeso</strong></span>
                    <button type="button" class="chip" @click="alterna(u)">{{ u.suspended ? 'Riattiva' : 'Sospendi' }}</button>
                </li>
            </ul>
        </section>
    `
};
