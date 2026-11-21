# Oracolo del Campus

Mercati di previsione con crediti finti (nessun valore reale) per gli studenti del campus di Cesena. Progetto per Tecnologie Web. Server in PHP puro, client Vue 3 + Vite + Tailwind.

## Setup su XAMPP

1. Avvia Apache e MySQL da XAMPP e abilita `pdo_mysql` (attivo di default).
2. Copia la cartella del progetto in `htdocs/` oppure punta il virtual host a `api/public`.
3. Crea il database: `mysql -u root < database/schema.sql` e poi `mysql -u root < database/seed.sql`.
4. Crea l'utente MySQL usato in `api/src/config.php` (default `oracolo` / `oracolo`):
   `CREATE USER 'oracolo'@'localhost' IDENTIFIED BY 'oracolo'; GRANT ALL ON oracolo.* TO 'oracolo'@'localhost';`
5. Sviluppo: `php -S 127.0.0.1:8080 -t api/public api/public/index.php` e in un altro terminale `cd client && npm install && npm run dev`.

## Credenziali demo

Password per tutti: `oracolo123`

- Gestore: `gestore@unibo.it`
- Studenti: `lince@studio.unibo.it`, `volpe@studio.unibo.it`, ... (`<nickname>@studio.unibo.it`)

## Verifiche

- `find api database tests -name '*.php' -exec php -l {} \;`
- `php tests/run.php` (dalla milestone b)
- `cd client && npm run build`
