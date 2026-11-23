// "auto" segue il sistema, altrimenti "dark" o "light"
export const tema = Vue.reactive({ modo: "auto" });

function leggiTema() {
    try {
        return localStorage.getItem("theme") || "auto";
    } catch (e) {
        return "auto";
    }
}

function applicaTema(valore) {
    if (valore === "auto") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", valore);
    }
}

export function inizializzaTema() {
    tema.modo = leggiTema();
    applicaTema(tema.modo);
}

export function impostaTema(valore) {
    tema.modo = valore;
    applicaTema(valore);
    try {
        localStorage.setItem("theme", valore);
    } catch (e) {
        // il salvataggio può essere bloccato dal browser
    }
}
