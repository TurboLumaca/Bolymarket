export const annuncio = Vue.reactive({ messaggio: "" });

// Testo inserito nella regione aria-live di index.html.
export function annuncia(testo) {
    annuncio.messaggio = "";
    setTimeout(() => {
        annuncio.messaggio = testo;
    }, 50);
}
