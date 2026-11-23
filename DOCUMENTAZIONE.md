# Bolymarket: guida per studiare il codice

Documento scritto per chi conosce HTML, CSS, JavaScript e PHP di base. Descrive lo stato del codice letto il 23/11/2026 (client riscritto in stile "professore": Vue e Vue Router da CDN, senza build).

> **Attenzione:** al momento della lettura il repository aveva modifiche non ancora committate (branch locale `stile-professore`). Il `README.md` descrive ancora la vecchia struttura (Vite, Tailwind, `npm install`, file `.vue` in `client/src/`): **quei passi non servono più**. Vale quanto scritto qui.

---

## 1. Cos'è Bolymarket

Un sito di "mercati di previsione" per gli studenti: ogni mercato è una domanda Sì/No (es. "Pioverà il giorno X?"). Gli utenti comprano e vendono **quote** Sì o No con **crediti finti**. Il prezzo di una quota Sì è la probabilità che la comunità assegna all'evento (0,70 = 70%). Quando l'evento accade, il gestore risolve il mercato e le quote vincenti valgono 1 credito ciascuna.

Due parti separate che parlano tra loro:

```
 BROWSER (client/)                          SERVER (api/)                    DATABASE
 HTML + CSS + JavaScript (Vue)   <--HTTP-->  PHP puro (nessun framework)  <-->  MySQL
 disegna le pagine                           regole, calcoli, sicurezza       dati permanenti
```

---

## 2. Mappa delle cartelle e dei file

```
Bolymarket/
├── api/                    SERVER (PHP)
│   ├── public/
│   │   ├── index.php       Punto d'ingresso unico: tabella delle rotte + dispatch
│   │   └── .htaccess       Manda ogni richiesta /api/... a index.php
│   └── src/
│       ├── config.php      Costanti: crediti iniziali, limiti, parole vietate, dati DB
│       ├── db.php          Funzione db(): crea (una volta) la connessione PDO a MySQL
│       ├── http.php        Utility: risposte JSON, errori, lettura body JSON, controllo CSRF
│       ├── auth.php        Sessione, utente corrente, controllo ruolo, ricarica settimanale
│       ├── controllers/    "Cosa fare per ogni endpoint" (uno strato sottile)
│       └── services/       La logica vera (calcoli, transazioni)
├── client/                 CLIENT (quello che gira nel browser)
│   ├── index.html          Unica pagina HTML; carica Vue, Vue Router e js/app.js
│   ├── css/style.css       Tutto lo stile; tema scuro/chiaro con variabili CSS
│   ├── img/favicon.svg     Icona della scheda
│   └── js/                 Tutto il JavaScript (vedi sotto)
├── database/
│   ├── schema.sql          Crea il database e le 7 tabelle
│   ├── seed.sql            Dati dimostrativi (utenti, mercati, scambi)
│   └── makeSeed.php        Script che genera seed.sql simulando scambi veri
├── tests/run.php           Test della matematica del market maker (php tests/run.php)
├── docs/                   Documenti e configurazioni Apache (vhost MAMP/XAMPP)
├── README.md               Istruzioni di installazione (in parte da aggiornare, vedi sopra)
└── LICENSE
```

### 2.1 Server: `api/src/`

| File | Cosa fa |
|---|---|
| `public/index.php` | Carica tutti i file di `src/`, definisce l'array `$routes` (metodo, percorso, funzione), avvia la sessione e chiama `dispatch()`. Cattura gli errori e li trasforma in JSON. |
| `config.php` | `STARTING_CREDITS` (1000), `WEEKLY_TOPUP` (100), `LIQUIDITY_DEFAULT` (100), `MIN_TRADE`/`MAX_TRADE` (1–200 quote), `BLOCKED_PATTERNS` (argomenti vietati), `ALLOWED_EMAIL_DOMAINS` (solo email unibo), dati di connessione. Su MAMP la porta MySQL è 8889, su XAMPP 3306. |
| `db.php` | `db()` restituisce un oggetto PDO (connessione al database) riusato per tutta la richiesta. |
| `http.php` | `ok($dati)` e `fail($codice,$msg,$status)` per rispondere; `jsonBody()` legge il JSON ricevuto; `requireCsrf()` verifica il token anti-CSRF; classe `ApiError`. |
| `auth.php` | `startSession()`, `currentUser()`, `requireLogin()`, `requireRole('gestore')`, `applyWeeklyTopup()`. |

