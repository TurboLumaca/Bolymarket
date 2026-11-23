import { percentuale } from "../formato.js";

// Due brevi elenchi numerati costruiti con i mercati già caricati dall'app.
export const BarraLaterale = {
    props: {
        mossi: Array,
        scambiati: Array
    },
    methods: {
        percentuale,
        segno(n) {
            return (n > 0 ? "▲ +" : n < 0 ? "▼ −" : "= ") + Math.abs(n) + " pt";
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
        <div class="pila">
            <section aria-labelledby="titoloMossi">
                <h2 id="titoloMossi" class="titolo-laterale">Più mossi di recente</h2>
                <p v-if="!mossi.length" class="testo-piccolo attenuato">Ancora nessun movimento.</p>
                <ol v-else class="elenco-numerato">
                    <li v-for="(m, i) in mossi" :key="m.id">
                        <router-link :to="'/mercati/' + m.id" class="voce-laterale">
                            <span class="numero-voce" aria-hidden="true">{{ i + 1 }}</span>
                            <span class="testo-voce due-righe">{{ m.question }}</span>
                            <span class="valore-voce">
                                <span class="numero-grande">{{ percentuale(m.priceYes) }}</span>
                                <span class="testo-piccolo grassetto">{{ segno(m.change) }}</span>
                            </span>
                        </router-link>
                    </li>
                </ol>
            </section>
            <section aria-labelledby="titoloScambiati">
                <h2 id="titoloScambiati" class="titolo-laterale">Più scambiati</h2>
                <p v-if="!scambiati.length" class="testo-piccolo attenuato">Ancora nessuna operazione.</p>
                <ol v-else class="elenco-numerato">
                    <li v-for="(m, i) in scambiati" :key="m.id">
                        <router-link :to="'/mercati/' + m.id" class="voce-laterale">
                            <span class="numero-voce" aria-hidden="true">{{ i + 1 }}</span>
                            <span class="testo-voce">
                                <span class="due-righe">{{ m.question }}</span>
                                <span class="testo-piccolo attenuato blocco">{{ m.category }}</span>
                            </span>
                            <span class="testo-piccolo grassetto">{{ m.tradeCount }} op.</span>
                        </router-link>
                    </li>
                </ol>
            </section>
            <a href="#/" class="pulsante pulsante-contorno" @click.prevent="vaiAllaLista">Esplora tutto</a>
        </div>
    `
};
