import { percentuale, dataOra, inData } from "../formato.js";

const L = 600;
const A = 220;
const MARGINE = { sinistra: 40, destra: 12, alto: 12, basso: 24 };

export const GraficoPrezzo = {
    props: { storico: Array },
    data() {
        return { mostraTabella: false, L, A, margine: MARGINE };
    },
    computed: {
        punti() {
            const lista = this.storico;
            if (!lista.length) {
                return [];
            }
            const t0 = inData(lista[0].createdAt).getTime();
            const durata = Math.max(1, inData(lista[lista.length - 1].createdAt).getTime() - t0);
            return lista.map(p => ({
                x: MARGINE.sinistra + ((inData(p.createdAt).getTime() - t0) / durata) * (L - MARGINE.sinistra - MARGINE.destra),
                y: MARGINE.alto + (1 - p.priceYes) * (A - MARGINE.alto - MARGINE.basso)
            }));
        },
        linea() {
            return this.punti.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
        },
        area() {
            if (!this.punti.length) {
                return "";
            }
            const ultimo = this.punti[this.punti.length - 1];
            return this.linea + " L" + ultimo.x.toFixed(1) + " " + (A - MARGINE.basso)
                + " L" + this.punti[0].x.toFixed(1) + " " + (A - MARGINE.basso) + " Z";
        },
        lineeGriglia() {
            return [0, 0.5, 1].map(v => ({
                v,
                y: MARGINE.alto + (1 - v) * (A - MARGINE.alto - MARGINE.basso)
            }));
        },
        descrizione() {
            const lista = this.storico;
            if (!lista.length) {
                return "Nessun dato disponibile.";
            }
            const primo = lista[0].priceYes;
            const ultimo = lista[lista.length - 1].priceYes;
            return "Probabilità del Sì nel tempo: da " + percentuale(primo) + " a " + percentuale(ultimo)
                + " in " + lista.length + " rilevazioni.";
        }
    },
    methods: { percentuale, dataOra },
    template: `
        <figure class="scheda">
            <figcaption class="titolo-scheda">Andamento della probabilità del Sì</figcaption>
            <svg :viewBox="'0 0 ' + L + ' ' + A" class="grafico" role="img" aria-labelledby="titoloGrafico descGrafico">
                <title id="titoloGrafico">Grafico della probabilità del Sì</title>
                <desc id="descGrafico">{{ descrizione }}</desc>
                <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="var(--color-yes)" stop-opacity="0.35" />
                        <stop offset="1" stop-color="var(--color-yes)" stop-opacity="0" />
                    </linearGradient>
                </defs>
                <g class="attenuato" fill="currentColor" font-size="11">
                    <g v-for="linea in lineeGriglia" :key="linea.v">
                        <line :x1="margine.sinistra" :x2="L - margine.destra" :y1="linea.y" :y2="linea.y"
                            stroke="var(--color-border)" stroke-dasharray="3 4" />
                        <text :x="margine.sinistra - 6" :y="linea.y + 4" text-anchor="end">{{ percentuale(linea.v) }}</text>
                    </g>
                </g>
                <path :d="area" fill="url(#areaFill)" />
                <path :d="linea" fill="none" stroke="var(--color-yes)" stroke-width="2.5" stroke-linejoin="round" />
            </svg>
            <button type="button" class="pulsante pulsante-secondario spazio-sopra" :aria-expanded="mostraTabella"
                aria-controls="tabellaGrafico" @click="mostraTabella = !mostraTabella">
                {{ mostraTabella ? 'Nascondi tabella dati' : 'Mostra tabella dati' }}
            </button>
            <div v-if="mostraTabella" id="tabellaGrafico" class="tabella-scorrevole spazio-sopra" tabindex="0"
                role="region" aria-label="Tabella dei dati del grafico">
                <table>
                    <caption class="solo-lettori">Probabilità del Sì per data e ora</caption>
                    <thead><tr><th scope="col">Data e ora</th><th scope="col">Probabilità del Sì</th></tr></thead>
                    <tbody>
                        <tr v-for="(p, i) in storico" :key="i">
                            <td>{{ dataOra(p.createdAt) }}</td><td>{{ percentuale(p.priceYes) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </figure>
    `
};
