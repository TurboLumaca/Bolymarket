<?php
// Time-based transition, computed lazily: call it whenever markets are read.
function resolveMarketStatus(): void {
    db()->exec("UPDATE markets SET status = 'closed' WHERE status = 'open' AND closesAt <= NOW()");
}

function marketPublic(array $m): array {
    $price = priceYes((float)$m['qYes'], (float)$m['qNo'], (float)$m['liquidityB']);
    return [
        'id' => (int)$m['id'],
        'question' => $m['question'],
        'category' => $m['category'],
        'resolutionRule' => $m['resolutionRule'],
        'closesAt' => $m['closesAt'],
        'status' => $m['status'],
        'priceYes' => round($price, 4),
        'priceNo' => round(1 - $price, 4),
        'outcome' => $m['outcome'],
        'resolutionEvidence' => $m['resolutionEvidence'],
        'tradeCount' => isset($m['tradeCount']) ? (int)$m['tradeCount'] : null,
    ];
}

function findMarket(int $id, bool $lock = false): array {
    $stmt = db()->prepare('SELECT * FROM markets WHERE id = ?' . ($lock ? ' FOR UPDATE' : ''));
    $stmt->execute([$id]);
    $market = $stmt->fetch();
    if (!$market) {
        fail('notFound', 'Mercato non trovato.', 404);
    }
    return $market;
}

