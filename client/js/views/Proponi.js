import { chiamaApi } from "../data.js";
import { etichetteStato } from "../formato.js";
import { sessione } from "../autenticazione.js";
import { RegoleContenuto } from "../components/RegoleContenuto.js";
import { TestoErrore } from "../components/TestoErrore.js";

function formVuoto() {
    return { question: "", category: "", resolutionRule: "", closesAt: "" };
}

export const Proponi = {
    components: { RegoleContenuto, TestoErrore },
    data() {
        return {
            categorie: [],
            mie: [],
            modulo: formVuoto(),
            errore: "",
            fatto: "",
            mostraRegole: null,
            etichetteStato
        };
    },
    computed: {
        utente() {
            return sessione.utente;
        }
    },
    methods: {
        async caricaMie() {
            if (this.utente) {
                this.mie = await chiamaApi("GET", "/proposals/mine");
            }
        },
        async invia() {
            this.errore = "";
            this.fatto = "";
            try {
                await chiamaApi("POST", "/proposals", this.modulo);
                this.fatto = "Proposta inviata: il gestore la valuterà.";
                this.modulo = formVuoto();
                this.caricaMie();
            } catch (e) {
                this.errore = e.message;
            }
        }
    },
    async mounted() {
        try {
            this.categorie = await chiamaApi("GET", "/categories");
            await this.caricaMie();
        } catch (e) {
            console.error(e);
            this.errore = e.message;
        }
    },
    template: `
        <h1 class="titolo-pagina">Proponi un mercato</h1>
        <p v-if="!utente">Devi <router-link to="/accedi">accedere</router-link> per proporre un mercato.</p>
        <div v-else class="layout-proponi">
            <div class="pila">
                <regole-contenuto></regole-contenuto>
                <form class="scheda pila" novalidate @submit.prevent="invia">
                    <div>
                        <label for="domanda" class="etichetta">Domanda (sì o no)</label>
                        <input id="domanda" v-model="modulo.question" class="campo" maxlength="200" required />
                    </div>
                    <div>
                        <label for="categoria" class="etichetta">Categoria</label>
                        <select id="categoria" v-model="modulo.category" class="campo" required>
                            <option value="" disabled>Scegli…</option>
                            <option v-for="c in categorie" :key="c">{{ c }}</option>
                        </select>
                    </div>
                    <div>
                        <label for="regola" class="etichetta">Regola di risoluzione</label>
                        <textarea id="regola" v-model="modulo.resolutionRule" class="campo" rows="4" maxlength="500"
                            required aria-describedby="aiutoRegola"></textarea>
                        <p id="aiutoRegola" class="testo-piccolo attenuato">Indica quando vince il Sì e la fonte verificabile.</p>
                        <div class="info-regole">
                            <button type="button" @mouseenter="mostraRegole = 'regola'" @mouseleave="mostraRegole = null">info</button>
                            <div id="infoRegole" v-show="mostraRegole === 'regola'">
                                <p id="regoleFantasma">Per approvare la proposta</p>
                                <ul>
                                    <li>Domanda: 15–200 caratteri e termina con «?»</li>
                                    <li>Categoria: una di quelle esistenti</li>
                                    <li>Regola: 30–500 caratteri e una fonte verificabile</li>
                                    <li>Liquidità (b): tra 10 e 1000</li>
                                    <li>Niente argomenti vietati: esami e voti, docenti, salute, elezioni e partiti, insider o anticipazioni</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label for="chiusura" class="etichetta">Data di chiusura</label>
                        <input id="chiusura" v-model="modulo.closesAt" type="datetime-local" class="campo" required />
                    </div>
                    <testo-errore id="errorePropone" :messaggio="errore"></testo-errore>
                    <p v-if="fatto" role="status" class="conferma-testo">{{ fatto }}</p>
                    <button type="submit" class="pulsante pieno">Invia proposta</button>
                </form>
            </div>
            <section aria-labelledby="titoloMie">
                <h2 id="titoloMie" class="titolo-sezione">Le mie proposte</h2>
                <p v-if="!mie.length" class="attenuato">Non hai ancora proposto nulla.</p>
                <ul class="elenco-schede-verticale">
                    <li v-for="p in mie" :key="p.id" class="scheda">
                        <p class="grassetto">{{ p.question }}</p>
                        <p class="testo-piccolo attenuato">Stato: {{ etichetteStato[p.status] }}</p>
                        <p v-if="p.rejectionReason" class="testo-piccolo">Motivo del rifiuto: {{ p.rejectionReason }}</p>
                    </li>
                </ul>
            </section>
        </div>
    `
};
