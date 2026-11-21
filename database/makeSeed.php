<?php
// Generates database/seed.sql by simulating trades with the real LMSR math.
// Usage: php database/makeSeed.php > database/seed.sql
require __DIR__ . '/../api/src/config.php';
require __DIR__ . '/../api/src/services/lmsr.php';

mt_srand(42);
$hash = password_hash('oracolo123', PASSWORD_DEFAULT);
$q = fn(string $s) => "'" . str_replace("'", "''", $s) . "'";
$ago = fn(int $minutes) => "DATE_SUB(NOW(), INTERVAL $minutes MINUTE)";
$ahead = fn(int $minutes) => "DATE_ADD(NOW(), INTERVAL $minutes MINUTE)";
const DAY = 1440;

$nicknames = ['gestore', 'lince', 'aurora', 'tramonto', 'cesenate', 'volpe', 'nebbia', 'faro', 'delta', 'ginepro',
    'biblio', 'caffe', 'pioggia', 'sole', 'pino', 'torre', 'ciliegia', 'riva', 'onda', 'luna',
    'bussola', 'castoro', 'edera', 'falco', 'grillo', 'iris', 'lampo', 'maggese', 'noce', 'ontano', 'pavone'];
$categories = ['Servizi', 'Eventi', 'Sport', 'Mensa', 'Aule e spazi', 'Trasporti'];

// [question, category, rule, status, outcome, createdAgoDays, closesDaysFromNow, tradeCount, proposerUserId, extra]
$markets = [
    ['La macchinetta del caffè del secondo piano verrà riparata entro Natale?', 'Servizi', 'Si risolve Sì se l\'avviso di guasto sul sito del campus viene rimosso o la macchinetta risulta in funzione entro il 25 dicembre.', 'open', null, 12, 34, 35, 4],
    ['La biblioteca resterà aperta fino alle 24 durante la sessione invernale?', 'Aule e spazi', 'Si risolve Sì se l\'avviso ufficiale della biblioteca sul sito di ateneo riporta l\'apertura fino alle 24 per almeno un giorno della sessione.', 'open', null, 9, 21, 25, 7],
    ['Il torneo di calcetto del campus si giocherà entro il 15 dicembre?', 'Sport', 'Si risolve Sì se il calendario pubblicato dal CUS indica almeno una partita giocata entro il 15 dicembre.', 'closed', null, 20, -2, 25, 3],
    ['La mensa proporrà un menù vegetariano ogni giorno della settimana scorsa?', 'Mensa', 'Si risolve Sì se il menù pubblicato sul sito della mensa mostra un piatto vegetariano in ogni giorno feriale.', 'resolved', 'yes', 40, -15, 22, 5],
    ['Il proiettore dell\'aula 2.4 sarà riparato entro la fine del mese scorso?', 'Aule e spazi', 'Si risolve Sì se il registro delle manutenzioni pubblico segna l\'intervento concluso entro la fine del mese.', 'resolved', 'no', 38, -14, 22, 9],
    ['La linea 4 dell\'autobus aggiungerà una corsa serale entro ottobre?', 'Trasporti', 'Si risolve Sì se l\'orario ufficiale del gestore del trasporto pubblico, valido da ottobre, riporta una corsa dopo le 21.', 'resolved', 'no', 37, -13, 22, 11],
    ['L\'open day del campus supererà le 500 iscrizioni?', 'Eventi', 'Si risolve Sì se il contatore delle iscrizioni sulla pagina ufficiale dell\'evento supera 500 alla chiusura.', 'resolved', 'yes', 36, -12, 22, 13],
    ['Il Wi-Fi dell\'aula magna sarà ripristinato entro venerdì?', 'Servizi', 'Si risolve Sì se l\'avviso di disservizio sul sito del campus viene chiuso entro venerdì alle 18.', 'resolved', 'yes', 35, -11, 22, 15],
    ['Il distributore del primo piano verrà spostato in aula studio?', 'Servizi', 'Si risolve Sì se un avviso ufficiale conferma lo spostamento entro la data di chiusura.', 'voided', null, 25, -6, 15, 6],
    ['Verrà organizzato un secondo cineforum a gennaio?', 'Eventi', 'Si risolve Sì se la pagina eventi del campus pubblica una seconda data di cineforum entro il 31 gennaio.', 'proposed', null, 1, 40, 0, 8],
    ['Un docente del campus verrà promosso a ordinario quest\'anno?', 'Eventi', 'Si risolve Sì se la gazzetta ufficiale pubblica la promozione.', 'rejected', null, 6, 30, 0, 10, 'Riguarda una persona identificabile.'],
    ['Chi ha anticipato le date degli appelli di gennaio?', 'Servizi', 'Si risolve Sì se qualcuno conferma la soffiata.', 'hidden', null, 8, 20, 0, 12],
];

