<?php
function getCategories(): void {
    ok(db()->query('SELECT name FROM categories ORDER BY id')->fetchAll(PDO::FETCH_COLUMN));
}

function getMarkets(): void {
    ok(listMarkets(
        (string)($_GET['status'] ?? ''),
        (string)($_GET['category'] ?? ''),
        trim((string)($_GET['q'] ?? ''))
    ));
}

function getMarket(int $id): void {
    resolveMarketStatus();
    $market = findMarket($id);
    $user = currentUser();
    $isStaff = $user && $user['role'] === 'gestore';
    $isOwnProposal = $user && $market['status'] === 'proposed'
        && (int)$market['proposerId'] === (int)$user['id'];
    if (!in_array($market['status'], ['open', 'closed', 'resolved', 'voided'], true) && !$isStaff && !$isOwnProposal) {
        fail('notFound', 'Mercato non trovato.', 404);
    }
    $data = marketPublic($market);
    $data['history'] = marketHistory($id);
    if ($user) {
        $stmt = db()->prepare('SELECT sharesYes, sharesNo FROM positions WHERE userId = ? AND marketId = ?');
        $stmt->execute([$user['id'], $id]);
        $position = $stmt->fetch() ?: ['sharesYes' => 0, 'sharesNo' => 0];
        $data['myPosition'] = ['sharesYes' => (float)$position['sharesYes'], 'sharesNo' => (float)$position['sharesNo']];
    }
    ok($data);
}
