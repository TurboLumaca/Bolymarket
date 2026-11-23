import { chiamaApi } from "../data.js";
import { TestoErrore } from "./TestoErrore.js";

export const AdminProposte = {
    components: { TestoErrore },
    data() {
        return { proposte: [], categorie: [], errore: "", motivi: {} };
    },
    methods: {
        async carica() {
            const lista = await chiamaApi("GET", "/admin/markets?status=proposed");
            this.proposte = lista.map(p => ({ ...p, liquidityB: 100 }));
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
        approva(p) {
            this.esegui(chiamaApi("POST", "/admin/markets/" + p.id + "/approve", {
                question: p.question,
                category: p.category,
                resolutionRule: p.resolutionRule,
                liquidityB: Number(p.liquidityB)
            }));
        },
        rifiuta(p) {
            this.esegui(chiamaApi("POST", "/admin/markets/" + p.id + "/reject", { reason: this.motivi[p.id] || "" }));
        }
    },
    async mounted() {
        try {
            this.categorie = await chiamaApi("GET", "/categories");
            await this.carica();
        } catch (e) {
            this.errore = e.message;
        }
    },
    template: `
        <section aria-labelledby="titoloProposte">
            <h2 id="titoloProposte" class="titolo-sezione">Proposte da valutare</h2>
            <testo-errore id="erroreProposte" :messaggio="errore"></testo-errore>
            <p v-if="!proposte.length" class="attenuato">Nessuna proposta in attesa.</p>
            <ul class="elenco-schede-verticale">
                <li v-for="p in proposte" :key="p.id" class="scheda pila-piccola">
                    <p class="testo-piccolo attenuato">Proposta da {{ p.proposerNickname || 'utente eliminato' }}</p>
                    <div>
                        <label :for="'q' + p.id" class="etichetta">Domanda</label>
                        <input :id="'q' + p.id" v-model="p.question" class="campo" />
                    </div>
                    <div>
                        <label :for="'r' + p.id" class="etichetta">Regola di risoluzione</label>
                        <textarea :id="'r' + p.id" v-model="p.resolutionRule" rows="3" class="campo"></textarea>
                    </div>
                    <div class="due-colonne">
                        <div>
                            <label :for="'c' + p.id" class="etichetta">Categoria</label>
                            <select :id="'c' + p.id" v-model="p.category" class="campo">
                                <option v-for="c in categorie" :key="c">{{ c }}</option>
                            </select>
                        </div>
                        <div>
                            <label :for="'b' + p.id" class="etichetta">Liquidità (b)</label>
                            <input :id="'b' + p.id" v-model="p.liquidityB" inputmode="numeric" class="campo" />
                        </div>
                    </div>
                    <div><button type="button" class="pulsante" @click="approva(p)">Approva</button></div>
                    <div>
                        <label :for="'x' + p.id" class="etichetta">Motivo del rifiuto</label>
                        <input :id="'x' + p.id" v-model="motivi[p.id]" class="campo" />
                        <button type="button" class="chip spazio-sopra" @click="rifiuta(p)">Rifiuta</button>
                    </div>
                </li>
            </ul>
        </section>
    `
};
