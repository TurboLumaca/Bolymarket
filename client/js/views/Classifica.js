import { chiamaApi } from "../data.js";
import { crediti } from "../formato.js";

export const Classifica = {
    data() {
        return { scheda: "credits", dati: null, errore: "" };
    },
    watch: {
        scheda: { immediate: true, handler: "carica" }
    },
    methods: {
        crediti,
        async carica() {
            const scheda = this.scheda;
            this.dati = null;
            this.errore = "";
            try {
                const dati = await chiamaApi("GET", "/leaderboard?tab=" + scheda);
                if (this.scheda === scheda) {
                    this.dati = dati;
                }
            } catch (e) {
                console.error(e);
                if (this.scheda === scheda) {
                    this.errore = e.message;
                }
            }
        }
    },
    template: `
        <h1 class="titolo-pagina">Classifica</h1>
        <div role="group" aria-label="Tipo di classifica" class="gruppo-chip spazio-sotto">
            <button type="button" class="chip" :aria-pressed="scheda === 'credits'" @click="scheda = 'credits'">Crediti netti</button>
            <button type="button" class="chip" :aria-pressed="scheda === 'brier'" @click="scheda = 'brier'">Calibrazione</button>
        </div>
        <p v-if="scheda === 'brier'" class="testo-piccolo attenuato testo-largo">
            Il punteggio di Brier misura quanto sono precise le tue previsioni: più è basso, meglio è. Compaiono solo gli utenti con almeno
            {{ dati ? dati.minResolved : 5 }} previsioni risolte.
        </p>
        <p v-if="errore" role="alert" class="testo-errore">Errore: {{ errore }}</p>
        <p v-else-if="!dati" role="status" class="attenuato">Caricamento…</p>
        <p v-else-if="!dati.rows.length" class="attenuato">Nessun utente in classifica.</p>
        <div v-else class="tabella-scorrevole">
            <table class="tabella-classifica">
                <caption class="solo-lettori">{{ scheda === 'credits' ? 'Classifica per crediti netti' : 'Classifica per calibrazione (Brier)' }}</caption>
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nickname</th>
                        <th scope="col" class="destra">{{ scheda === 'credits' ? 'Crediti netti' : 'Brier' }}</th>
                        <th v-if="scheda === 'brier'" scope="col" class="destra">Previsioni</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(riga, i) in dati.rows" :key="riga.nickname">
                        <td>{{ i + 1 }}</td>
                        <th scope="row">{{ riga.nickname }}</th>
                        <td class="destra forte">{{ scheda === 'credits' ? crediti(riga.netCredits) : riga.brier.toFixed(3) }}</td>
                        <td v-if="scheda === 'brier'" class="destra">{{ riga.resolvedCount }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
};
