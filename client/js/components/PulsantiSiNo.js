import { crediti } from "../formato.js";
import { IconaLato } from "./IconaLato.js";

export const PulsantiSiNo = {
    components: { IconaLato },
    props: {
        idMercato: Number,
        prezzoSi: Number,
        prezzoNo: Number,
        disabilitato: Boolean
    },
    methods: { crediti },
    template: `
        <div class="coppia-pulsanti">
            <router-link :to="{ path: '/mercati/' + idMercato, query: { side: 'yes' } }"
                class="pillola lato-si" :aria-disabled="disabilitato || undefined">
                <icona-lato lato="yes"></icona-lato> Sì · {{ crediti(prezzoSi) }}
            </router-link>
            <router-link :to="{ path: '/mercati/' + idMercato, query: { side: 'no' } }"
                class="pillola lato-no" :aria-disabled="disabilitato || undefined">
                <icona-lato lato="no"></icona-lato> No · {{ crediti(prezzoNo) }}
            </router-link>
        </div>
    `
};
