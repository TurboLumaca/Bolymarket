<?php
// Net credits: cash plus the value of shares still in open or closed markets.
function leaderboardCredits(): array {
    $users = db()->query("SELECT id, nickname, credits FROM users WHERE role = 'studente' AND suspended = 0")->fetchAll();
    $open = db()->query(
        "SELECT p.userId, p.sharesYes, p.sharesNo, m.qYes, m.qNo, m.liquidityB
         FROM positions p JOIN markets m ON m.id = p.marketId WHERE m.status IN ('open', 'closed')"
    )->fetchAll();
    $total = [];
    foreach ($users as $u) {
        $total[$u['id']] = (float)$u['credits'];
    }
    foreach ($open as $p) {
        if (!isset($total[$p['userId']])) {
            continue;
        }
        $price = priceYes((float)$p['qYes'], (float)$p['qNo'], (float)$p['liquidityB']);
        $total[$p['userId']] += $p['sharesYes'] * $price + $p['sharesNo'] * (1 - $price);
    }
    $rows = [];
    foreach ($users as $u) {
        $rows[] = ['nickname' => $u['nickname'], 'netCredits' => round($total[$u['id']], 2)];
    }
    usort($rows, fn($a, $b) => $b['netCredits'] <=> $a['netCredits']);
    return array_slice($rows, 0, 50);
}

// Brier score: mean of (forecast - outcome)^2 over resolved positions; lower is better.
// The forecast for Yes is the average price paid for the side the user held at resolution.
function leaderboardBrier(): array {
    $positions = db()->query(
        "SELECT p.userId, p.marketId, p.sharesYes, p.sharesNo, m.outcome, u.nickname
         FROM positions p JOIN markets m ON m.id = p.marketId JOIN users u ON u.id = p.userId
         WHERE m.status = 'resolved' AND (p.sharesYes > 0 OR p.sharesNo > 0)
           AND u.role = 'studente' AND u.suspended = 0"
    )->fetchAll();
    $paid = [];
    $stmt = db()->query(
        "SELECT userId, marketId, side, SUM(credits) / SUM(shares) AS avgPrice
         FROM trades WHERE action = 'buy' GROUP BY userId, marketId, side"
    );
    foreach ($stmt->fetchAll() as $t) {
        $paid[$t['userId'] . '-' . $t['marketId'] . '-' . $t['side']] = (float)$t['avgPrice'];
    }

    $scores = [];
    foreach ($positions as $p) {
        $side = $p['sharesYes'] >= $p['sharesNo'] ? 'yes' : 'no';
        $avg = $paid[$p['userId'] . '-' . $p['marketId'] . '-' . $side] ?? null;
        if ($avg === null) {
            continue;
        }
        $forecastYes = $side === 'yes' ? $avg : 1 - $avg;
        $scores[$p['userId']]['nickname'] = $p['nickname'];
        $scores[$p['userId']]['errors'][] = ($forecastYes - ($p['outcome'] === 'yes' ? 1 : 0)) ** 2;
    }
    $rows = [];
    foreach ($scores as $s) {
        if (count($s['errors']) >= MIN_RESOLVED_FOR_RANKING) {
            $rows[] = ['nickname' => $s['nickname'], 'brier' => round(array_sum($s['errors']) / count($s['errors']), 3), 'resolvedCount' => count($s['errors'])];
        }
    }
    usort($rows, fn($a, $b) => $a['brier'] <=> $b['brier']);
    return array_slice($rows, 0, 50);
}
