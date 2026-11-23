import { router } from "./router.js";
import { caricaUtente } from "./autenticazione.js";
import { annuncio } from "./annunci.js";
import { inizializzaTema } from "./tema.js";
import { BannerCrediti } from "./components/BannerCrediti.js";
import { IntestazioneApp } from "./components/IntestazioneApp.js";
import { CambioTema } from "./components/CambioTema.js";

const app = Vue.createApp({
    components: { BannerCrediti, IntestazioneApp, CambioTema },
    data() {
        return { annuncio };
    },
    methods: {
        vaiAlContenuto() {
            document.querySelector("#main").focus();
        }
    },
    mounted() {
        inizializzaTema();
        caricaUtente();
    }
});
app.use(router);
app.mount("#app");
