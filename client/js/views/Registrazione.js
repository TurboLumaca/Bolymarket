import { registrati } from "../autenticazione.js";
import { TestoErrore } from "../components/TestoErrore.js";

export const Registrazione = {
    components: { TestoErrore },
    data() {
        return {
            modulo: { nickname: "", email: "", password: "", consent: false },
            errore: ""
        };
    },
    methods: {
        async invia() {
            this.errore = "";
            try {
                await registrati(this.modulo);
                this.$router.push("/");
            } catch (e) {
                this.errore = e.message;
            }
        }
    },
    template: `
        <h1 class="titolo-pagina">Registrati</h1>
        <form class="scheda modulo pila" @submit.prevent="invia" novalidate>
            <div>
                <label for="nickname" class="etichetta">Nickname pubblico</label>
                <input id="nickname" v-model="modulo.nickname" autocomplete="nickname" class="campo" required aria-describedby="aiutoNickname" />
                <p id="aiutoNickname" class="testo-piccolo attenuato">3-20 caratteri. È l'unico nome che gli altri vedranno.</p>
            </div>
            <div>
                <label for="email" class="etichetta">Email universitaria</label>
                <input id="email" v-model="modulo.email" type="email" autocomplete="email" class="campo" required />
            </div>
            <div>
                <label for="password" class="etichetta">Password (almeno 8 caratteri)</label>
                <input id="password" v-model="modulo.password" type="password" autocomplete="new-password" class="campo" required />
            </div>
            <div class="riga-consenso">
                <input id="consenso" v-model="modulo.consent" type="checkbox" />
                <label for="consenso">Ho letto l'<router-link to="/privacy">informativa sulla privacy</router-link> e acconsento al trattamento dei dati.</label>
            </div>
            <testo-errore id="erroreRegistrazione" :messaggio="errore"></testo-errore>
            <button type="submit" class="pulsante pieno">Crea account</button>
        </form>
    `
};