**Controller** (`api/src/controllers/`): ricevono la richiesta, controllano i permessi, chiamano i service, rispondono.

| File | Endpoint che gestisce |
|---|---|
| `authController.php` | registrazione, login, logout, `/me` (vedi utente / elimina account), `/csrf` |
| `marketController.php` | elenco categorie, elenco mercati (filtri), dettaglio mercato con storico prezzi e mia posizione |
| `tradeController.php` | anteprima (`preview`) ed esecuzione (`trades`) di un'operazione |
| `portfolioController.php` | portafoglio: posizioni, valore, profitto |
| `leaderboardController.php` | classifica per crediti o per Brier |
| `proposalController.php` | proporre un mercato, vedere le proprie proposte, segnalare un mercato |
| `adminController.php` | tutto l'ambito gestore: approva/rifiuta proposte, risolvi/annulla/nascondi mercati, segnalazioni, utenti, dashboard statistica |

**Service** (`api/src/services/`): la logica di business.

| File | Cosa fa |
|---|---|
| `lmsr.php` | Matematica pura del market maker (4 funzioni: `cost`, `priceYes`, `costToBuy`, `creditsFromSell`). Non tocca il database. |
| `marketService.php` | Lettura mercati, anteprima operazione, `executeTrade()` (la transazione che muove crediti e quote), storico prezzi. |
| `settlementService.php` | `settleMarket()`: paga i vincitori (risoluzione) o rimborsa (annullamento). |
| `leaderboardService.php` | Calcolo delle due classifiche. |
| `contentRules.php` | Controlli sui testi delle proposte (lunghezza, "?" finale, parole vietate, data futura). |

### 2.2 Client: `client/js/`

| File | Cosa fa |
|---|---|
| `app.js` | Crea l'app Vue, registra router e componenti globali, la monta su `<div id="app">`, all'avvio chiede al server chi è l'utente. |
| `router.js` | Associa ogni indirizzo (`#/mercati/5`) a una "vista". Aggiorna titolo, sposta il focus sul titolo e lo annuncia (accessibilità). |
| `data.js` | **L'unico punto che parla col server**: `chiamaApi(metodo, percorso, corpo)` con `fetch`, JSON e token CSRF. |
| `autenticazione.js` | Stato di login condiviso (`sessione.utente`) + funzioni `accedi`, `registrati`, `esci`, `eliminaAccount`, `caricaUtente`. |
| `formato.js` | Formattare percentuali, crediti, date in italiano; etichette degli stati. |
| `tema.js` | Tema chiaro/scuro/automatico, ricordato in `localStorage`. |
| `annunci.js` | Messaggi per gli screen reader (regione `aria-live`). |

**Viste** (`client/js/views/`) = una per pagina:
`Home` (elenco mercati con filtri e ricerca), `Mercato` (dettaglio, grafico, operazioni), `Proponi`, `Portafoglio`, `Classifica`, `Login`, `Registrazione`, `Privacy`, `NonTrovata` (404), `Gestore` (area admin con schede) e `DashboardGestore` (statistiche).

**Componenti** (`client/js/components/`) = pezzi riutilizzabili:
- struttura: `IntestazioneApp` (menu, ricerca, categorie), `BannerCrediti` ("crediti finti"), `CambioTema`, `Logo`, `BarraLaterale`, `Carosello`
- mercati: `SchedaMercato`, `BarraProbabilita`, `PulsantiSiNo`, `IconaLato`, `Sparkline` (mini grafico), `GraficoPrezzo` e `GraficoTrend` (grafici SVG)
- azioni: `PannelloOperazioni` (compra/vendi con anteprima), `FormSegnalazione`, `RegoleContenuto`, `TestoErrore`
- admin: `AdminProposte`, `AdminMercati`, `AdminSegnalazioni`, `AdminUtenti`

### 2.3 Database (7 tabelle)

