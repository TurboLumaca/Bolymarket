<?php
function getPortfolio(): void {
    $user = requireLogin();
    resolveMarketStatus();
    $stmt = db()->prepare(
        'SELECT p.sharesYes, p.sharesNo, p.costBasis, m.id, m.question, m.status, m.outcome, m.qYes, m.qNo, m.liquidityB
         FROM positions p JOIN markets m ON m.id = p.marketId
         WHERE p.userId = ? AND m.status IN (\'open\', \'closed\', \'resolved\', \'voided\')
         ORDER BY m.status = \'open\' DESC, m.closesAt DESC'
    );
    $stmt->execute([$user['id']]);

    $items = [];
    $openValue = 0.0;
    $profit = 0.0;
    foreach ($stmt->fetchAll() as $p) {
        $yes = (float)$p['sharesYes'];
        $no = (float)$p['sharesNo'];
        $basis = (float)$p['costBasis'];
        $price = priceYes((float)$p['qYes'], (float)$p['qNo'], (float)$p['liquidityB']);
        if ($p['status'] === 'resolved') {
            $value = 0.0; // already paid out
            $itemProfit = ($p['outcome'] === 'yes' ? $yes : $no) - $basis;
        } elseif ($p['status'] === 'voided') {
            $value = 0.0;
            $itemProfit = 0.0;
        } else {
            $value = $yes * $price + $no * (1 - $price);
            $itemProfit = $value - $basis;
            $openValue += $value;
        }
        $profit += $itemProfit;
        $items[] = [
            'marketId' => (int)$p['id'], 'question' => $p['question'], 'status' => $p['status'], 'outcome' => $p['outcome'],
            'sharesYes' => $yes, 'sharesNo' => $no, 'costBasis' => round($basis, 2),
            'value' => round($value, 2), 'profit' => round($itemProfit, 2),
        ];
    }
    ok([
        'credits' => (float)$user['credits'],
        'openValue' => round($openValue, 2),
        'profit' => round($profit, 2),
        'positions' => $items,
    ]);
}
