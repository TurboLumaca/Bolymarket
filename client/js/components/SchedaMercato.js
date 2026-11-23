import { giorno, etichetteStato } from "../formato.js";
import { BarraProbabilita } from "./BarraProbabilita.js";
import { Sparkline } from "./Sparkline.js";
import { PulsantiSiNo } from "./PulsantiSiNo.js";

export const SchedaMercato = {
    components: { BarraProbabilita, Sparkline, PulsantiSiNo },
    props: { mercato: Object },
    data() {
        return { etichetteStato };
    },
    methods: { giorno },
    template: `
        <article class="scheda scheda-mercato">
            <p class="testo-piccolo attenuato">{{ mercato.category }} · {{ etichetteStato[mercato.status] }}</p>
            <h2 class="titolo-mercato">
                <router-link :to="'/mercati/' + mercato.id" class="link-titolo">{{ mercato.question }}</router-link>
            </h2>
            <div class="riga-probabilita">
                <barra-probabilita :prezzo-si="mercato.priceYes"></barra-probabilita>
                <div class="area-sparkline"><sparkline :valori="mercato.trend || []"></sparkline></div>
            </div>
            <p v-if="mercato.status === 'resolved'" class="grassetto">
                Risolto: {{ mercato.outcome === 'yes' ? 'Sì' : 'No' }}
            </p>
            <p class="testo-piccolo attenuato">
                {{ mercato.status === 'open' ? 'Chiude il' : 'Chiuso il' }} {{ giorno(mercato.closesAt) }} · {{ mercato.tradeCount }} operazioni
            </p>
            <pulsanti-si-no v-if="mercato.status === 'open'" :id-mercato="mercato.id"
                :prezzo-si="mercato.priceYes" :prezzo-no="mercato.priceNo"></pulsanti-si-no>
        </article>
    `
};
