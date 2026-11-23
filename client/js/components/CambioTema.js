import { tema, impostaTema } from "../tema.js";

export const CambioTema = {
    data() {
        return {
            tema,
            opzioni: [["auto", "Automatico"], ["dark", "Scuro"], ["light", "Chiaro"]]
        };
    },
    methods: {
        scegli(valore) {
            impostaTema(valore);
        }
    },
    template: `
        <div role="group" aria-label="Tema dei colori" class="gruppo-chip">
            <button v-for="[valore, etichetta] in opzioni" :key="valore" type="button" class="chip"
                :aria-pressed="tema.modo === valore" @click="scegli(valore)">
                {{ etichetta }}
            </button>
        </div>
    `
};
