import { chiamaApi } from "../data.js";
import { crediti, percentuale } from "../formato.js";
import { sessione, caricaUtente } from "../autenticazione.js";
import { IconaLato } from "./IconaLato.js";
import { TestoErrore } from "./TestoErrore.js";

export const PannelloOperazioni = {
    components: { IconaLato, TestoErrore },
    props: { mercato: Object },
    emits: ["operato"],
    data() {
        return {
            lato: this.$route.query.side === "no" ? "no" : "yes",
            azione: "buy",
            quote: "10",
            errore: "",
            anteprima: null,
            annuncio: "",
            occupato: false,
            timer: null
        };
    },
    computed: {
        utente() {
            return sessione.utente;
        },
        puoOperare() {
            return this.mercato.status === "open" && this.utente;
        },
        possedute() {
            const p = this.mercato.myPosition;
            return p ? (this.lato === "yes" ? p.sharesYes : p.sharesNo) : 0;
        }
    },
    watch: {
        lato: "pianificaAnteprima",
        azione: "pianificaAnteprima",
        quote: "pianificaAnteprima"
    },
    methods: {
        crediti,
        percentuale,
        async aggiornaAnteprima() {
            this.anteprima = null;
            this.annuncio = "";
            this.errore = "";
            if (!this.puoOperare || !/^\d+$/.test(this.quote)) {
                if (this.quote !== "") {
                    this.errore = "Inserisci un numero intero di quote.";
                }
                return;
            }
            try {
                this.anteprima = await chiamaApi("POST", "/markets/" + this.mercato.id + "/preview", {
                    side: this.lato, action: this.azione, shares: Number(this.quote)
                });
                const verbo = this.azione === "buy" ? "Costo" : "Incasso";
                this.annuncio = verbo + ": " + crediti(this.anteprima.credits) + " crediti. Probabilità del Sì dopo l'operazione: "
                    + percentuale(this.anteprima.priceYesAfter) + ".";
            } catch (e) {
                this.errore = e.message;
            }
        },
        // L'anteprima viene annunciata solo quando l'utente smette di scrivere.
        pianificaAnteprima() {
            clearTimeout(this.timer);
            this.anteprima = null;
            this.annuncio = "";
            this.timer = setTimeout(this.aggiornaAnteprima, 600);
        },
        async invia() {
            this.occupato = true;
            this.errore = "";
            try {
                const risultato = await chiamaApi("POST", "/markets/" + this.mercato.id + "/trades", {
                    side: this.lato, action: this.azione, shares: Number(this.quote)
                });
                this.annuncio = "Operazione eseguita: " + crediti(risultato.credits) + " crediti.";
                await caricaUtente();
                this.$emit("operato");
                this.anteprima = null;
            } catch (e) {
                this.errore = e.message;
            }
            this.occupato = false;
        }
    },
    mounted() {
        this.aggiornaAnteprima();
    },
    beforeUnmount() {
        clearTimeout(this.timer);
    },
    template: `
        <section aria-labelledby="titoloOperazioni" class="scheda pila">
            <h2 id="titoloOperazioni" class="titolo-scheda">Opera su questo mercato</h2>

            <p v-if="mercato.status !== 'open'">Questo mercato non accetta più operazioni.</p>
            <p v-else-if="!utente">
                <router-link to="/accedi">Accedi</router-link> o <router-link to="/registrati">registrati</router-link> per operare.
            </p>

            <form v-else class="pila" novalidate @submit.prevent="invia">
                <fieldset>
                    <legend class="etichetta">Scegli</legend>
                    <div class="coppia-pulsanti">
                        <label class="pillola lato-si scelta-lato">
                            <input v-model="lato" type="radio" name="side" value="yes" class="solo-lettori" /> <icona-lato lato="yes"></icona-lato> Sì
                        </label>
                        <label class="pillola lato-no scelta-lato">
                            <input v-model="lato" type="radio" name="side" value="no" class="solo-lettori" /> <icona-lato lato="no"></icona-lato> No
                        </label>
                    </div>
                </fieldset>

                <fieldset>
                    <legend class="etichetta">Operazione</legend>
                    <div class="gruppo-radio">
                        <label class="riga-scelta"><input v-model="azione" type="radio" name="action" value="buy" /> Compra</label>
                        <label class="riga-scelta"><input v-model="azione" type="radio" name="action" value="sell" /> Vendi</label>
                    </div>
                </fieldset>

                <div>
                    <label for="quote" class="etichetta">Numero di quote</label>
                    <input id="quote" v-model="quote" inputmode="numeric" autocomplete="off" class="campo"
                        :aria-invalid="errore ? 'true' : undefined" aria-describedby="aiutoQuote erroreQuote" />
                    <p id="aiutoQuote" class="testo-piccolo attenuato">Da 1 a 200. Ogni quota vincente paga 1 credito.
                        <span v-if="azione === 'sell'">Ne possiedi {{ possedute }}.</span></p>
                    <testo-errore id="erroreQuote" :messaggio="errore"></testo-errore>
                </div>

                <div class="riquadro-anteprima">
                    <p v-if="anteprima"><strong>{{ azione === 'buy' ? 'Costo' : 'Incasso' }}: {{ crediti(anteprima.credits) }} crediti</strong></p>
                    <p v-if="anteprima" class="testo-piccolo attenuato">Probabilità del Sì dopo: {{ percentuale(anteprima.priceYesAfter) }}</p>
                    <p v-else class="testo-piccolo attenuato">Il costo apparirà qui.</p>
                </div>
                <div class="solo-lettori" role="status" aria-live="polite">{{ annuncio }}</div>

                <button type="submit" class="pulsante pieno" :disabled="occupato || !anteprima">
                    Conferma {{ azione === 'buy' ? 'acquisto' : 'vendita' }}
                </button>
            </form>
        </section>
    `
};
