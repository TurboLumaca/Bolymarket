# Uso di strumenti AI

Strumento usato: Claude (Anthropic), tramite Claude Code. Per ogni milestone sono riportati il prompt e un riepilogo di cosa è stato generato e cosa va rivisto a mano.

## Prompt iniziale (comune a tutte le milestone)

Il prompt completo descrive il prodotto "Oracolo del Campus", i vincoli del corso (PHP puro, Vue 3, Tailwind, WCAG 2.1 AA), ruoli, LMSR, ciclo di vita dei mercati, sicurezza, identità visiva, struttura delle cartelle e workflow a milestone. Dopo la presentazione del piano è stato aggiunto il design di riferimento: interfaccia mobile scura in stile fintech (card compatte, pillole Sì/No, bottom sheet, barra bicolore), che sostituisce l'identità visiva originale dove differisce.

## Milestone (a): schema, seed, auth

Prompt: "Implement in milestones... (a) schema, seed, auth" (dal prompt iniziale, dopo l'OK al piano).

Cosa è stato generato: schema MySQL, script di seed (31 utenti: 1 gestore e 30 studenti; categorie), config, router a tabella, registrazione/login/logout/eliminazione account con CSRF, top-up settimanale lazy, scheletro Vue con login, registrazione, privacy, banner e annuncio del titolo a ogni cambio pagina.

Da rivedere a mano: la logica del top-up in `api/src/auth.php` (calcolo delle settimane in SQL), la lista `BLOCKED_PATTERNS` e `ALLOWED_EMAIL_DOMAINS` in `config.php`, i testi dell'informativa privacy (da far validare), i contrasti dei colori dei token.

## Milestone (b): LMSR, test, trading

Prompt: "(b) lmsr.php with tests, then trading" (dal prompt iniziale). Dopo l'OK al piano è stato chiesto di proseguire fino alla fine senza fermarsi tra le milestone.

Cosa è stato generato: `lmsr.php` (4 funzioni pure con log-sum-exp per evitare overflow), `tests/run.php` (prezzo 0,5, somma 1, andata e ritorno, perdita massima ≤ b·ln2), `marketService.php` (operazioni in transazione con `FOR UPDATE` su mercato, utente e posizione), endpoint di elenco, dettaglio, anteprima e operazione, seed completo (12 mercati in ogni stato, 210 operazioni simulate con la stessa matematica) e le viste Vue: elenco con filtri, dettaglio con grafico SVG, pannello di trading (bottom sheet su mobile).

Da rivedere a mano: le operazioni sono in quote intere (1-200, `MIN_TRADE`/`MAX_TRADE` contano le quote); `costBasis` è «crediti pagati meno crediti incassati»; l'arrotondamento a centesimi avviene solo in `tradeCredits()`; la scelta di 5 mercati risolti nel seed serve a far comparire la classifica di calibrazione (soglia 5).

## Milestone (c): ciclo di vita, proposte, approvazione e risoluzione

Prompt: "(c) market lifecycle, proposals, gestore approval and resolution" (dal prompt iniziale).

Cosa è stato generato: `resolveMarketStatus()` (chiusura lazy con una sola UPDATE), proposte con controllo `BLOCKED_PATTERNS` (`contentRules.php`), `settlementService.php` (risoluzione e annullamento con accrediti in transazione), controller admin (approva con modifica del testo e di b, rifiuta con motivo, risolvi con prova, annulla, nascondi, segnalazioni, sospensione utenti) e le viste Vue per proporre, segnalare e gestire.

Da rivedere a mano: la lista `BLOCKED_PATTERNS` (può dare falsi positivi, es. «partito» come participio), il fatto che la risoluzione sia consentita solo a mercato chiuso mentre l'annullamento anche a mercato aperto, e che un utente sospeso non possa più fare nulla perché `requireLogin()` lo blocca.