// --- users: simulated balances ---
$userCount = count($nicknames);
$credits = array_fill(1, $userCount, (float)STARTING_CREDITS);
$skill = [];
for ($u = 2; $u <= $userCount; $u++) {
    $skill[$u] = 0.35 + mt_rand(0, 55) / 100;
}
$activeUsers = range(2, 16); // these trade in every resolved market, so they reach the Brier ranking

$sql = ['SET NAMES utf8mb4;', 'USE oracolo;', ''];
$sql[] = 'INSERT INTO categories (name) VALUES ' . implode(',', array_map(fn($c) => '(' . $q($c) . ')', $categories)) . ';';

$marketRows = [];
$tradeRows = [];
$historyRows = [];
$positions = []; // [userId][marketId] = [yes, no, basis]
$resolvedPayouts = [];

foreach ($markets as $i => $m) {
    [$question, $category, $rule, $status, $outcome, $createdDays, $closesDays, $tradeCount, $proposer] = $m;
    $marketId = $i + 1;
    $b = (float)LIQUIDITY_DEFAULT;
    $qYes = 0.0;
    $qNo = 0.0;
    $createdMin = $createdDays * DAY;
    $endMin = $closesDays < 0 ? -$closesDays * DAY : 0; // minutes ago when trading stopped
    $historyRows[] = "($marketId, 0.5, {$ago($createdMin)})";

    // trade times, oldest first, in minutes ago
    $times = [];
    for ($t = 0; $t < $tradeCount; $t++) {
        $times[] = mt_rand($endMin + 30, max($endMin + 31, $createdMin - 60));
    }
    rsort($times);

    $trueYes = $outcome === 'yes' || ($outcome === null && mt_rand(0, 1));
    $queue = [];
    if ($status === 'resolved') {
        $queue = $activeUsers; // guaranteed first buy for each active user
        shuffle($queue);
    }
    foreach ($times as $minutesAgo) {
        $userId = $queue ? array_shift($queue) : mt_rand(2, $userCount);
        $held = $positions[$userId][$marketId] ?? [0, 0, 0.0];
        $informed = mt_rand(0, 99) / 100 < $skill[$userId];
        $side = ($informed === $trueYes) ? 'yes' : 'no';
        $shares = mt_rand(2, 25);
        $action = 'buy';
        $heldOnSide = $side === 'yes' ? $held[0] : $held[1];
        if ($heldOnSide >= 5 && mt_rand(0, 99) < 18 && !$queue) {
            $action = 'sell';
            $shares = min($shares, (int)$heldOnSide);
        }
        $raw = $action === 'buy'
            ? costToBuy($qYes, $qNo, $b, $side, $shares)
            : creditsFromSell($qYes, $qNo, $b, $side, $shares);
        $cost = round($raw, 2);
        if ($action === 'buy' && $cost > $credits[$userId]) {
            continue;
        }
        $sign = $action === 'buy' ? 1 : -1;
        if ($side === 'yes') { $qYes += $sign * $shares; } else { $qNo += $sign * $shares; }
        $credits[$userId] -= $sign * $cost;
        $held[$side === 'yes' ? 0 : 1] += $sign * $shares;
        $held[2] += $sign * $cost;
        $positions[$userId][$marketId] = $held;
        $price = round(priceYes($qYes, $qNo, $b), 6);
        $tradeRows[] = "($userId, $marketId, '$side', '$action', $shares, $cost, $price, {$ago($minutesAgo)})";
        $historyRows[] = "($marketId, $price, {$ago($minutesAgo)})";
    }

    if ($status === 'resolved') {
        foreach ($positions as $userId => $byMarket) {
            if (isset($byMarket[$marketId])) {
                $credits[$userId] += $byMarket[$marketId][$outcome === 'yes' ? 0 : 1];
            }
        }
    }
    if ($status === 'voided') {
        foreach ($positions as $userId => $byMarket) {
            if (isset($byMarket[$marketId])) {
                $credits[$userId] += $byMarket[$marketId][2];
            }
        }
    }

    $closes = $closesDays < 0 ? $ago(-$closesDays * DAY) : $ahead($closesDays * DAY);
    $resolvedAt = in_array($status, ['resolved', 'voided'], true) ? $ago(max(60, $endMin - DAY)) : 'NULL';
    $evidence = $status === 'resolved' ? $q('Verificato sulla fonte indicata nella regola.') : 'NULL';
    $rejection = $status === 'rejected' ? $q($m[9]) : 'NULL';
    $outcomeSql = $outcome ? $q($outcome) : 'NULL';
    $marketRows[] = '(' . implode(',', [
        $marketId, $proposer, $q($question), $q($category), $q($rule), $closes, $q($status),
        $b, $qYes, $qNo, $outcomeSql, $evidence, $rejection, $ago($createdMin), $resolvedAt,
    ]) . ')';
}

