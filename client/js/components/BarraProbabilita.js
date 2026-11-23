import { percentuale } from "../formato.js";

export const BarraProbabilita = {
    props: {
        prezzoSi: Number,
        grande: Boolean
    },
    computed: {
        percentualeSi() {
            return Math.round(this.prezzoSi * 100);
        }
    },
    methods: { percentuale },
    template: `
        <div>
            <p class="probabilita" :class="{ grande }">
                {{ percentuale(prezzoSi) }} <span class="probabilita-si">Sì</span>
            </p>
            <div class="barra" role="meter" aria-label="Probabilità del Sì"
                aria-valuemin="0" aria-valuemax="100" :aria-valuenow="percentualeSi"
                :aria-valuetext="percentualeSi + '% Sì'">
                <div class="barra-si" :style="{ width: percentualeSi + '%' }"></div>
                <div class="barra-no"></div>
            </div>
        </div>
    `
};