function listMarkets(string $status, string $category, string $search): array {
    resolveMarketStatus();
    $visible = ['open', 'closed', 'resolved', 'voided'];
    $where = ['m.status IN (' . implode(',', array_map(fn($s) => "'$s'", $visible)) . ')'];
    $params = [];
    if (in_array($status, $visible, true)) {
        $where = ['m.status = ?'];
        $params[] = $status;
    }
    if ($category !== '') {
        $where[] = 'm.category = ?';
        $params[] = $category;
    }
    if ($search !== '') {
        $where[] = 'm.question LIKE ?';
        $params[] = '%' . addcslashes($search, '%_') . '%';
    }
    $sql = 'SELECT m.*, (SELECT COUNT(*) FROM trades t WHERE t.marketId = m.id) AS tradeCount
            FROM markets m WHERE ' . implode(' AND ', $where) . '
            ORDER BY FIELD(m.status, \'open\', \'closed\', \'resolved\', \'voided\'), m.closesAt';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return array_map('marketPublic', $stmt->fetchAll());
}

function marketHistory(int $marketId): array {
    $stmt = db()->prepare('SELECT priceYes, createdAt FROM priceHistory WHERE marketId = ? ORDER BY createdAt, id');
    $stmt->execute([$marketId]);
    return array_map(fn($r) => ['priceYes' => (float)$r['priceYes'], 'createdAt' => $r['createdAt']], $stmt->fetchAll());
}

function checkTradeInput(array $body): array {
    $side = $body['side'] ?? '';
    $action = $body['action'] ?? '';
    $shares = $body['shares'] ?? null;
    if (!in_array($side, ['yes', 'no'], true) || !in_array($action, ['buy', 'sell'], true)) {
        fail('invalidTrade', 'Scegli Sì o No e se comprare o vendere.');
    }
    if (!is_int($shares) && !(is_string($shares) && ctype_digit($shares))) {
        fail('invalidShares', 'Inserisci un numero intero di quote.');
    }
    $shares = (int)$shares;
    if ($shares < MIN_TRADE || $shares > MAX_TRADE) {
        fail('invalidShares', 'Puoi operare da ' . MIN_TRADE . ' a ' . MAX_TRADE . ' quote alla volta.');
    }
    return [$side, $action, $shares];
}

// Credits are rounded to cents only here, at the boundary.
function tradeCredits(array $market, string $side, string $action, int $shares): float {
    $qYes = (float)$market['qYes'];
    $qNo = (float)$market['qNo'];
    $b = (float)$market['liquidityB'];
    $raw = $action === 'buy'
        ? costToBuy($qYes, $qNo, $b, $side, $shares)
        : creditsFromSell($qYes, $qNo, $b, $side, $shares);
    return round($raw, 2);
}

function ensureTradable(array $market): void {
    if ($market['status'] !== 'open' || strtotime($market['closesAt']) <= time()) {
        fail('marketClosed', 'Questo mercato non accetta più operazioni.', 409);
    }
}

function previewTrade(int $marketId, array $body): array {
    resolveMarketStatus();
    [$side, $action, $shares] = checkTradeInput($body);
    $market = findMarket($marketId);
    ensureTradable($market);
    $credits = tradeCredits($market, $side, $action, $shares);
    $delta = $action === 'buy' ? $shares : -$shares;
    $qYes = (float)$market['qYes'] + ($side === 'yes' ? $delta : 0);
    $qNo = (float)$market['qNo'] + ($side === 'no' ? $delta : 0);
    return [
        'credits' => $credits,
        'priceYesAfter' => round(priceYes($qYes, $qNo, (float)$market['liquidityB']), 4),
    ];
}

// Locks the market, then the user, so concurrent trades cannot overspend or double-sell.
function executeTrade(int $userId, int $marketId, array $body): array {
    resolveMarketStatus();
    [$side, $action, $shares] = checkTradeInput($body);
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $market = findMarket($marketId, true);
        ensureTradable($market);

        $stmt = $pdo->prepare('SELECT credits FROM users WHERE id = ? FOR UPDATE');
        $stmt->execute([$userId]);
        $balance = (float)$stmt->fetchColumn();

        $stmt = $pdo->prepare('SELECT sharesYes, sharesNo FROM positions WHERE userId = ? AND marketId = ? FOR UPDATE');
        $stmt->execute([$userId, $marketId]);
        $position = $stmt->fetch() ?: ['sharesYes' => 0, 'sharesNo' => 0];
        $held = (float)($side === 'yes' ? $position['sharesYes'] : $position['sharesNo']);

        $credits = tradeCredits($market, $side, $action, $shares);
        if ($action === 'buy' && $credits > $balance) {
            fail('insufficientCredits', 'Crediti insufficienti.', 409);
        }
        if ($action === 'sell' && $shares > $held) {
            fail('insufficientShares', 'Non hai abbastanza quote da vendere.', 409);
        }

        $sign = $action === 'buy' ? 1 : -1;
        $qYes = (float)$market['qYes'] + ($side === 'yes' ? $sign * $shares : 0);
        $qNo = (float)$market['qNo'] + ($side === 'no' ? $sign * $shares : 0);
        $priceAfter = priceYes($qYes, $qNo, (float)$market['liquidityB']);

        $pdo->prepare('UPDATE markets SET qYes = ?, qNo = ? WHERE id = ?')->execute([$qYes, $qNo, $marketId]);
        $pdo->prepare('UPDATE users SET credits = credits - ? WHERE id = ?')->execute([$sign * $credits, $userId]);
        // costBasis = credits paid minus credits received, so profit = value now - costBasis.
        $pdo->prepare(
            'INSERT INTO positions (userId, marketId, sharesYes, sharesNo, costBasis) VALUES (?, ?, 0, 0, 0)
             ON DUPLICATE KEY UPDATE userId = userId'
        )->execute([$userId, $marketId]);
        $column = $side === 'yes' ? 'sharesYes' : 'sharesNo';
        $pdo->prepare("UPDATE positions SET $column = $column + ?, costBasis = costBasis + ? WHERE userId = ? AND marketId = ?")
            ->execute([$sign * $shares, $sign * $credits, $userId, $marketId]);
        $pdo->prepare(
            'INSERT INTO trades (userId, marketId, side, action, shares, credits, priceYesAfter) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )->execute([$userId, $marketId, $side, $action, $shares, $credits, round($priceAfter, 6)]);
        $pdo->prepare('INSERT INTO priceHistory (marketId, priceYes) VALUES (?, ?)')->execute([$marketId, round($priceAfter, 6)]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    return ['credits' => $credits, 'priceYesAfter' => round($priceAfter, 4)];
}