// users
$userRows = [];
foreach ($nicknames as $i => $nick) {
    $id = $i + 1;
    $role = $id === 1 ? 'gestore' : 'studente';
    $email = $id === 1 ? 'gestore@unibo.it' : $nick . '@studio.unibo.it';
    $topup = ($id >= 10 && $id <= 14) ? $ago(9 * DAY) : 'NOW()'; // these get a weekly top-up at next login
    $userRows[] = '(' . implode(',', [$id, $q($nick), $q($email), $q($hash), $q($role), number_format($credits[$id], 2, '.', ''), $topup, 'NOW()']) . ')';
}
$sql[] = 'INSERT INTO users (id, nickname, email, passwordHash, role, credits, lastTopupAt, consentAt) VALUES';
$sql[] = implode(",\n", $userRows) . ';';
$sql[] = 'INSERT INTO markets (id, proposerId, question, category, resolutionRule, closesAt, status, liquidityB, qYes, qNo, outcome, resolutionEvidence, rejectionReason, createdAt, resolvedAt) VALUES';
$sql[] = implode(",\n", $marketRows) . ';';
$sql[] = 'INSERT INTO trades (userId, marketId, side, action, shares, credits, priceYesAfter, createdAt) VALUES';
$sql[] = implode(",\n", $tradeRows) . ';';
$sql[] = 'INSERT INTO priceHistory (marketId, priceYes, createdAt) VALUES';
$sql[] = implode(",\n", $historyRows) . ';';

$positionRows = [];
foreach ($positions as $userId => $byMarket) {
    foreach ($byMarket as $marketId => [$yes, $no, $basis]) {
        $positionRows[] = "($userId, $marketId, $yes, $no, " . number_format($basis, 2, '.', '') . ')';
    }
}
$sql[] = 'INSERT INTO positions (userId, marketId, sharesYes, sharesNo, costBasis) VALUES';
$sql[] = implode(",\n", $positionRows) . ';';
$sql[] = "INSERT INTO reports (marketId, reporterId, reason, status) VALUES (12, 5, 'Sembra rivelare informazioni riservate.', 'open'), (12, 9, 'Parla di appelli d''esame.', 'open'), (1, 14, 'La regola non cita una fonte precisa.', 'open');";

echo implode("\n", $sql) . "\n";
