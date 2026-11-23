import { accedi } from "../autenticazione.js";
import { TestoErrore } from "../components/TestoErrore.js";

export const Login = {
    components: { TestoErrore },
    data() {
        return { email: "", password: "", errore: "" };
    },
    methods: {
        async invia() {
            this.errore = "";
            try {
                await accedi(this.email, this.password);
                this.$router.push("/");
            } catch (e) {
                this.errore = e.message;
            }
        }
    },
    template: `
        <h1 class="titolo-pagina">Accedi</h1>
        <form class="scheda modulo pila" @submit.prevent="invia" novalidate>
            <div>
                <label for="email" class="etichetta">Email universitaria</label>
                <input id="email" v-model="email" type="email" autocomplete="email" class="campo" required
                    :aria-describedby="errore ? 'erroreLogin' : undefined" :aria-invalid="errore ? 'true' : undefined" />
            </div>
            <div>
                <label for="password" class="etichetta">Password</label>
                <input id="password" v-model="password" type="password" autocomplete="current-password" class="campo" required />
            </div>
            <testo-errore id="erroreLogin" :messaggio="errore"></testo-errore>
            <button type="submit" class="pulsante pieno">Accedi</button>
            <p class="testo-piccolo">Non hai un account? <router-link to="/registrati">Registrati</router-link></p>
        </form>
    `
};
