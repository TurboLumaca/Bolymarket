import { percentuale, crediti, giorno } from "../formato.js";
import { IconaLato } from "./IconaLato.js";
import { GraficoTrend } from "./GraficoTrend.js";

// Una scheda grande alla volta. Niente scorrimento automatico, così nessuno ha fretta
// e il movimento ridotto è rispettato.
export const Carosello = {
    components: { IconaLato, GraficoTrend },
    props: { mercati: Array },
    data() {
        return { indice: 0 };
    },
    computed: {
        corrente() {
            return this.mercati[Math.min(this.indice, this.mercati.length - 1)];
        }
    },
    methods: {
        percentuale,
        crediti,
        giorno,
        vicino(passo) {
            return this.mercati[(this.indice + passo + this.mercati.length) % this.mercati.length];
        },
        vai(passo) {
            this.indice = (this.indice + passo + this.mercati.length) % this.mercati.length;
        },
        vaiAllaLista() {
            const titolo = document.querySelector("#titoloLista");
            if (titolo) {
                titolo.scrollIntoView();
                titolo.setAttribute("tabindex", "-1");
                titolo.focus();
            }
        }
    },
    template: `
        <section aria-roledescription="carosello" aria-label="Mercati in evidenza" class="scheda">
            <article class="carosello-contenuto" :aria-label="(indice + 1) + ' di ' + mercati.length">
                <div class="pila-piccola">
                    <p class="testo-piccolo attenuato">{{ corrente.category }} · in evidenza</p>
                    <h2 class="titolo-evidenza">
                        <router-link :to="'/mercati/' + corrente.id" class="link-titolo">{{ corrente.question }}</router-link>
                    </h2>
                    <ul class="elenco-prezzi">
                        <li>
                            <span class="etichetta-lato testo-si"><icona-lato lato="yes"></icona-lato> Sì</span>
                            <span class="numero-grande">{{ percentuale(corrente.priceYes) }}</span>
                            <router-link :to="{ path: '/mercati/' + corrente.id, query: { side: 'yes' } }"
                                class="pillola lato-si">Sì · {{ crediti(corrente.priceYes) }}</router-link>
                        </li>
                        <li>
                            <span class="etichetta-lato testo-no"><icona-lato lato="no"></icona-lato> No</span>
                            <span class="numero-grande">{{ percentuale(corrente.priceNo) }}</span>
                            <router-link :to="{ path: '/mercati/' + corrente.id, query: { side: 'no' } }"
                                class="pillola lato-no">No · {{ crediti(corrente.priceNo) }}</router-link>
                        </li>
                    </ul>
                    <p class="testo-piccolo attenuato">Chiude il {{ giorno(corrente.closesAt) }} · {{ corrente.tradeCount }} operazioni</p>
                </div>
                <div class="area-grafico-evidenza">
                    <p class="testo-piccolo grassetto">Probabilità del Sì, ultime rilevazioni</p>
                    <grafico-trend :valori="corrente.trend || []" :nome="'f' + corrente.id"></grafico-trend>
                </div>
            </article>

            <div class="comandi-carosello">
                <a href="#/" class="grassetto" @click.prevent="vaiAllaLista">Vedi tutti i mercati</a>
                <div v-if="mercati.length > 1" class="punti">
                    <button v-for="(m, i) in mercati" :key="m.id" type="button" class="tab-punto"
                        :aria-current="i === indice" :aria-label="'Mostra mercato ' + (i + 1) + ' di ' + mercati.length"
                        @click="indice = i"></button>
                </div>
                <div v-if="mercati.length > 1" class="gruppo-chip">
                    <button type="button" class="chip chip-largo" :aria-label="'Precedente: ' + vicino(-1).question" @click="vai(-1)">
                        <span aria-hidden="true">‹</span><span class="troncato" aria-hidden="true">{{ vicino(-1).question }}</span>
                    </button>
                    <button type="button" class="chip chip-largo" :aria-label="'Successivo: ' + vicino(1).question" @click="vai(1)">
                        <span class="troncato" aria-hidden="true">{{ vicino(1).question }}</span><span aria-hidden="true">›</span>
                    </button>
                </div>
            </div>
        </section>
    `
};