| Tabella | Contenuto |
|---|---|
| `users` | nickname, email, hash password, ruolo (`studente`/`gestore`), crediti, sospeso |
| `categories` | nomi delle categorie |
| `markets` | domanda, regola di risoluzione, scadenza, stato, liquidità `liquidityB`, quote `qYes`/`qNo`, esito |
| `trades` | ogni operazione eseguita (storico) |
| `positions` | quote Sì/No possedute da ogni utente in ogni mercato + costo sostenuto |
| `priceHistory` | prezzo del Sì dopo ogni operazione (per i grafici) |
| `reports` | segnalazioni degli utenti sui mercati |

Stati di un mercato: `proposed` (proposto) → `open` → `closed` (scaduto) → `resolved` o `voided`; oppure `rejected` / `hidden`.

---

## 3. Protocolli e tecnologie (spiegati semplice)

**HTTP.** Il linguaggio con cui browser e server si scambiano messaggi: il browser manda una *richiesta* (metodo + indirizzo + eventuali dati), il server risponde con un *codice* e dei dati. Metodi usati: `GET` (leggere), `POST` (creare/eseguire un'azione), `DELETE` (eliminare). Codici di stato che vedi nel codice: `200` ok, `400` richiesta sbagliata, `401` non autenticato, `403` non permesso, `404` non trovato, `409` conflitto (es. crediti insufficienti), `422` contenuto non ammesso, `500` errore del server.

**API REST (JSON su HTTP).** Il server non invia pagine HTML, ma *dati*. Gli indirizzi sono "risorse": `GET /api/markets/5` = dammi il mercato 5; `POST /api/markets/5/trades` = esegui un'operazione sul mercato 5. L'elenco completo è nell'array `$routes` di `api/public/index.php`.

**JSON.** Formato testuale per i dati, simile agli oggetti JS: `{"side":"yes","action":"buy","shares":10}`. Il client usa `JSON.stringify` per scrivere, il server `json_decode` per leggere (e `json_encode` per rispondere). Ogni risposta ha sempre la stessa forma: `{"data": ..., "error": null}` oppure `{"data": null, "error": {"code":..., "message":...}}`.

**`fetch` e `async/await`.** `fetch` è la funzione JS che invia la richiesta HTTP senza ricaricare la pagina. È asincrona (la risposta arriva dopo), quindi si usa `await`. Vedi `client/js/data.js`.

**Sessioni e cookie.** HTTP non si ricorda di te. Dopo il login PHP crea una *sessione* (dati salvati sul server, in `$_SESSION['userId']`) e dà al browser un cookie con un codice casuale; il browser lo rimanda a ogni richiesta e così il server ti riconosce. Il cookie è `httponly` (JS non può leggerlo) e `SameSite=Lax`. Si usa `session_regenerate_id` a login/logout per evitare furti di sessione. Nel client `credentials: "same-origin"` fa inviare il cookie.

**CSRF (token anti-falsificazione).** Un altro sito potrebbe far inviare al tuo browser (con il tuo cookie) una richiesta a Bolymarket. Per evitarlo, le richieste non-GET devono includere l'header `X-CSRF-Token` con un codice segreto che il client ottiene da `GET /api/csrf`. Il server lo confronta con quello in sessione (`requireCsrf()`).

**Password con hash.** La password non è mai salvata: `password_hash()` ne crea un'impronta irreversibile, `password_verify()` la controlla al login.

**SQL, MySQL e PDO.** I dati stanno in MySQL. PHP li raggiunge con PDO. Si usano sempre **query preparate** (`prepare` + `execute` con i `?`) così l'input dell'utente non può alterare la query (*SQL injection*).

**Transazioni e `FOR UPDATE`.** In `executeTrade()` e `settleMarket()` più modifiche (crediti, quote, storico) avvengono tutte insieme o per niente (`beginTransaction`/`commit`/`rollBack`). `FOR UPDATE` blocca le righe finché la transazione finisce, così due utenti insieme non possono spendere lo stesso credito.

**Front controller e `.htaccess`.** Ogni richiesta `/api/...` viene girata da Apache (`mod_rewrite`, file `.htaccess`) a `api/public/index.php`, che sceglie la funzione giusta confrontando metodo e percorso con la tabella delle rotte (con espressioni regolari; `{id}` = numero).

**Vue 3 (da CDN).** Libreria JS che collega i dati all'HTML: se cambi un dato, la pagina si aggiorna da sola (*reattività*). In `index.html` è caricata con un tag `<script src="https://unpkg.com/vue@3/...">`, quindi ti serve internet e **non c'è nessuna compilazione**. Ogni componente è un oggetto JS con `data`, `computed`, `methods`, `props` e un `template` (HTML in una stringa).

**Vue Router (modalità hash).** Cambia "pagina" senza ricaricare. Gli indirizzi usano il `#` (`/#/mercati/5`): la parte dopo `#` non arriva al server, quindi Apache serve sempre `index.html` e decide Vue. I filtri della home stanno nella *query* (`?status=open&category=...`).

**Moduli ES (`import`/`export`).** `<script type="module">` permette di dividere il JS in file che si importano tra loro (`import { chiamaApi } from "./data.js"`).

**localStorage.** Memoria del browser; qui ricorda il tema scelto.

**SVG.** Grafici disegnati con tag `<svg>` e `<path>` dentro i componenti `Sparkline`, `GraficoPrezzo`, `GraficoTrend`, senza librerie.

**CSS con variabili e `prefers-color-scheme`.** Colori definiti come `--color-...` in `:root`; il tema chiaro/scuro cambia i valori. Sì = azzurro, No = ambra (leggibili anche con daltonismo).

**Accessibilità.** Link "Vai al contenuto", `aria-live` per annunciare i cambi pagina, focus gestito dal router. Dettagli in `docs/accessibility.md`.

**LMSR (Logarithmic Market Scoring Rule).** Il "banco" che fissa il prezzo: la funzione di costo è `C(q) = b · ln(e^(qYes/b) + e^(qNo/b))`. Più compri Sì, più il prezzo del Sì sale. `b` (liquidità) decide quanto in fretta si muove il prezzo. Il costo di un acquisto è `C(dopo) − C(prima)`. Il codice (`lmsr.php`) sottrae il massimo prima di `exp()` per evitare overflow.

**Punteggio di Brier.** Misura l'accuratezza delle previsioni: media di `(probabilità − esito)²`, più basso = meglio.

---

## 4. Come comunicano i pezzi

### 4.1 Schema generale

```
index.html ──carica──> Vue + Vue Router (CDN) + js/app.js
app.js ──> router.js ──> View ──> Componenti
                           │
                           └─ chiamaApi() in data.js ── fetch ──> /api/... (Apache)
                                                                     │ .htaccess
                                                                     ▼
                                                           api/public/index.php
                                                    (sessione → CSRF → rotta → controller)
                                                                     │
                                                      controller → service → db() → MySQL
                                                                     │
                                       ◄──────── JSON {data, error} ─┘
```

### 4.2 Esempio completo: comprare quote

1. Apri `/#/mercati/5`. Il router carica la vista `Mercato`, che nel `watch` chiama `chiamaApi("GET", "/markets/5")`.
2. `data.js` fa `fetch("/api/markets/5")` con il cookie di sessione.
3. Apache gira la richiesta a `index.php`; `startSession()` riprende la sessione; `dispatch()` trova la rotta `GET /api/markets/{id}` → `getMarket(5)` in `marketController.php`.
4. `getMarket` usa `findMarket`, `marketPublic` (calcola il prezzo con `priceYes`), `marketHistory`, e la tua posizione; risponde con `ok($data)` → JSON.
5. La vista riceve l'oggetto e Vue disegna pagina, grafico e `PannelloOperazioni`.
6. Scrivi "10" quote: il pannello (dopo una breve pausa, `timer`) chiama `POST /markets/5/preview` → `previewTrade()` calcola costo e nuovo prezzo **senza salvare nulla**.
7. Premi "Compra": `POST /markets/5/trades`. `data.js` aggiunge `X-CSRF-Token` (se manca, prima lo chiede con `GET /api/csrf`).
8. Il server: `requireCsrf()` → `requireLogin()` → `postTrade` → `executeTrade()`: apre la transazione, blocca mercato/utente/posizione, controlla crediti, aggiorna `markets`, `users`, `positions`, `trades`, `priceHistory`, `commit`.
9. Il pannello emette l'evento `operato`; la vista ricarica il mercato e `caricaUtente()` aggiorna i crediti in testa alla pagina.

Se qualcosa va storto (es. crediti insufficienti) il server fa `fail(...)`; `index.php` cattura l'`ApiError` e invia `{"error":{"code":"insufficientCredits","message":"..."}}` con stato 409; `chiamaApi` lancia un `Error` e la vista mostra il messaggio.

### 4.3 Altri flussi

- **Login:** `Login` → `accedi()` (`autenticazione.js`) → `POST /auth/login` → verifica password, `applyWeeklyTopup`, salva `userId` in sessione → il server restituisce l'utente → `sessione.utente` si aggiorna e tutta l'interfaccia (menu, crediti) reagisce.
- **Stato condiviso nel client:** `sessione` (in `autenticazione.js`), `tema` e `annuncio` sono oggetti `Vue.reactive` importati da più file: sono la "memoria comune" dell'app, senza librerie di stato.
- **Proposta → pubblicazione:** utente `POST /proposals` (stato `proposed`, controlli di `contentRules.php`) → il gestore, in `AdminProposte`, `POST /admin/markets/{id}/approve` (diventa `open`, prezzo iniziale 0,5) o `/reject`.
- **Chiusura e risoluzione:** nessun processo in background; `resolveMarketStatus()` passa i mercati scaduti a `closed` ogni volta che qualcuno li legge. Il gestore poi usa `/resolve` (esito Sì/No + prova) o `/void`, che chiama `settleMarket()`: ogni quota vincente paga 1 credito (annullamento: rimborso del costo netto).
- **Ricarica settimanale:** calcolata "pigramente" al login (+100 crediti per ogni settimana intera passata).
- **Permessi:** controllati **sempre sul server** (`requireLogin`, `requireRole('gestore')`). Il client nasconde i pulsanti per comodità, ma non è lui a proteggere i dati.

### 4.4 Tabella delle rotte (riassunto)

| Metodo e percorso | Funzione | Chi può |
|---|---|---|
| GET `/api/csrf`, `/api/me` | token, utente corrente | tutti |
| POST `/api/auth/register`, `/login`, `/logout`; DELETE `/api/me` | account | tutti / utente |
| GET `/api/categories`, `/markets`, `/markets/{id}` | lettura mercati | tutti |
| POST `/markets/{id}/preview`, `/trades`, `/reports` | operare e segnalare | utente |
| GET `/portfolio`, `/leaderboard`, `/proposals/mine`; POST `/proposals` | utente | utente (classifica: tutti) |
| `/api/admin/...` (mercati, approve, reject, resolve, void, hide, dashboard, reports, users, suspend) | gestione | solo gestore |

---

## 5. Come eseguire e verificare

- **Con MAMP/XAMPP:** importa `schema.sql` e `seed.sql`, crea l'utente MySQL di `config.php`, configura il virtual host (`docs/mamp-vhost.conf`: `DocumentRoot` = `client/`, `Alias /api` = `api/public/`) e apri `http://bolymarket.localhost:8888`. **Non serve `npm`.**
- **Senza Apache:** `php -S 127.0.0.1:8080 -t api/public api/public/index.php` serve solo l'API; il client però chiama `/api` sullo stesso indirizzo, quindi in pratica serve un server che unisca le due parti come il vhost sopra.
- **Test matematica:** `php tests/run.php`.
- **Accesso demo:** password `bolymarket123`; gestore `gestore@unibo.it`, studenti `<nickname>@studio.unibo.it` (es. `lince`).

---

## 6. Percorso di studio consigliato

1. `client/index.html` e `client/js/app.js`: come parte tutto.
2. `client/js/data.js`: come il browser parla al server.
3. `api/public/index.php` e `http.php`: come il server riceve e risponde.
4. `api/src/controllers/authController.php` + `auth.php` + `client/js/autenticazione.js`: sessioni e login, di punta a punta.
5. `client/js/views/Home.js` e `components/SchedaMercato.js`: come si costruisce una lista con Vue.
6. `api/src/services/lmsr.php` e `tests/run.php`: la matematica.
7. `marketService.php` (`executeTrade`) con `components/PannelloOperazioni.js`: il flusso più completo.
8. `settlementService.php`, `leaderboardService.php` e l'area admin.

Suggerimento: apri gli strumenti di sviluppo del browser (scheda **Network**) e osserva le chiamate `/api/...` mentre usi il sito: vedi richiesta, header, JSON e codice di stato dal vivo.
