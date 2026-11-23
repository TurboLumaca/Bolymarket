import { percentuale } from "../formato.js";

// Grafico a linee con area sfumata, disegnato con SVG semplice.
// `valori` sono i prezzi del Sì da 0 a 1, dal più vecchio al più recente.
const L = 480;
const A = 200;
const MARGINE = { sinistra: 40, destra: 14, alto: 14, basso: 14 };

export const GraficoTrend = {
    props: {
        valori: Array,
        nome: { type: String, default: "gradiente" }
    },
    data() {
        return { L, A, margine: MARGINE, livelli: [0, 0.5, 1] };
    },
    computed: {
        punti() {
            const v = this.valori || [];
            if (v.length < 2) {
                return [];
            }
            return v.map((p, i) => ({
                x: MARGINE.sinistra + (i / (v.length - 1)) * (L - MARGINE.sinistra - MARGINE.destra),
                y: this.y(p)
            }));
        },
        linea() {
            return this.punti.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
        },
        area() {
            if (!this.linea) {
                return "";
            }
            return this.linea + " L" + (L - MARGINE.destra) + " " + (A - MARGINE.basso)
                + " L" + MARGINE.sinistra + " " + (A - MARGINE.basso) + " Z";
        },
        ultimo() {
            return this.punti[this.punti.length - 1];
        },
        testo() {
            const v = this.valori || [];
            if (v.length < 2) {
                return "Dati insufficienti per il grafico.";
            }
            return "Probabilità del Sì: da " + percentuale(v[0]) + " a " + percentuale(v[v.length - 1])
                + " nelle ultime " + v.length + " rilevazioni.";
        }
    },
    methods: {
        percentuale,
        y(v) {
            return MARGINE.alto + (1 - v) * (A - MARGINE.alto - MARGINE.basso);
        }
    },
    template: `
        <svg v-if="linea" :viewBox="'0 0 ' + L + ' ' + A" class="grafico" role="img" :aria-label="testo">
            <defs>
                <linearGradient :id="'fill-' + nome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="var(--color-yes)" stop-opacity="0.4" />
                    <stop offset="1" stop-color="var(--color-yes)" stop-opacity="0" />
                </linearGradient>
            </defs>
            <g class="attenuato" fill="currentColor" font-size="12">
                <g v-for="v in livelli" :key="v">
                    <line :x1="margine.sinistra" :x2="L - margine.destra" :y1="y(v)" :y2="y(v)" stroke="var(--color-border)" />
                    <text :x="margine.sinistra - 6" :y="y(v) + 4" text-anchor="end">{{ percentuale(v) }}</text>
                </g>
            </g>
            <path :d="area" :fill="'url(#fill-' + nome + ')'" />
            <path :d="linea" fill="none" stroke="var(--color-yes)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
            <circle :cx="ultimo.x" :cy="ultimo.y" r="4" fill="var(--color-yes)" />
        </svg>
        <p v-else class="testo-piccolo attenuato">{{ testo }}</p>
    `
};
