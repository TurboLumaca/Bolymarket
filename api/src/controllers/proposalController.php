<?php
function categoryNames(): array {
    return db()->query('SELECT name FROM categories')->fetchAll(PDO::FETCH_COLUMN);
}

function postProposal(): void {
    $user = requireLogin();
    $body = jsonBody();
    [$question, $category, $rule] = checkMarketText($body, categoryNames());
    $closesAt = parseClosesAt($body['closesAt'] ?? null);

    $stmt = db()->prepare(
        "INSERT INTO markets (proposerId, question, category, resolutionRule, closesAt, status, liquidityB)
         VALUES (?, ?, ?, ?, ?, 'proposed', ?)"
    );
    $stmt->execute([$user['id'], $question, $category, $rule, $closesAt, LIQUIDITY_DEFAULT]);
    ok(['id' => (int)db()->lastInsertId()]);
}

function getMyProposals(): void {
    $user = requireLogin();
    $stmt = db()->prepare(
        'SELECT id, question, status, rejectionReason, closesAt FROM markets WHERE proposerId = ? ORDER BY id DESC'
    );
    $stmt->execute([$user['id']]);
    ok($stmt->fetchAll());
}

function postReport(int $marketId): void {
    $user = requireLogin();
    $reason = trim((string)(jsonBody()['reason'] ?? ''));
    if (mb_strlen($reason) < 5 || mb_strlen($reason) > 300) {
        fail('invalidReason', 'Spiega il motivo in 5-300 caratteri.');
    }
    $market = findMarket($marketId);
    if (!in_array($market['status'], ['open', 'closed', 'resolved'], true)) {
        fail('notFound', 'Mercato non trovato.', 404);
    }
    db()->prepare('INSERT INTO reports (marketId, reporterId, reason) VALUES (?, ?, ?)')
        ->execute([$marketId, $user['id'], $reason]);
    ok(['reported' => true]);
}
