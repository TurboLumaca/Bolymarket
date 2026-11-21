# Uso di strumenti AI

Strumento usato: Claude (Anthropic), tramite Claude Code. Per ogni milestone sono riportati il prompt e un riepilogo di cosa è stato generato e cosa va rivisto a mano.

## Prompt iniziale (comune a tutte le milestone)

Il prompt completo descrive il prodotto "Oracolo del Campus", i vincoli del corso (PHP puro, Vue 3, Tailwind, WCAG 2.1 AA), ruoli, LMSR, ciclo di vita dei mercati, sicurezza, identità visiva, struttura delle cartelle e workflow a milestone. Dopo la presentazione del piano è stato aggiunto il design di riferimento: interfaccia mobile scura in stile fintech (card compatte, pillole Sì/No, bottom sheet, barra bicolore), che sostituisce l'identità visiva originale dove differisce.

## Milestone (a): schema, seed, auth

Prompt: "Implement in milestones... (a) schema, seed, auth" (dal prompt iniziale, dopo l'OK al piano).

Cosa è stato generato: schema MySQL, script di seed (31 utenti: 1 gestore e 30 studenti; categorie), config, router a tabella, registrazione/login/logout/eliminazione account con CSRF, top-up settimanale lazy, scheletro Vue con login, registrazione, privacy, banner e annuncio del titolo a ogni cambio pagina.

Da rivedere a mano: la logica del top-up in `api/src/auth.php` (calcolo delle settimane in SQL), la lista `BLOCKED_PATTERNS` e `ALLOWED_EMAIL_DOMAINS` in `config.php`, i testi dell'informativa privacy (da far validare), i contrasti dei colori dei token.
