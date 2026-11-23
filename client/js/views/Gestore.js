import { sessione } from "../autenticazione.js";
import { AdminProposte } from "../components/AdminProposte.js";
import { AdminMercati } from "../components/AdminMercati.js";
import { AdminSegnalazioni } from "../components/AdminSegnalazioni.js";
import { AdminUtenti } from "../components/AdminUtenti.js";

export const Gestore = {
    components: { AdminProposte, AdminMercati, AdminSegnalazioni, AdminUtenti },
    data() {
        return {
            sezioni: [
                ["proposte", "Proposte"],
                ["mercati", "Mercati"],
                ["segnalazioni", "Segnalazioni"],
                ["utenti", "Utenti"]
            ],
            corrente: "proposte"
        };
    },
    computed: {
        utente() {
            return sessione.utente;
        },
        autorizzato() {
            return this.utente && this.utente.role === "gestore";
        }
    },
    template: `
        <h1 class="titolo-pagina">Area del gestore</h1>
        <p v-if="!autorizzato">Questa pagina è riservata al gestore.</p>
        <template v-else>
            <p class="spazio-sotto"><router-link to="/gestore/dashboard">Vai alla dashboard</router-link></p>
            <div role="group" aria-label="Sezioni" class="gruppo-chip spazio-sotto">
                <button v-for="[id, etichetta] in sezioni" :key="id" type="button" class="chip"
                    :aria-pressed="corrente === id" @click="corrente = id">{{ etichetta }}</button>
            </div>
            <admin-proposte v-if="corrente === 'proposte'"></admin-proposte>
            <admin-mercati v-if="corrente === 'mercati'"></admin-mercati>
            <admin-segnalazioni v-if="corrente === 'segnalazioni'"></admin-segnalazioni>
            <admin-utenti v-if="corrente === 'utenti'"></admin-utenti>
        </template>
    `
};
