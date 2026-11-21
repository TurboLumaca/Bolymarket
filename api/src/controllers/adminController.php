<?php
function adminMarkets(): void {
    requireRole('gestore');
    resolveMarketStatus();
    $status = (string)($_GET['status'] ?? '');
    $sql = 'SELECT m.*, u.nickname AS proposerNickname FROM markets m LEFT JOIN users u ON u.id = m.proposerId';
    $params = [];
    if ($status !== '') {
        $sql .= ' WHERE m.status = ?';
        $params[] = $status;
    }
    $stmt = db()->prepare($sql . ' ORDER BY m.closesAt');
    $stmt->execute($params);
    ok(array_map(fn($m) => marketPublic($m) + [
        'proposerNickname' => $m['proposerNickname'],
        'liquidityB' => (float)$m['liquidityB'],
        'rejectionReason' => $m['rejectionReason'],
    ], $stmt->fetchAll()));
}

function approveMarket(int $id): void {
    requireRole('gestore');
    $market = findMarket($id, false);
    if ($market['status'] !== 'proposed') {
        fail('invalidState', 'Solo le proposte in attesa possono essere approvate.', 409);
    }
    $body = jsonBody() + [
        'question' => $market['question'], 'category' => $market['category'],
        'resolutionRule' => $market['resolutionRule'],
    ];
    [$question, $category, $rule] = checkMarketText($body, categoryNames());
    $closesAt = isset($body['closesAt']) ? parseClosesAt($body['closesAt']) : $market['closesAt'];
    $b = (float)($body['liquidityB'] ?? LIQUIDITY_DEFAULT);
    if ($b < 10 || $b > 1000) {
        fail('invalidLiquidity', 'La liquidità deve essere tra 10 e 1000.');
    }
    db()->prepare(
        "UPDATE markets SET question = ?, category = ?, resolutionRule = ?, closesAt = ?, liquidityB = ?, status = 'open'
         WHERE id = ?"
    )->execute([$question, $category, $rule, $closesAt, $b, $id]);
    db()->prepare('INSERT INTO priceHistory (marketId, priceYes) VALUES (?, 0.5)')->execute([$id]);
    ok(['id' => $id]);
}

function rejectMarket(int $id): void {
    requireRole('gestore');
    $reason = trim((string)(jsonBody()['reason'] ?? ''));
    if (mb_strlen($reason) < 5 || mb_strlen($reason) > 300) {
        fail('invalidReason', 'Scrivi il motivo del rifiuto (5-300 caratteri).');
    }
    $market = findMarket($id);
    if ($market['status'] !== 'proposed') {
        fail('invalidState', 'Solo le proposte in attesa possono essere rifiutate.', 409);
    }
    db()->prepare("UPDATE markets SET status = 'rejected', rejectionReason = ? WHERE id = ?")->execute([$reason, $id]);
    ok(['id' => $id]);
}

function resolveMarket(int $id): void {
    requireRole('gestore');
    resolveMarketStatus();
    $body = jsonBody();
    $outcome = $body['outcome'] ?? '';
    $evidence = trim((string)($body['evidence'] ?? ''));
    if (!in_array($outcome, ['yes', 'no'], true)) {
        fail('invalidOutcome', 'Scegli Sì o No.');
    }
    if (mb_strlen($evidence) < 10 || mb_strlen($evidence) > 300) {
        fail('invalidEvidence', 'Scrivi in una frase la prova (10-300 caratteri).');
    }
    settleMarket($id, 'resolve', $outcome, $evidence);
    ok(['id' => $id]);
}

function voidMarket(int $id): void {
    requireRole('gestore');
    settleMarket($id, 'void');
    ok(['id' => $id]);
}

function hideMarket(int $id): void {
    requireRole('gestore');
    $market = findMarket($id);
    if (in_array($market['status'], ['resolved', 'voided', 'rejected', 'hidden'], true)) {
        fail('invalidState', 'Questo mercato non può essere nascosto.', 409);
    }
    db()->prepare("UPDATE markets SET status = 'hidden' WHERE id = ?")->execute([$id]);
    ok(['id' => $id]);
}

function adminReports(): void {
    requireRole('gestore');
    ok(db()->query(
        "SELECT r.id, r.marketId, r.reason, r.createdAt, m.question, m.status AS marketStatus, u.nickname AS reporter
         FROM reports r JOIN markets m ON m.id = r.marketId JOIN users u ON u.id = r.reporterId
         WHERE r.status = 'open' ORDER BY r.createdAt DESC"
    )->fetchAll());
}

function closeReport(int $id): void {
    requireRole('gestore');
    db()->prepare("UPDATE reports SET status = 'closed' WHERE id = ?")->execute([$id]);
    ok(['id' => $id]);
}

function adminUsers(): void {
    requireRole('gestore');
    ok(db()->query(
        "SELECT id, nickname, email, credits, suspended FROM users WHERE role = 'studente' ORDER BY nickname"
    )->fetchAll());
}

function suspendUser(int $id): void {
    requireRole('gestore');
    $suspended = !empty(jsonBody()['suspended']) ? 1 : 0;
    $stmt = db()->prepare("UPDATE users SET suspended = ? WHERE id = ? AND role = 'studente'");
    $stmt->execute([$suspended, $id]);
    ok(['id' => $id, 'suspended' => $suspended]);
}
