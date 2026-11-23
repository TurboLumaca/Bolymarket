const LARGHEZZA = 120;
const ALTEZZA = 32;

export const Sparkline = {
    props: { valori: Array },
    data() {
        return { larghezza: LARGHEZZA, altezza: ALTEZZA };
    },
    computed: {
        percorso() {
            const v = this.valori;
            if (v.length < 2) {
                return "";
            }
            return v.map((p, i) => {
                const x = (i / (v.length - 1)) * LARGHEZZA;
                const y = 2 + (1 - p) * (ALTEZZA - 4);
                return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
            }).join(" ");
        },
        area() {
            return this.percorso ? this.percorso + " L" + LARGHEZZA + " " + ALTEZZA + " L0 " + ALTEZZA + " Z" : "";
        }
    },
    template: `
        <svg v-if="percorso" :viewBox="'0 0 ' + larghezza + ' ' + altezza" class="sparkline"
            preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="var(--color-yes)" stop-opacity="0.3" />
                    <stop offset="1" stop-color="var(--color-yes)" stop-opacity="0" />
                </linearGradient>
            </defs>
            <path :d="area" fill="url(#sparkFill)" />
            <path :d="percorso" fill="none" stroke="var(--color-yes)" stroke-width="2" vector-effect="non-scaling-stroke" />
        </svg>
    `
};
