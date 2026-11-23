import { chiamaApi } from "./data.js";

export const sessione = Vue.reactive({ utente: null, caricato: false });

export async function caricaUtente() {
    try {
        sessione.utente = await chiamaApi("GET", "/me");
    } catch (e) {
        console.error(e);
    }
    sessione.caricato = true;
}

export async function accedi(email, password) {
    sessione.utente = await chiamaApi("POST", "/auth/login", { email, password });
}

export async function registrati(dati) {
    sessione.utente = await chiamaApi("POST", "/auth/register", dati);
}

export async function esci() {
    await chiamaApi("POST", "/auth/logout");
    sessione.utente = null;
}

export async function eliminaAccount(password) {
    await chiamaApi("DELETE", "/me", { password });
    sessione.utente = null;
}
