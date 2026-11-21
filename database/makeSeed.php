<?php
// Generates database/seed.sql. Usage: php database/makeSeed.php > database/seed.sql
mt_srand(42);
$demoPassword = 'oracolo123';
$hash = password_hash($demoPassword, PASSWORD_DEFAULT);
$q = fn(string $s) => "'" . str_replace("'", "''", $s) . "'";

echo "USE oracolo;\n\n";
echo "INSERT INTO categories (name) VALUES ('Servizi'),('Eventi'),('Sport'),('Mensa'),('Aule e spazi'),('Trasporti');\n\n";

$nicknames = ['gestore', 'lince', 'aurora', 'tramonto', 'cesenate', 'volpe', 'nebbia', 'faro', 'delta', 'ginepro',
    'biblio', 'caffe', 'pioggia', 'sole', 'pino', 'torre', 'ciliegia', 'riva', 'onda', 'luna',
    'bussola', 'castoro', 'edera', 'falco', 'grillo', 'iris', 'lampo', 'maggese', 'noce', 'ontano', 'pavone'];

echo "INSERT INTO users (nickname, email, passwordHash, role, credits, lastTopupAt, consentAt) VALUES\n";
$rows = [];
foreach ($nicknames as $i => $nick) {
    $role = $i === 0 ? 'gestore' : 'studente';
    $email = $i === 0 ? 'gestore@unibo.it' : $nick . '@studio.unibo.it';
    $rows[] = '(' . implode(',', [$q($nick), $q($email), $q($hash), $q($role), 1000, 'NOW()', 'NOW()']) . ')';
}
echo implode(",\n", $rows) . ";\n";
