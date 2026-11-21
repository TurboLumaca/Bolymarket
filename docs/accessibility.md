# Accessibilità (WCAG 2.1 AA)

## Cosa è implementato

- Struttura: `lang="it"`, skip link «Vai al contenuto», landmark (`header`, `nav`, `main`, `footer`, regione dell'avviso «Crediti finti»), un solo `h1` per vista.
- Cambio pagina: a ogni navigazione il focus passa all'`h1`, il titolo del documento si aggiorna e viene annunciato in una regione `aria-live="polite"` (`router/index.js`, `useAnnouncer.js`).
- Probabilità: barra con `role="meter"`, `aria-valuenow/min/max`, `aria-valuetext` e testo visibile («62% Sì»).
- Sì e No non si distinguono mai solo per colore: testo («Sì», «No»), icona (spunta e croce), bordo pieno per il Sì e tratteggiato per il No, barra con tinta unita e righe oblique.
- Grafico: SVG con `<title>` e `<desc>`, e pulsante «Mostra tabella dati» (`aria-expanded`) che mostra gli stessi dati in una tabella.
- Pannello di operazione: campi nativi con `label`, errori collegati con `aria-describedby` e annunciati (`role="alert"`), anteprima del costo annunciata con `aria-live="polite"` solo 600 ms dopo l'ultimo tasto.
- Bottom sheet mobile: `<dialog>` nativo con `showModal()` (focus intrappolato, Esc chiude, ritorno del focus).
- Bersagli di tocco di almeno 44x44 px (pulsanti, chip, link di navigazione, etichette di radio e checkbox).
- Focus visibile su tutti gli elementi, contrasto AA in tema scuro e chiaro (verificato con axe-core), contenuto senza scorrimento orizzontale a 320 px.
- Animazioni: solo transizione della barra di probabilità; disattivate con `prefers-reduced-motion`.
- Tema: scuro di default, chiaro seguendo il sistema o scelto dal selettore in fondo alla pagina.

## Come è stata verificata

Controllo automatico con axe-core (regole wcag2a, wcag2aa, wcag21a, wcag21aa e best practice) su 11 pagine, in tema scuro e chiaro, a 320 px e 1200 px: 0 violazioni. Controllo di sovraccarico orizzontale a 320 px: nessuno. Verificato che il focus finisca sull'`h1` dopo la navigazione.

## Da verificare a mano (non coperto da axe)

- Lettura con uno screen reader reale (NVDA o VoiceOver): annunci dell'anteprima e del cambio pagina.
- Navigazione completa solo da tastiera, compreso il bottom sheet su telefono.
- Zoom al 200% sul desktop e testo ingrandito sul telefono.
- Contrasto di eventuali colori modificati in `client/src/style.css`.

## Deviazioni dall'identità visiva originale (design di riferimento fornito dal gruppo)

| Elemento | Originale | Applicato |
|---|---|---|
| Tema | chiaro di default | scuro di default, chiaro disponibile |
| Token colore | paper, ink, line, brand, yes, no, surface | stessi nomi, valori per tema scuro e chiaro; aggiunti `muted`, `brandSoft` ed `edge` (bordo dei controlli, contrasto 3:1); `oracle` rinominato `brand` |
| Font | Fraunces + Inter | solo Inter, installata in locale con `@fontsource-variable/inter` (`font-display: swap`) |
| Card e pulsanti | angoli ampi | raggio 12 px, bordo 1 px, pillole Sì/No |
| Pannello di operazione | colonna sticky | bottom sheet su mobile, colonna sticky da md |
| Grafici | linea | linea con sfumatura e sparkline nelle card |
| Non adottato | | aggiornamento in tempo reale (vietati i websocket), effetto vetro sul bottom sheet (rischio contrasto) |

## Deviazioni dalle specifiche (restyling ispirato a un sito di mercati predittivi)

Le specifiche originali restano l'autorità: nessun nome, logo, testo o immagine del sito di riferimento è stato copiato.

| Punto | Specifica / sito di riferimento | Applicato in Bolymarket |
|---|---|---|
| Colori Sì/No | il sito di riferimento usa verde/rosso | Sì azzurro, No ambra (adatti anche a chi non distingue rosso e verde); Sì e No restano distinti anche da testo, icona, bordo pieno o tratteggiato e righe oblique nella barra |
| Sfondo | nero-ardesia | `paper` 9 12 16 in tema scuro; il tema chiaro resta disponibile |
| Intestazione | barra fissa con logo, ricerca e schede | fissa (sticky) solo da 768 px in su: su telefono occuperebbe circa un quarto dello schermo |
| Ricerca | campo nella barra | il testo va nell'indirizzo (`?q=`); il cambio di sola query non sposta il focus sull'`h1` (`router/index.js`), altrimenti non si potrebbe scrivere |
| Schede | una riga di schede con freccia di scorrimento | una sola riga (categorie, divisore, pagine); link con `aria-current` e sottolineatura; la freccia è un pulsante da 44 px con etichetta, la riga resta scorrevole anche da tastiera |
| Carosello | pillole con il nome del mercato vicino, puntino attivo allungato | uguale, ma il nome completo è nell'`aria-label` dei pulsanti; nessun avanzamento automatico;  nessun avanzamento automatico (WCAG 2.2.2, riduzione del movimento); precedente/successivo e puntini sono pulsanti da 44 px |
| Liste laterali | liste numerate con percentuale e variazione, pulsante «Esplora tutto» | uguale; titoli nostri: «Più mossi di recente» e «Più scambiati», ricavati dai mercati aperti già caricati (variazione dalla serie dei prezzi, numero di operazioni); la direzione è scritta con freccia e segno («▲ +4 punti»), mai solo con il colore; sotto lg la colonna va in fondo alla pagina |
| Grafico in evidenza | libreria di grafici | SVG scritto a mano (`TrendChart.vue`), con `aria-label` che riassume l'andamento; il grafico completo con tabella dati resta nella pagina del mercato |
| Percentuali | numeri grandi | `font-extrabold`, cifre tabulari |
| Token | solo token Tailwind | rispettato; nessun colore scritto a mano nei componenti |
