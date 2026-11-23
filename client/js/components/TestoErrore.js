export const TestoErrore = {
    props: {
        id: String,
        messaggio: String
    },
    template: `
        <p v-if="messaggio" :id="id" role="alert" class="testo-errore">Errore: {{ messaggio }}</p>
    `
};
