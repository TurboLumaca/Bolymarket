<?php
// Resolving and voiding move credits for every position, inside one transaction.
function settleMarket(int $marketId, string $mode, ?string $outcome = null, ?string $evidence = null): void {
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $market = findMarket($marketId, true);
        if (!in_array($market['status'], ['closed', 'open'], true) ) {
            fail('invalidState', 'Questo mercato non può essere chiuso in questo stato.', 409);
        }
        if ($mode === 'resolve' && $market['status'] !== 'closed') {
            fail('invalidState', 'Puoi risolvere solo mercati già chiusi.', 409);
        }
        $positions = $pdo->prepare('SELECT userId, sharesYes, sharesNo, costBasis FROM positions WHERE marketId = ? FOR UPDATE');
        $positions->execute([$marketId]);
        $credit = $pdo->prepare('UPDATE users SET credits = credits + ? WHERE id = ?');
        foreach ($positions->fetchAll() as $p) {
            // Winning shares pay 1 credit each; a voided market refunds the net amount paid.
            $amount = $mode === 'void' ? $p['costBasis'] : ($outcome === 'yes' ? $p['sharesYes'] : $p['sharesNo']);
            if ((float)$amount != 0.0) {
                $credit->execute([$amount, $p['userId']]);
            }
        }
        $pdo->prepare(
            'UPDATE markets SET status = ?, outcome = ?, resolutionEvidence = ?, resolvedAt = NOW() WHERE id = ?'
        )->execute([$mode === 'void' ? 'voided' : 'resolved', $outcome, $evidence, $marketId]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}
