export function percentuale(p) {
    return Math.round(p * 100) + "%";
}

export function crediti(n) {
    return Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// MySQL restituisce "YYYY-MM-DD HH:MM:SS"; server e browser usano lo stesso fuso orario.
export function inData(testo) {
    return new Date(testo.replace(" ", "T"));
}

export function dataOra(testo) {
    return inData(testo).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function giorno(testo) {
    return inData(testo).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

export const etichetteStato = {
    open: "Aperto",
    closed: "Chiuso",
    resolved: "Risolto",
    voided: "Annullato",
    proposed: "In attesa",
    rejected: "Rifiutato",
    hidden: "Nascosto"
};
