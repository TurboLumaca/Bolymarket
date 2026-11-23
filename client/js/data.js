let tokenCsrf = null;

async function caricaCsrf() {
    const risposta = await fetch("/api/csrf", { credentials: "same-origin" });
    const json = await risposta.json();
    tokenCsrf = json.data.csrfToken;
}

// Restituisce i dati, oppure lancia un Error il cui messaggio viene mostrato all'utente.
export async function chiamaApi(metodo, percorso, corpo) {
    if (metodo !== "GET" && !tokenCsrf) {
        await caricaCsrf();
    }

    const opzioni = { method: metodo, credentials: "same-origin", headers: {} };
    if (metodo !== "GET") {
        opzioni.headers["X-CSRF-Token"] = tokenCsrf;
    }
    if (corpo !== undefined) {
        opzioni.body = JSON.stringify(corpo);
    }

    const risposta = await fetch("/api" + percorso, opzioni);
    const json = await risposta.json();

    if (json.error) {
        if (json.error.code === "csrf") {
            tokenCsrf = null;
        }
        throw new Error(json.error.message);
    }
    if (json.data && json.data.csrfToken) {
        tokenCsrf = json.data.csrfToken;
    }

    return json.data;
}
