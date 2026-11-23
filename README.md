# Bolymarket

Mercati di previsione con **crediti finti, senza alcun valore reale**, per gli studenti del campus di Cesena. Progetto per Tecnologie Web.
Server in PHP puro (PDO, nessun framework), client Vue 3 + Vite + Vue Router + Tailwind.

## Setup su XAMPP

1. Avvia Apache e MySQL da XAMPP (PHP 8.2 o superiore, `pdo_mysql` attivo).
2. Copia il progetto in `htdocs/bolymarket/`.
3. Crea il database: `mysql -u root < database/schema.sql` e poi `mysql -u root < database/seed.sql`.
4. Crea l'utente usato in `api/src/config.php` (default `bolymarket` / `bolymarket`):
   `CREATE USER 'bolymarket'@'localhost' IDENTIFIED BY 'bolymarket'; GRANT ALL ON bolymarket.* TO 'bolymarket'@'localhost';`
5. Compila il client: `cd client && npm install && npm run build`.
6. Configura il virtual host come in `docs/xampp-vhost.conf` e apri `http://bolymarket.localhost`.

### Setup su MAMP (macOS)

1. In MAMP scegli PHP 8.2 o superiore (Preferences > PHP) e avvia i server. MySQL ascolta sulla porta 8889 (`DB_PORT` in `api/src/config.php`; su XAMPP è 3306).
2. Importa `database/schema.sql` e `database/seed.sql` (ad esempio da phpMyAdmin) e crea l'utente indicato in `api/src/config.php`.
3. Compila il client: `cd client && npm install && npm run build`.
4. Aggiungi il contenuto di `docs/mamp-vhost.conf` a `/Applications/MAMP/conf/apache/extra/httpd-vhosts.conf`, e in `httpd.conf` abilita `LoadModule rewrite_module` e l'`Include` di `httpd-vhosts.conf`.
5. Riavvia Apache da MAMP e apri `http://bolymarket.localhost:8888`.

### Sviluppo senza Apache

```
php -S 127.0.0.1:8080 -t api/public api/public/index.php   # API
cd client && npm install && npm run dev                      # client su http://127.0.0.1:5173 (proxy /api verso 8080)
```

Per rigenerare i dati demo: `php database/makeSeed.php > database/seed.sql` (poi ricarica schema e seed).

## Credenziali demo

Password per tutti: `bolymarket123`

| Ruolo | Email |
|---|---|
| Gestore | `gestore@unibo.it` |
| Studente | `lince@studio.unibo.it`, `volpe@studio.unibo.it`, ... (`<nickname>@studio.unibo.it`) |

Gli studenti con più previsioni risolte compaiono nella classifica di calibrazione (ad esempio `delta`, `pino`, `lince`). Gli utenti `ginepro`, `biblio`, `caffe`, `pioggia`, `sole` hanno un accredito settimanale pronto al prossimo accesso.

## Configurazione

Tutti i valori sono in `api/src/config.php`: `STARTING_CREDITS`, `WEEKLY_TOPUP`, `LIQUIDITY_DEFAULT`, `MIN_TRADE`, `MAX_TRADE` (quote per operazione), `MIN_RESOLVED_FOR_RANKING`, `BLOCKED_PATTERNS`, `ALLOWED_EMAIL_DOMAINS` e i dati di connessione al database.

## Come eseguire le verifiche

```
find api database tests -name '*.php' -exec php -l {} \;   # sintassi PHP
php tests/run.php                                           # matematica LMSR
cd client && npm run build                                  # build del client
```

## Dove leggere il codice

- `api/src/services/lmsr.php`: tutta la matematica del market maker (4 funzioni).
- `api/src/services/marketService.php`: stato dei mercati e operazioni in transazione.
- `api/src/services/settlementService.php`: risoluzione e annullamento.
- `api/public/index.php`: router a tabella con tutti gli endpoint.
- `client/src/components/TradePanel.vue`: anteprima del costo e operazione.

Documenti: `docs/design-report.md` (da completare dal gruppo), `docs/ai-usage.md`, `docs/accessibility.md`.
